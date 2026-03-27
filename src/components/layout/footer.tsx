export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-8 text-sm text-muted">
        <span>&copy; 2026 Adam Szczotka</span>
        <div className="flex items-center gap-4">
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
        </div>
      </div>
    </footer>
  );
}
