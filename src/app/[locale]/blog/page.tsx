import { db } from "@/lib/db";
import { posts, postTags, tags, categories } from "@/lib/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";
import type { Locale } from "@/lib/i18n";
import { getTranslations, t } from "@/lib/i18n/get-translations";
import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { BlogHeader } from "@/components/blog/blog-header";
import { CategoryFilter } from "@/components/blog/category-filter";
import { BlogGrid } from "@/components/blog/blog-grid";
import { BlogCard } from "@/components/blog/blog-card";
import Link from "next/link";
import { Suspense } from "react";
import { collectionPageJsonLd } from "@/lib/utils/structured-data";

const SITE_URL = "https://adamszczotka.dev";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const translations = await getTranslations(locale as Locale);
  const title = t(translations, "blog.title", "Blog");
  const description = t(
    translations,
    "blog.description",
    "Thoughts on engineering, architecture, and building products.",
  );

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/blog`,
      languages: {
        en: `${SITE_URL}/en/blog`,
        pl: `${SITE_URL}/pl/blog`,
        "x-default": `${SITE_URL}/en/blog`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}/blog`,
      type: "website",
      siteName: "Adam Szczotka",
      locale: locale === "pl" ? "pl_PL" : "en_US",
      alternateLocale: locale === "pl" ? "en_US" : "pl_PL",
      images: [
        {
          url: `${SITE_URL}/api/og?title=${encodeURIComponent(title)}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}/api/og?title=${encodeURIComponent(title)}`],
    },
    robots: { index: true, follow: true },
  };
}

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { category } = await searchParams;
  const currentLocale = locale as Locale;
  const translations = await getTranslations(currentLocale);
  const localePath = currentLocale === "pl" ? "/pl" : "";

  // Resolve category filter -- default to "all" so uncategorized posts stay visible
  const activeCategory = category || "all";
  let categoryId: number | undefined;
  if (activeCategory !== "all") {
    const [cat] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, activeCategory))
      .limit(1);
    if (cat) categoryId = cat.id;
  }

  // Query posts with conditions
  const conditions = [
    eq(posts.locale, currentLocale),
    eq(posts.isPublished, true),
  ];
  if (categoryId !== undefined) {
    conditions.push(eq(posts.categoryId, categoryId));
  }

  const publishedPosts = await db
    .select()
    .from(posts)
    .where(and(...conditions))
    .orderBy(desc(posts.publishedAt), desc(posts.createdAt));

  // Fetch tags for all posts
  const postIds = publishedPosts.map((p) => p.id);
  let tagsByPostId: Record<number, { id: number; name: string }[]> = {};

  if (postIds.length > 0) {
    const tagRows = await db
      .select({
        postId: postTags.postId,
        tagId: tags.id,
        tagName: tags.name,
      })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagId, tags.id))
      .where(
        sql`${postTags.postId} IN (${sql.join(
          postIds.map((id) => sql`${id}`),
          sql`, `,
        )})`,
      );

    tagsByPostId = tagRows.reduce(
      (acc, row) => {
        if (!acc[row.postId]) acc[row.postId] = [];
        acc[row.postId].push({ id: row.tagId, name: row.tagName });
        return acc;
      },
      {} as Record<number, { id: number; name: string }[]>,
    );
  }

  // Fetch all categories for name lookup
  const allCategories = await db.select().from(categories);
  const categoryMap = new Map(allCategories.map((c) => [c.id, c]));

  // Post counts per category, so the filter can show how much is behind each
  // chip and skip the ones that would lead to an empty page.
  const categoryCounts = await db
    .select({
      categoryId: posts.categoryId,
      count: sql<number>`count(*)::int`,
    })
    .from(posts)
    .where(and(eq(posts.locale, currentLocale), eq(posts.isPublished, true)))
    .groupBy(posts.categoryId);

  const totalPosts = categoryCounts.reduce((sum, row) => sum + row.count, 0);
  const filterOptions = [
    { slug: "all", label: t(translations, "blog.filter.all", "All"), count: totalPosts },
    ...categoryCounts
      .flatMap((row) => {
        const cat = row.categoryId ? categoryMap.get(row.categoryId) : null;
        if (!cat) return [];
        return [
          {
            slug: cat.slug,
            label: currentLocale === "pl" ? cat.namePl : cat.nameEn,
            count: row.count,
          },
        ];
      })
      .sort((a, b) => b.count - a.count),
  ];

  const jsonLd = collectionPageJsonLd(
    t(translations, "blog.title", "Blog"),
    t(translations, "blog.description", "Thoughts on engineering, architecture, and building products."),
    `${SITE_URL}/${currentLocale}/blog`,
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <BlogHeader
        title={t(translations, "blog.title", "Blog")}
        description={t(
          translations,
          "blog.description",
          "Thoughts on engineering, architecture, and building products.",
        )}
      />

      <div className="mx-auto max-w-5xl px-6 pb-24">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Suspense>
            <CategoryFilter
              basePath={`${localePath}/blog`}
              options={filterOptions}
            />
          </Suspense>
          <a
            href="/feed.xml"
            className="font-mono text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
          >
            {t(translations, "blog.rss", "RSS feed")}
          </a>
        </div>

        {publishedPosts.length === 0 ? (
          <div className="border border-dashed border-[var(--border)] rounded-sm py-16 px-6 text-center">
            <p className="font-medium">
              {t(translations, "blog.empty.title", "Nothing here yet")}
            </p>
            <p className="mt-2 mx-auto max-w-sm text-sm text-[var(--muted)] leading-relaxed">
              {activeCategory === "all"
                ? t(
                    translations,
                    "blog.empty.body",
                    "The first posts are on the way - engineering notes from things I actually build and ship.",
                  )
                : t(
                    translations,
                    "blog.empty.category",
                    "No posts in this category yet.",
                  )}
            </p>
            {activeCategory !== "all" && (
              <Link
                href={`${localePath}/blog`}
                className="mt-6 inline-block font-mono text-xs border border-[var(--border)] px-3 py-1.5 rounded-sm hover:border-[var(--accent)]/50 transition-colors"
              >
                {t(translations, "blog.filter.all", "All")}
              </Link>
            )}
          </div>
        ) : (
          <BlogGrid>
            {publishedPosts.map((post, index) => {
              const cat = post.categoryId
                ? categoryMap.get(post.categoryId)
                : null;
              const categoryName = cat
                ? currentLocale === "pl"
                  ? cat.namePl
                  : cat.nameEn
                : undefined;

              return (
                <BlogCard
                  key={post.id}
                  post={post}
                  tags={tagsByPostId[post.id] || []}
                  locale={currentLocale}
                  featured={index === 0}
                  categoryName={categoryName}
                />
              );
            })}
          </BlogGrid>
        )}
      </div>
    </>
  );
}
