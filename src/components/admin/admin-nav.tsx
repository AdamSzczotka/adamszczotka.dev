"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: string;
}

interface AdminNavProps {
  items: AdminNavItem[];
  icons: Record<string, React.ReactNode>;
  variant: "sidebar" | "bar";
}

export function AdminNav({ items, icons, variant }: AdminNavProps) {
  const pathname = usePathname();

  // The editor lives under /admin/editor but belongs to whatever it is editing,
  // so only exact sections light up.
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  if (variant === "bar") {
    return (
      <div className="flex px-2 py-1.5 gap-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(item.href) ? "page" : undefined}
            className={`shrink-0 px-3 py-1.5 text-xs rounded-sm transition-colors ${
              isActive(item.href)
                ? "bg-foreground/10 text-foreground"
                : "text-muted hover:text-foreground hover:bg-foreground/5"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <nav className="p-2 space-y-0.5">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(item.href) ? "page" : undefined}
          className={`flex items-center gap-3 px-3 py-2 text-sm rounded-sm transition-colors ${
            isActive(item.href)
              ? "bg-foreground/10 text-foreground"
              : "text-muted hover:text-foreground hover:bg-foreground/5"
          }`}
        >
          <span className={isActive(item.href) ? "text-accent" : "text-muted"}>
            {icons[item.icon]}
          </span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
