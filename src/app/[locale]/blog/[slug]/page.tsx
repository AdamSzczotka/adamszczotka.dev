import { db } from "@/lib/db";
import {
  posts,
  comments,
  postTags,
  tags,
  categories,
  series,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { locales } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { getTranslations, t } from "@/lib/i18n/get-translations";
import { generatePostMetadata } from "@/lib/utils/seo";
import { blogPostJsonLd } from "@/lib/utils/structured-data";
import { getRelatedPosts } from "@/lib/utils/related-posts";
import type { TocEntry } from "@/lib/utils/toc";
import { PostHero } from "@/components/blog/post-hero";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { ShareButtons } from "@/components/blog/share-buttons";
import { SeriesNav } from "@/components/blog/series-nav";
import { RelatedPosts } from "@/components/blog/related-posts";
import { CommentForm } from "@/app/(public)/blog/[slug]/comment-form";
import { CommentThread } from "@/components/blog/comment-thread";
import type { CommentData } from "@/components/blog/comment-thread";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const currentLocale = locale as Locale;

  let [post] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.locale, currentLocale)));

  if (!post && currentLocale !== "en") {
    [post] = await db
      .select()
      .from(posts)
      .where(and(eq(posts.slug, slug), eq(posts.locale, "en")));
  }

  if (!post) return { title: "Not Found" };
  return generatePostMetadata(post, currentLocale);
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const currentLocale = locale as Locale;

  let [post] = await db
    .select()
    .from(posts)
    .where(
      and(
        eq(posts.slug, slug),
        eq(posts.locale, currentLocale),
        eq(posts.isPublished, true),
      ),
    );

  if (!post && currentLocale !== "en") {
    [post] = await db
      .select()
      .from(posts)
      .where(
        and(
          eq(posts.slug, slug),
          eq(posts.locale, "en"),
          eq(posts.isPublished, true),
        ),
      );
  }

  if (!post) notFound();

  // Fetch tags
  const postTagRows = await db
    .select({ tagId: tags.id, tagName: tags.name })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, post.id));
  const postTagList = postTagRows.map((r) => ({ id: r.tagId, name: r.tagName }));

  // Fetch category name
  let categoryName: string | undefined;
  if (post.categoryId) {
    const [cat] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, post.categoryId))
      .limit(1);
    if (cat) {
      categoryName = currentLocale === "pl" ? cat.namePl : cat.nameEn;
    }
  }

  // Fetch series data
  let seriesData: typeof series.$inferSelect | null = null;
  let seriesPosts: {
    id: number;
    title: string;
    slug: string;
    seriesOrder: number | null;
  }[] = [];
  if (post.seriesId) {
    const [s] = await db
      .select()
      .from(series)
      .where(eq(series.id, post.seriesId))
      .limit(1);
    if (s) {
      seriesData = s;
      seriesPosts = await db
        .select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          seriesOrder: posts.seriesOrder,
        })
        .from(posts)
        .where(
          and(
            eq(posts.seriesId, post.seriesId),
            eq(posts.locale, currentLocale),
            eq(posts.isPublished, true),
          ),
        )
        .orderBy(posts.seriesOrder);
    }
  }

  // Fetch related posts
  const relatedPosts = await getRelatedPosts(post.id, currentLocale, 3);

  // Fetch comments (ordered asc for proper tree building)
  const approvedComments = await db
    .select({
      id: comments.id,
      postId: comments.postId,
      parentId: comments.parentId,
      authorName: comments.authorName,
      content: comments.content,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .where(
      and(eq(comments.postId, post.id), eq(comments.status, "APPROVED")),
    )
    .orderBy(comments.createdAt);

  const translations = await getTranslations(currentLocale);
  const dateLocale = currentLocale === "pl" ? "pl-PL" : "en-US";
  const toc = (post.toc as TocEntry[]) || [];
  const url = `https://adamszczotka.dev/${currentLocale}/blog/${post.slug}`;

  // JSON-LD structured data
  const jsonLd = blogPostJsonLd({ ...post, locale: currentLocale });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PostHero
        post={post}
        tags={postTagList}
        locale={currentLocale}
        categoryName={categoryName}
      />

      <div className="mx-auto max-w-5xl px-6">
        {/* Mobile TOC */}
        {toc.length >= 2 && (
          <div className="lg:hidden mt-8 mb-12 border border-[var(--border)] p-4 rounded-sm">
            <TableOfContents headings={toc} />
          </div>
        )}

        <div className="lg:flex lg:gap-12">
          {/* Sidebar */}
          <aside className="hidden lg:block lg:w-56 shrink-0">
            <div className="sticky top-24">
              <TableOfContents headings={toc} />
              <div className="mt-8 pt-8 border-t border-[var(--border)]">
                <ShareButtons url={url} title={post.title} />
              </div>
            </div>
          </aside>

          {/* Content */}
          <article className="min-w-0 flex-1">
            <header className="sr-only">
              <h1>{post.title}</h1>
              <address>Adam Szczotka</address>
              <time dateTime={(post.publishedAt || post.createdAt).toISOString()}>
                {(post.publishedAt || post.createdAt).toLocaleDateString(
                  dateLocale,
                  { year: "numeric", month: "long", day: "numeric" },
                )}
              </time>
            </header>

            {post.content && (
              <div
                className="prose prose-neutral dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            )}

            <footer>
              {/* Mobile share */}
              <div className="lg:hidden mt-12 pt-8 border-t border-[var(--border)]">
                <ShareButtons url={url} title={post.title} />
              </div>
            </footer>
          </article>
        </div>

        {seriesData && (
          <SeriesNav
            series={seriesData}
            posts={seriesPosts}
            currentPostId={post.id}
            locale={currentLocale}
          />
        )}
      </div>

      <RelatedPosts posts={relatedPosts} locale={currentLocale} />

      {/* Comment section */}
      <section className="mx-auto max-w-3xl px-6 pb-24">
        <div className="border-t border-[var(--border)] pt-12">
          <h2 className="text-lg font-medium">
            {t(translations, "blog.comments", "Comments")}
          </h2>

          {approvedComments.length > 0 && (
            <div className="mt-6">
              <CommentThread
                comments={approvedComments as CommentData[]}
                postId={post.id}
                dateLocale={dateLocale}
                replyLabel={t(translations, "blog.reply", "Reply")}
                translations={{
                  submitted: t(
                    translations,
                    "blog.comment_submitted",
                    "Comment submitted. It will appear after moderation.",
                  ),
                  yourName: t(translations, "blog.your_name", "Your name"),
                  yourComment: t(
                    translations,
                    "blog.your_comment",
                    "Your comment",
                  ),
                  submit: t(
                    translations,
                    "blog.submit_comment",
                    "Submit Comment",
                  ),
                  submitting: t(
                    translations,
                    "blog.submitting",
                    "Submitting...",
                  ),
                }}
              />
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-sm font-medium">
              {t(translations, "blog.leave_comment", "Leave a comment")}
            </h3>
            <div className="mt-4">
              <CommentForm
                postId={post.id}
                translations={{
                  submitted: t(
                    translations,
                    "blog.comment_submitted",
                    "Comment submitted. It will appear after moderation.",
                  ),
                  yourName: t(translations, "blog.your_name", "Your name"),
                  yourComment: t(
                    translations,
                    "blog.your_comment",
                    "Your comment",
                  ),
                  submit: t(
                    translations,
                    "blog.submit_comment",
                    "Submit Comment",
                  ),
                  submitting: t(
                    translations,
                    "blog.submitting",
                    "Submitting...",
                  ),
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
