"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LocaleSwitcher } from "./locale-switcher";
import { ThemeToggle } from "./theme-toggle";

const linksMap = {
  en: [
    { href: "/projects", label: "Projects" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
  ],
  pl: [
    { href: "/projects", label: "Projekty" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "O mnie" },
  ],
};

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isPolish = pathname.startsWith("/pl");
  const prefix = isPolish ? "/pl" : "";
  const links = isPolish ? linksMap.pl : linksMap.en;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-border">
        <nav className="mx-auto max-w-5xl flex items-center justify-between px-6 h-16">
          <Link
            href={`${prefix}/`}
            className="text-sm font-medium tracking-tight text-foreground hover:text-accent transition-colors"
          >
            adam szczotka
          </Link>

          <div className="hidden sm:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={`${prefix}${link.href}`}
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <LocaleSwitcher />
            <ThemeToggle />
          </div>

          <button
            onClick={() => setOpen(true)}
            className="sm:hidden h-9 w-9 flex items-center justify-center"
            aria-label="Open menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </nav>
      </header>

      {open && (
        <div className="fixed inset-0 z-[100] sm:hidden">
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-0 right-0 h-full w-64 glass-nav border-l border-border p-6 flex flex-col gap-6">
            <button
              onClick={() => setOpen(false)}
              className="self-end h-9 w-9 flex items-center justify-center text-muted hover:text-foreground transition-colors"
              aria-label="Close menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            {links.map((link) => (
              <Link
                key={link.href}
                href={`${prefix}${link.href}`}
                onClick={() => setOpen(false)}
                className="text-lg text-muted hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-3">
              <LocaleSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
