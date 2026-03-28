import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { desc, eq, and } from "drizzle-orm";
import Link from "next/link";
import { locales } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { getTranslations, t } from "@/lib/i18n/get-translations";
import type { Metadata } from "next";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const translations = await getTranslations(locale as Locale);
  return {
    title: t(translations, "blog.title", "Blog"),
  };
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  const translations = await getTranslations(currentLocale);

  const publishedPosts = await db
    .select()
    .from(posts)
    .where(
      and(
        eq(posts.locale, currentLocale),
        eq(posts.category, "TECH"),
        eq(posts.isPublished, true),
      ),
    )
    .orderBy(desc(posts.createdAt));

  const localePath = currentLocale === "pl" ? "/pl" : "";
  const dateLocale = currentLocale === "pl" ? "pl-PL" : "en-US";

  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-3xl font-medium tracking-tight">
        {t(translations, "blog.title", "Blog")}
      </h1>
      <p className="mt-2 text-muted">
        {t(translations, "blog.description", "Thoughts on engineering, architecture, and building products.")}
      </p>

      <div className="mt-12 divide-y divide-border">
        {publishedPosts.map((post) => (
          <Link
            key={post.id}
            href={`${localePath}/blog/${post.slug}`}
            className="block py-6 group"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-medium group-hover:text-accent transition-colors">
                {post.title}
              </h2>
              <time className="shrink-0 text-xs text-muted font-mono">
                {post.createdAt.toLocaleDateString(dateLocale, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
            </div>
            {post.excerpt && (
              <p className="mt-2 text-sm text-muted leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </Link>
        ))}
        {publishedPosts.length === 0 && (
          <p className="py-6 text-sm text-muted">
            {t(translations, "home.blog.empty", "No posts yet.")}
          </p>
        )}
      </div>
    </section>
  );
}
