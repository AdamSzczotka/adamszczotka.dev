"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const CATEGORIES = [
  { slug: "", label: "All" },
  { slug: "tech", label: "Tech" },
  { slug: "personal", label: "Personal" },
];

interface CategoryFilterProps {
  basePath: string;
}

export function CategoryFilter({ basePath }: CategoryFilterProps) {
  const searchParams = useSearchParams();
  const active = searchParams.get("category") || "";

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => {
        const isActive = cat.slug === active;
        const href = cat.slug
          ? `${basePath}?category=${cat.slug}`
          : basePath;

        return (
          <Link
            key={cat.slug}
            href={href}
            className={`font-mono text-xs px-3 py-1.5 border transition-colors ${
              isActive
                ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/5"
                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50 hover:text-[var(--foreground)]"
            }`}
          >
            {cat.label}
          </Link>
        );
      })}
    </div>
  );
}
