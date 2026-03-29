import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { locales } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { getTranslations, t } from "@/lib/i18n/get-translations";
import type { Metadata } from "next";
import { collectionPageJsonLd, safeJsonLd } from "@/lib/utils/structured-data";

const SITE_URL = "https://adamszczotka.dev";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const translations = await getTranslations(locale as Locale);
  const title = t(translations, "projects.title", "Projects");
  const description = t(
    translations,
    "projects.description",
    "Case studies and things I have built.",
  );

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/projects`,
      languages: {
        en: `${SITE_URL}/en/projects`,
        pl: `${SITE_URL}/pl/projects`,
        "x-default": `${SITE_URL}/en/projects`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}/projects`,
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

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  const translations = await getTranslations(currentLocale);

  let allProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.locale, currentLocale))
    .orderBy(desc(projects.createdAt));

  // Fallback to EN projects if none found for this locale
  if (allProjects.length === 0 && currentLocale !== "en") {
    allProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.locale, "en"))
      .orderBy(desc(projects.createdAt));
  }

  const localePath = currentLocale === "pl" ? "/pl" : "";

  const jsonLd = collectionPageJsonLd(
    t(translations, "projects.title", "Projects"),
    t(translations, "projects.description", "Case studies and things I have built."),
    `${SITE_URL}/${currentLocale}/projects`,
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <section className="mx-auto max-w-5xl px-6 py-24">
      <h1 className="text-3xl font-medium tracking-tight">
        {t(translations, "projects.title", "Projects")}
      </h1>
      <p className="mt-2 text-muted">
        {t(translations, "projects.description", "Case studies and things I have built.")}
      </p>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {allProjects.map((project) => (
          <Link
            key={project.id}
            href={`${localePath}/projects/${project.slug}`}
            className="group border border-border p-6 hover:border-accent/30 transition-all duration-300 rounded-sm"
          >
            <h2 className="text-lg font-medium group-hover:text-accent transition-colors">
              {project.title}
            </h2>
            {project.description && (
              <p className="mt-2 text-sm text-muted leading-relaxed">
                {project.description}
              </p>
            )}
            <div className="mt-4 flex gap-3 text-xs text-muted">
              {project.liveUrl && <span>Live</span>}
              {project.githubUrl && <span>Source</span>}
            </div>
          </Link>
        ))}
        {allProjects.length === 0 && (
          <p className="text-sm text-muted">No projects yet.</p>
        )}
      </div>
    </section>
    </>
  );
}
