import { db } from "@/lib/db";
import { posts, postTags, tags, categories } from "@/lib/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";
import { locales } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { getTranslations, t } from "@/lib/i18n/get-translations";
import type { Metadata } from "next";
import { BlogHeader } from "@/components/blog/blog-header";
import { CategoryFilter } from "@/components/blog/category-filter";
import { BlogGrid } from "@/components/blog/blog-grid";
import { BlogCard } from "@/components/blog/blog-card";
import { Suspense } from "react";
import { collectionPageJsonLd } from "@/lib/utils/structured-data";

const SITE_URL = "https://adamszczotka.dev";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

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
      locale: locale === "pl" ? "pl_PL" : "en_US",
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

  // Resolve category filter -- default to "tech" if no param
  const activeCategory = category || "tech";
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

  const jsonLd = collectionPageJsonLd(
    t(translations, "blog.title", "Blog"),
    t(translations, "blog.description", "Thoughts on engineering, architecture, and building products."),
    `${SITE_URL}/${currentLocale}/blog`,
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogHeader
        title={t(translations, "blog.title", "Blog")}
        description={t(
          translations,
          "blog.description",
          "Thoughts on engineering, architecture, and building products.",
        )}
      />

      <div className="mx-auto max-w-5xl px-6 pb-24">
        <div className="mb-8">
          <Suspense>
            <CategoryFilter basePath={`${localePath}/blog`} />
          </Suspense>
        </div>

        {publishedPosts.length === 0 ? (
          <p className="py-12 text-sm text-[var(--muted)]">
            {t(translations, "home.blog.empty", "No posts yet.")}
          </p>
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
