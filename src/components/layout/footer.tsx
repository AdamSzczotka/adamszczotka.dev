"use client";

import { usePathname } from "next/navigation";
import { LocaleLink } from "./locale-link";

const footerTranslations = {
  en: { privacy: "Privacy" },
  pl: { privacy: "Prywatność" },
};

export function Footer() {
  const pathname = usePathname();
  const isPolish = pathname.startsWith("/pl");
  const ft = isPolish ? footerTranslations.pl : footerTranslations.en;
  return (
    <footer className="border-t border-border mt-auto bg-surface">
      <div className="mx-auto max-w-5xl px-6 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted">
          <span>&copy; 2026 Adam Szczotka</span>

          <div className="flex items-center gap-4 text-xs">
            <a
              href="https://github.com/AdamSzczotka"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/adam-szczotka"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://formattedai.pl"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              FormattedAI
            </a>
            <LocaleLink
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              {ft.privacy}
            </LocaleLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
