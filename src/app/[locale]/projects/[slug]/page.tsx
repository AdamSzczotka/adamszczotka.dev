import { db } from "@/lib/db";
import { projects, projectTags, tags } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { locales } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { getTranslations, t } from "@/lib/i18n/get-translations";
import { ImageSlider } from "@/components/ui/image-slider";

const PROJECT_SLIDES: Record<string, { src: string; alt: string; title: string; description: string }[]> = {
  formattedai: [
    {
      src: "/uploads/formatted_ai_main.avif",
      alt: "FormattedAI - Homepage",
      title: "Homepage",
      description: "Landing page with all available tools. Built with vanilla HTML/SCSS/JS, no frameworks.",
    },
    {
      src: "/uploads/formatted_ai_md.avif",
      alt: "FormattedAI - Markdown Formatter",
      title: "Markdown Formatter",
      description: "Convert AI-generated markdown (ChatGPT, Claude) into formatted text. Export to HTML, DOCX, or copy to Google Docs.",
    },
    {
      src: "/uploads/formatted_ai_avif.avif",
      alt: "FormattedAI - AVIF Converter",
      title: "AVIF Converter",
      description: "Client-side image compression via WebAssembly (jSquash). Batch convert PNG/JPG/WebP to AVIF with ZIP download.",
    },
    {
      src: "/uploads/formatted_ai_cssmini.avif",
      alt: "FormattedAI - CSS Minifier",
      title: "CSS Minifier & Formatter",
      description: "Minify or beautify CSS using CSSO. Real-time size comparison, runs entirely in the browser.",
    },
    {
      src: "/uploads/formatted_jsminifeir.avif",
      alt: "FormattedAI - JS Minifier",
      title: "JS Minifier & Formatter",
      description: "Minify or beautify JavaScript using Terser. Handles ES6+ syntax, instant output with size savings.",
    },
    {
      src: "/uploads/formatted_ai_seogeo.avif",
      alt: "FormattedAI - SEO/GEO Tag Generator",
      title: "SEO & GEO Tag Generator",
      description: "Generate meta tags, Open Graph, Twitter Cards, JSON-LD, llms.txt, and AI-optimized robots.txt for search and AI crawlers.",
    },
  ],
};

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
      {project.content && (() => {
        const slides = PROJECT_SLIDES[project.slug];
        const markerRegex = /<div[^>]*data-slider[^>]*><\/div>/;
        const match = slides ? project.content.match(markerRegex) : null;
        if (slides && match) {
          const idx = project.content.indexOf(match[0]);
          const before = project.content.slice(0, idx);
          const after = project.content.slice(idx + match[0].length);
          return (
            <div className="mx-auto max-w-3xl px-6 py-16">
              <div
                className="prose prose-neutral dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: before }}
              />
              <div className="my-10">
                <ImageSlider slides={slides} />
              </div>
              <div
                className="prose prose-neutral dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: after }}
              />
            </div>
          );
        }
        // Fallback: if no marker but slides exist, inject after <h2>Tools</h2>
        if (slides && project.content.includes("<h2>Tools</h2>")) {
          const parts = project.content.split("<h2>Tools</h2>");
          return (
            <div className="mx-auto max-w-3xl px-6 py-16">
              <div
                className="prose prose-neutral dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: parts[0] + "<h2>Tools</h2>" }}
              />
              <div className="my-10">
                <ImageSlider slides={slides} />
              </div>
              <div
                className="prose prose-neutral dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: parts.slice(1).join("") }}
              />
            </div>
          );
        }
        return (
          <div className="mx-auto max-w-3xl px-6 py-16">
            <div
              className="prose prose-neutral dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: project.content }}
            />
          </div>
        );
      })()}
    </article>
  );
}
