import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { posts, comments } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import Link from "next/link";
import { getLocaleFromCookies } from "@/lib/i18n";
import { getTranslations, t } from "@/lib/i18n/get-translations";

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/admin/login");
  }

  const locale = await getLocaleFromCookies();
  const translations = await getTranslations(locale);

  const [postCount] = await db.select({ count: count() }).from(posts);
  const [pendingCount] = await db
    .select({ count: count() })
    .from(comments)
    .where(eq(comments.status, "PENDING"));

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">{t(translations, "admin.dashboard", "Dashboard")}</h1>
          <p className="mt-1 text-sm text-muted">
            {t(translations, "admin.welcome", "Welcome,")} {session.user.name}
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border border-border p-6">
          <p className="text-sm text-muted">{t(translations, "admin.posts", "Posts")}</p>
          <p className="mt-1 text-3xl font-medium">{postCount.count}</p>
        </div>
        <div className="border border-border p-6">
          <p className="text-sm text-muted">{t(translations, "admin.pending_comments", "Pending Comments")}</p>
          <p className="mt-1 text-3xl font-medium">{pendingCount.count}</p>
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <Link
          href="/admin/posts"
          className="border border-border px-4 py-2 text-sm hover:bg-foreground/5 transition-colors rounded-sm"
        >
          {t(translations, "admin.manage_posts", "Manage Posts")}
        </Link>
        <Link
          href="/admin/projects"
          className="border border-border px-4 py-2 text-sm hover:bg-foreground/5 transition-colors rounded-sm"
        >
          {t(translations, "admin.manage_projects", "Manage Projects")}
        </Link>
        <Link
          href="/admin/comments"
          className="border border-border px-4 py-2 text-sm hover:bg-foreground/5 transition-colors rounded-sm"
        >
          {t(translations, "admin.moderate_comments", "Moderate Comments")}
        </Link>
      </div>
    </div>
  );
}
