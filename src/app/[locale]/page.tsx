import { locales } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { PageRenderer } from "@/components/blocks/page-renderer";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const currentLocale = (locale as Locale) || "en";

  return <PageRenderer pageSlug="home" locale={currentLocale} />;
}
