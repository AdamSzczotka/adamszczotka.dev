import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/session";
import Link from "next/link";
import { togglePublished, deletePost } from "./actions";
import { getLocaleFromCookies } from "@/lib/i18n";
import { getTranslations, t } from "@/lib/i18n/get-translations";

export default async function AdminPostsPage() {
  await requireAdmin();

  const locale = await getLocaleFromCookies();
  const translations = await getTranslations(locale);

  const allPosts = await db
    .select()
    .from(posts)
    .orderBy(desc(posts.createdAt));

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">{t(translations, "admin.posts", "Posts")}</h1>
        <Link
          href="/admin/posts/new"
          className="bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity rounded-sm"
        >
          {t(translations, "admin.new_post", "New Post")}
        </Link>
      </div>

      <div className="mt-8 border border-border divide-y divide-border">
        {allPosts.length === 0 && (
          <p className="p-6 text-sm text-muted">{t(translations, "admin.no_posts", "No posts yet.")}</p>
        )}
        {allPosts.map((post) => (
          <div key={post.id} className="flex items-center justify-between p-4">
            <div>
              <Link
                href={`/admin/editor/post/${post.id}`}
                className="font-medium hover:text-accent transition-colors"
              >
                {post.title}
              </Link>
              <p className="mt-0.5 text-xs text-muted">
                {post.slug} &middot;{" "}
                {post.createdAt.toLocaleDateString("en-US")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <form
                action={async () => {
                  "use server";
                  await togglePublished(post.id, post.isPublished);
                }}
              >
                <button
                  type="submit"
                  className={`text-xs px-2 py-1 border rounded-sm transition-colors ${
                    post.isPublished
                      ? "border-green-500/30 text-green-500"
                      : "border-border text-muted"
                  }`}
                >
                  {post.isPublished ? t(translations, "admin.published", "Published") : t(translations, "admin.draft", "Draft")}
                </button>
              </form>
              <form
                action={async () => {
                  "use server";
                  await deletePost(post.id);
                }}
              >
                <button
                  type="submit"
                  className="text-xs text-red-500 hover:text-red-400 transition-colors"
                >
                  {t(translations, "admin.delete", "Delete")}
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
