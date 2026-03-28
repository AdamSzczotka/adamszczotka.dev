import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { locales } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

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

  // Fallback to EN if not found for this locale
  if (!project && currentLocale !== "en") {
    [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.slug, slug), eq(projects.locale, "en")));
  }

  if (!project) return { title: "Not Found" };
  return { title: project.title };
}

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params;
  const currentLocale = locale as Locale;

  let [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.slug, slug), eq(projects.locale, currentLocale)));

  // Fallback to EN if not found for this locale
  if (!project && currentLocale !== "en") {
    [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.slug, slug), eq(projects.locale, "en")));
  }

  if (!project) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-3xl font-medium tracking-tight">{project.title}</h1>
      {project.description && (
        <p className="mt-4 text-lg text-muted">{project.description}</p>
      )}

      <div className="mt-6 flex gap-4 text-sm">
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-border px-3 py-1.5 hover:bg-foreground/5 transition-colors rounded-sm"
          >
            View Live
          </a>
        )}
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-border px-3 py-1.5 hover:bg-foreground/5 transition-colors rounded-sm"
          >
            Source Code
          </a>
        )}
      </div>

      {project.content && (
        <div
          className="prose prose-neutral dark:prose-invert mt-12 max-w-none"
          dangerouslySetInnerHTML={{ __html: project.content }}
        />
      )}
    </article>
  );
}
