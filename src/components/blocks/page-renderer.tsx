import { db } from "@/lib/db";
import { pages, pageBlocks, projects, posts } from "@/lib/db/schema";
import { eq, asc, desc, and } from "drizzle-orm";
import { getTranslations } from "@/lib/i18n/get-translations";
import type { Locale } from "@/lib/i18n";
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

  // Group consecutive project_showcase blocks
  const elements: React.ReactNode[] = [];
  let projectGroup: { block: typeof blocks[0]; project: typeof projects.$inferSelect }[] = [];
  let projectIndex = 0;

  const flushProjects = () => {
    if (projectGroup.length === 0) return;
    elements.push(
      <section key={`projects-${projectGroup[0].block.id}`} id="projects" className="bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <p className="text-xs font-mono text-muted uppercase tracking-widest">
            {t["home.projects.label"] || "Selected Work"}
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">
            {t["home.projects.title"] || "Projects"}
          </h2>
          <div className="mt-16 space-y-24">
            {projectGroup.map((item, i) => (
              <ProjectShowcaseBlock
                key={item.block.id}
                project={item.project}
                index={i}
                locale={locale}
              />
            ))}
          </div>
        </div>
      </section>,
    );
    projectGroup = [];
  };

  for (const block of blocks) {
    const data = locale === "pl"
      ? (block.dataPl as Record<string, unknown>)
      : (block.dataEn as Record<string, unknown>);

    if (block.type === "project_showcase") {
      const projectId = data.projectId as number;
      if (!projectId) continue;

      let [project] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, projectId), eq(projects.locale, locale)));

      if (!project) {
        [project] = await db.select().from(projects).where(eq(projects.id, projectId));
      }

      if (project) {
        projectGroup.push({ block, project });
      }
      continue;
    }

    // If we hit a non-project block, flush any accumulated projects
    flushProjects();

    switch (block.type) {
      case "hero":
        elements.push(
          <HeroBlock
            key={block.id}
            data={data as { title?: string; subtitle?: string; description?: string; buttonText?: string; buttonUrl?: string }}
          />,
        );
        break;

      case "blog_feed": {
        const count = (data.count as number) || 3;
        const recentPosts = await db
          .select()
          .from(posts)
          .where(and(eq(posts.isPublished, true), eq(posts.locale, locale)))
          .orderBy(desc(posts.createdAt))
          .limit(count);

        const feedPosts = recentPosts.length > 0
          ? recentPosts
          : await db
              .select()
              .from(posts)
              .where(and(eq(posts.isPublished, true), eq(posts.locale, "en")))
              .orderBy(desc(posts.createdAt))
              .limit(count);

        elements.push(<BlogFeedBlock key={block.id} posts={feedPosts} locale={locale} t={t} />);
        break;
      }

      case "cta":
        elements.push(
          <CtaBlock
            key={block.id}
            data={data as { heading?: string; text?: string; buttonText?: string; email?: string }}
          />,
        );
        break;

      case "text":
        elements.push(
          <TextBlock
            key={block.id}
            data={data as { html?: string }}
          />,
        );
        break;
    }
  }

  // Flush remaining projects
  flushProjects();

  return <>{elements}</>;
}
