import { locales } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { getTranslations, t } from "@/lib/i18n/get-translations";
import type { Metadata } from "next";
import { personJsonLd } from "@/lib/utils/structured-data";

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
  const title = t(translations, "about.title", "About");
  const description = t(
    translations,
    "about.bio_1",
    "I am Adam Szczotka, a Software Engineer and Product Architect. I have been coding since the age of 11. I build scalable backends, fast mobile applications, and privacy-first web tools.",
  );

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/about`,
      languages: {
        en: `${SITE_URL}/en/about`,
        pl: `${SITE_URL}/pl/about`,
        "x-default": `${SITE_URL}/en/about`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}/about`,
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

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  const translations = await getTranslations(currentLocale);
  const jsonLd = personJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="text-3xl font-medium tracking-tight">
          {t(translations, "about.title", "About")}
        </h1>

        <div className="mt-8 space-y-6 text-muted leading-relaxed">
          <p>
            {t(translations, "about.bio_1", "I am Adam Szczotka, a Software Engineer and Product Architect. I have been coding since the age of 11. I build scalable backends, fast mobile applications, and privacy-first web tools.")}
          </p>
          <p>
            {t(translations, "about.bio_2", "My approach is shaped by discipline built through years of competitive sports and a personal transformation that included losing 70 kg. That same discipline drives how I build software: methodically, with attention to detail, and always delivering business value.")}
          </p>
          <p>
            {t(translations, "about.bio_3", "I believe in building tools that respect user privacy. My projects like FormattedAI are 100% client-side with zero cookies and zero tracking. When I write code, I think about the person using it.")}
          </p>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <h2 className="text-lg font-medium">
            {t(translations, "about.stack", "Stack")}
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "TypeScript",
              "React / React Native",
              "Next.js",
              "Python",
              "Django",
              "PostgreSQL",
              "Docker",
              "Nginx",
              "GCP",
            ].map((tech) => (
              <span
                key={tech}
                className="font-mono text-xs text-muted border border-border px-2 py-1 rounded-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
