import { db } from "@/lib/db";
import { pages, pageBlocks, projects, posts } from "@/lib/db/schema";
import { eq, asc, desc, and } from "drizzle-orm";
import { getTranslations } from "@/lib/i18n/get-translations";
import type { Locale } from "@/lib/i18n";
import { getBlockData } from "@/lib/pages/render-blocks";
import { HeroBlock } from "./hero-block";
import { ProjectShowcaseBlock } from "./project-showcase-block";
import { BlogFeedBlock } from "./blog-feed-block";
import { CtaBlock } from "./cta-block";
import { TextBlock } from "./text-block";

interface PageRendererProps {
  pageSlug: string;
  locale: Locale;
}

export async function PageRenderer({ pageSlug, locale }: PageRendererProps) {
  const [page] = await db
    .select()
    .from(pages)
    .where(eq(pages.slug, pageSlug));

  if (!page) {
    return <p className="text-muted text-center py-24">Page not found.</p>;
  }

  const blocks = await db
    .select()
    .from(pageBlocks)
    .where(eq(pageBlocks.pageId, page.id))
    .orderBy(asc(pageBlocks.position));

  const t = await getTranslations(locale);

  let projectIndex = 0;

  const rendered = await Promise.all(
    blocks.map(async (block) => {
      const data = locale === "pl"
        ? (block.dataPl as Record<string, unknown>)
        : (block.dataEn as Record<string, unknown>);

      switch (block.type) {
        case "hero":
          return <HeroBlock key={block.id} data={data as { title?: string; subtitle?: string; description?: string; buttonText?: string; buttonUrl?: string }} />;

        case "project_showcase": {
          const projectId = data.projectId as number;
          if (!projectId) return null;
          const [project] = await db
            .select()
            .from(projects)
            .where(and(eq(projects.id, projectId), eq(projects.locale, locale)));

          // Fallback to EN if no locale-specific version
          const [fallback] = !project
            ? await db.select().from(projects).where(eq(projects.id, projectId))
            : [project];

          if (!fallback) return null;

          const idx = projectIndex++;
          return (
            <ProjectShowcaseBlock
              key={block.id}
              project={fallback}
              index={idx}
              locale={locale}
            />
          );
        }

        case "blog_feed": {
          const count = (data.count as number) || 3;
          const recentPosts = await db
            .select()
            .from(posts)
            .where(and(eq(posts.isPublished, true), eq(posts.locale, locale)))
            .orderBy(desc(posts.createdAt))
            .limit(count);

          // Fallback to EN posts if none in current locale
          const feedPosts = recentPosts.length > 0
            ? recentPosts
            : await db
                .select()
                .from(posts)
                .where(and(eq(posts.isPublished, true), eq(posts.locale, "en")))
                .orderBy(desc(posts.createdAt))
                .limit(count);

          return <BlogFeedBlock key={block.id} posts={feedPosts} locale={locale} t={t} />;
        }

        case "cta":
          return <CtaBlock key={block.id} data={data as { heading?: string; text?: string; buttonText?: string; email?: string }} />;

        case "text":
          return <TextBlock key={block.id} data={data as { html?: string }} />;

        default:
          return null;
      }
    }),
  );

  return <>{rendered}</>;
}
