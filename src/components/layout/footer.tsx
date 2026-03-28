import { LocaleLink } from "./locale-link";

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto bg-surface">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-muted">
          <span>&copy; 2026 Adam Szczotka</span>

          <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-green-500/20 bg-green-500/5 text-green-500">
            <span className="pulse-dot" />
            All systems operational
          </div>

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
              href="https://linkedin.com/in/adamszczotka"
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
              Privacy
            </LocaleLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
