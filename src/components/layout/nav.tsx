import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Nav() {
  return (
    <header className="border-b border-border">
      <nav className="mx-auto max-w-5xl flex items-center justify-between px-6 h-16">
        <Link
          href="/"
          className="font-medium text-foreground hover:text-accent transition-colors"
        >
          adam szczotka
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/projects"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Projects
          </Link>
          <Link
            href="/blog"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Blog
          </Link>
          <Link
            href="/about"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            About
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
