import type { Locale } from "@/lib/i18n";
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
  return (
    <div data-locale={locale as Locale} className="flex-1 flex flex-col">
      <Nav />
      {/* pt-16 clears the fixed nav */}
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
