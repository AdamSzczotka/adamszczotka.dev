"use client";

import { usePathname, useRouter } from "next/navigation";

export function LocaleSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const isPolish = pathname.startsWith("/pl");
  const currentLocale = isPolish ? "pl" : "en";

  const switchLocale = () => {
    if (isPolish) {
      const newPath = pathname.replace(/^\/pl/, "") || "/";
      router.push(newPath);
    } else {
      router.push(`/pl${pathname}`);
    }
  };

  return (
    <button
      onClick={switchLocale}
      className="h-9 px-2 flex items-center gap-1.5 border border-border rounded-sm hover:bg-foreground/5 transition-colors font-mono text-xs"
      aria-label="Switch language"
    >
      <span className={currentLocale === "en" ? "text-foreground" : "text-muted"}>
        EN
      </span>
      <span className="text-border">/</span>
      <span className={currentLocale === "pl" ? "text-foreground" : "text-muted"}>
        PL
      </span>
    </button>
  );
}
