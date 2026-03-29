import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getLocaleFromCookies } from "@/lib/i18n";
import { getTranslations, t } from "@/lib/i18n/get-translations";

const icons: Record<string, React.ReactNode> = {
  grid: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  "file-text": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  ),
  folder: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  ),
  layout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  ),
  tag: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  message: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
  globe: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  }).catch(() => null);

  const isLoggedIn = !!session;

  if (!isLoggedIn) {
    return <>{children}</>;
  }

  const locale = await getLocaleFromCookies();
  const translations = await getTranslations(locale);

  const navItems = [
    { href: "/admin/dashboard", label: t(translations, "admin.dashboard", "Dashboard"), icon: "grid" },
    { href: "/admin/posts", label: t(translations, "admin.posts", "Posts"), icon: "file-text" },
    { href: "/admin/projects", label: t(translations, "admin.projects", "Projects"), icon: "folder" },
    { href: "/admin/pages", label: t(translations, "admin.pages", "Pages"), icon: "layout" },
    { href: "/admin/tags", label: t(translations, "admin.tags", "Tags"), icon: "tag" },
    { href: "/admin/comments", label: t(translations, "admin.comments", "Comments"), icon: "message" },
    { href: "/admin/translations", label: t(translations, "admin.translations", "Translations"), icon: "globe" },
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="w-60 shrink-0 border-r border-border bg-surface hidden sm:block">
        <div className="p-4 border-b border-border">
          <p className="text-xs font-mono text-muted uppercase tracking-widest">
            {t(translations, "admin.title", "Admin")}
          </p>
          <p className="mt-1 text-sm truncate">{session.user.name}</p>
        </div>
        <nav className="p-2 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-foreground/5 rounded-sm transition-colors"
            >
              <span className="text-muted">{icons[item.icon]}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-2 border-t border-border">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 text-xs text-muted hover:text-foreground transition-colors"
          >
            {t(translations, "admin.back_to_site", "Back to site")}
          </Link>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        {/* Mobile admin nav */}
        <div className="sm:hidden border-b border-border overflow-x-auto">
          <div className="flex px-2 py-1.5 gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 px-3 py-1.5 text-xs text-muted hover:text-foreground hover:bg-foreground/5 rounded-sm transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
