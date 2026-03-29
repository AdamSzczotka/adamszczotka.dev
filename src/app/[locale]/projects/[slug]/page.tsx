import { db } from "@/lib/db";
import { projects, projectTags, tags } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { locales } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
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

  let [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.slug, slug), eq(projects.locale, currentLocale)));

  if (!project && currentLocale !== "en") {
    [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.slug, slug), eq(projects.locale, "en")));
  }

  if (!project) return { title: "Not Found" };
  return {
    title: project.title,
    description: project.description || undefined,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params;
  const currentLocale = locale as Locale;

  let [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.slug, slug), eq(projects.locale, currentLocale)));

  if (!project && currentLocale !== "en") {
    [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.slug, slug), eq(projects.locale, "en")));
  }

  if (!project) notFound();

  const translations = await getTranslations(currentLocale);

  const pTags = await db
    .select({ name: tags.name })
    .from(projectTags)
    .innerJoin(tags, eq(tags.id, projectTags.tagId))
    .where(eq(projectTags.projectId, project.id));

  return (
    <article>
      {/* Hero */}
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-4xl px-6 pt-32 pb-16">
          <div className="flex items-center gap-3 text-xs font-mono text-[var(--muted)] uppercase tracking-widest">
            <span className="text-[var(--accent)]">Case Study</span>
            {pTags.length > 0 && (
              <>
                <span className="w-px h-3 bg-[var(--border)]" />
                <span>{pTags.map((t) => t.name).join(" / ")}</span>
              </>
            )}
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            {project.title}
          </h1>
          {project.description && (
            <p className="mt-4 max-w-2xl text-lg text-[var(--muted)] leading-relaxed">
              {project.description}
            </p>
          )}
          <div className="mt-8 flex gap-3">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-spring inline-flex items-center gap-2 bg-[var(--accent)] text-[var(--accent-foreground)] px-5 py-2.5 text-sm font-medium rounded-sm"
              >
                {t(translations, "projects.view_live", "View Live")}
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-spring inline-flex items-center gap-2 border border-[var(--border)] px-5 py-2.5 text-sm font-medium hover:border-[var(--accent)]/50 rounded-sm"
              >
                {t(translations, "projects.source_code", "Source Code")}
              </a>
            )}
          </div>
        </div>

        {/* Cover image */}
        {project.coverImage && (
          <div className="mx-auto max-w-5xl px-6 pb-16">
            <div className="border border-[var(--border)] rounded-sm overflow-hidden">
              <Image
                src={project.coverImage}
                alt={project.title}
                width={1200}
                height={675}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      {project.content && (
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div
            className="prose prose-neutral dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: project.content }}
          />
        </div>
      )}
    </article>
  );
}
