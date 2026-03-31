import type { Locale } from "@/lib/i18n";

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
    <div data-locale={locale as Locale}>
      {children}
    </div>
  );
}
