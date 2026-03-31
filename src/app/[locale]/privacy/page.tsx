import { locales } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import type { Metadata } from "next";
import { PageRenderer } from "@/components/blocks/page-renderer";

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
    locale === "pl" ? "Polityka prywatnosci" : "Privacy Policy";
  const description =
    locale === "pl"
      ? "Polityka prywatnosci i zasady przetwarzania danych."
      : "Privacy policy and data handling.";

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/privacy`,
      languages: {
        en: `${SITE_URL}/en/privacy`,
        pl: `${SITE_URL}/pl/privacy`,
        "x-default": `${SITE_URL}/en/privacy`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}/privacy`,
      type: "website",
      siteName: "Adam Szczotka",
      locale: locale === "pl" ? "pl_PL" : "en_US",
      alternateLocale: locale === "pl" ? "en_US" : "pl_PL",
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

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  const currentLocale = (locale as Locale) || "en";

  return <PageRenderer pageSlug="privacy" locale={currentLocale} />;
}
