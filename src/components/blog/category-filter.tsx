"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export interface CategoryFilterOption {
  slug: string;
  label: string;
  count: number;
}

interface CategoryFilterProps {
  basePath: string;
  options: CategoryFilterOption[];
}

export function CategoryFilter({ basePath, options }: CategoryFilterProps) {
  const searchParams = useSearchParams();
  const active = searchParams.get("category") || "all";

  // One chip is just a label for the whole list, not a choice.
  if (options.length < 2) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = option.slug === active;

        return (
          <Link
            key={option.slug}
            href={`${basePath}?category=${option.slug}`}
            aria-current={isActive ? "page" : undefined}
            className={`font-mono text-xs px-3 py-1.5 border rounded-sm transition-colors ${
              isActive
                ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/5"
                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50 hover:text-[var(--foreground)]"
            }`}
          >
            {option.label}
            <span className="ml-1.5 text-[var(--muted)]/70">{option.count}</span>
          </Link>
        );
      })}
    </div>
  );
}
