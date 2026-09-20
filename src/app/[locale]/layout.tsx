import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "pl" }];
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // [locale] matches any single segment, so without this every unknown path
  // (/foo, /api, a typo, a bot probe) reached the pages below with a bogus
  // locale and blew up as a 500 instead of a 404.
  if (!locales.includes(locale as Locale)) notFound();

  return (
    <div data-locale={locale as Locale} className="flex-1 flex flex-col">
      <Nav />
      {/* pt-16 clears the fixed nav */}
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
