import { locales } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import type { Metadata } from "next";
import { PageRenderer } from "@/components/blocks/page-renderer";
import { websiteJsonLd } from "@/lib/utils/structured-data";

const SITE_URL = "https://adamszczotka.dev";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const title =
    locale === "pl"
      ? "Adam Szczotka -- Software Engineer"
      : "Adam Szczotka -- Software Engineer";
  const description =
    locale === "pl"
      ? "Software Engineer & Product Architect. Skalowalne backendy, szybkie aplikacje mobilne, narzedzia webowe z priorytetem prywatnosci."
      : "Software Engineer & Product Architect. Scalable backends, fast mobile apps, privacy-first web tools.";

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        en: `${SITE_URL}/en`,
        pl: `${SITE_URL}/pl`,
        "x-default": `${SITE_URL}/en`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}`,
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

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const currentLocale = (locale as Locale) || "en";
  const jsonLd = websiteJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageRenderer pageSlug="home" locale={currentLocale} />
    </>
  );
}
