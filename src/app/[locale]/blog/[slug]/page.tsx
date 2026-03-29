import { db } from "@/lib/db";
import { posts, comments } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { locales } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { CommentForm } from "@/app/(public)/blog/[slug]/comment-form";
import { getTranslations, t } from "@/lib/i18n/get-translations";

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

  // Fallback to EN
  if (!post && currentLocale !== "en") {
    [post] = await db
      .select()
      .from(posts)
      .where(and(eq(posts.slug, slug), eq(posts.locale, "en")));
  }

  if (!post) return { title: "Not Found" };
  return { title: post.title, description: post.excerpt || undefined };
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

  // Fallback to EN if not found for this locale
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

  const approvedComments = await db
    .select()
    .from(comments)
    .where(
      and(eq(comments.postId, post.id), eq(comments.status, "APPROVED")),
    )
    .orderBy(desc(comments.createdAt));

  const translations = await getTranslations(currentLocale);
  const dateLocale = currentLocale === "pl" ? "pl-PL" : "en-US";

  return (
    <article className="mx-auto max-w-3xl px-6 py-24">
      <header>
        <time className="text-xs text-muted font-mono">
          {post.createdAt.toLocaleDateString(dateLocale, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
        <h1 className="mt-2 text-3xl font-medium tracking-tight">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="mt-4 text-lg text-muted">{post.excerpt}</p>
        )}
      </header>

      {post.content && (
        <div
          className="prose prose-neutral dark:prose-invert mt-12 max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      )}

      <section className="mt-16 border-t border-border pt-12">
        <h2 className="text-lg font-medium">{t(translations, "blog.comments", "Comments")}</h2>

        {approvedComments.length > 0 && (
          <div className="mt-6 space-y-6">
            {approvedComments.map((comment) => (
              <div key={comment.id}>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium">
                    {comment.authorName}
                  </span>
                  <time className="text-xs text-muted font-mono">
                    {comment.createdAt.toLocaleDateString(dateLocale, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </div>
                <p className="mt-1 text-sm text-muted">{comment.content}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-sm font-medium">{t(translations, "blog.leave_comment", "Leave a comment")}</h3>
          <div className="mt-4">
            <CommentForm
              postId={post.id}
              translations={{
                submitted: t(translations, "blog.comment_submitted", "Comment submitted. It will appear after moderation."),
                yourName: t(translations, "blog.your_name", "Your name"),
                yourComment: t(translations, "blog.your_comment", "Your comment"),
                submit: t(translations, "blog.submit_comment", "Submit Comment"),
                submitting: t(translations, "blog.submitting", "Submitting..."),
              }}
            />
          </div>
        </div>
      </section>
    </article>
  );
}
