import { db } from "@/lib/db";
import { pages, pageBlocks } from "@/lib/db/schema";
import { desc, eq, count } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/session";
import Link from "next/link";
import { createPage, deletePage } from "./actions";

export default async function AdminPagesPage() {
  await requireAdmin();

  const allPages = await db
    .select({
      id: pages.id,
      slug: pages.slug,
      title: pages.title,
      createdAt: pages.createdAt,
      blockCount: count(pageBlocks.id),
    })
    .from(pages)
    .leftJoin(pageBlocks, eq(pages.id, pageBlocks.pageId))
    .groupBy(pages.id)
    .orderBy(desc(pages.createdAt));

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Pages</h1>
      </div>

      {/* New Page form */}
      <form action={createPage} className="mt-6 flex items-end gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-muted font-mono">
            Title
          </label>
          <input
            name="title"
            required
            placeholder="Page title"
            className="w-full border border-border bg-surface px-3 py-2 text-sm rounded-sm font-mono focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs text-muted font-mono">
            Slug
          </label>
          <input
            name="slug"
            placeholder="auto-generated-from-title"
            className="w-full border border-border bg-surface px-3 py-2 text-sm rounded-sm font-mono focus:outline-none focus:border-accent"
          />
        </div>
        <button
          type="submit"
          className="bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity rounded-sm"
        >
          New Page
        </button>
      </form>

      <div className="mt-8 border border-border divide-y divide-border">
        {allPages.length === 0 && (
          <p className="p-6 text-sm text-muted">No pages yet.</p>
        )}
        {allPages.map((page) => (
          <div
            key={page.id}
            className="flex items-center justify-between p-4"
          >
            <div>
              <Link
                href={`/admin/pages/${page.id}`}
                className="font-medium hover:text-accent transition-colors"
              >
                {page.title}
              </Link>
              <p className="mt-0.5 text-xs text-muted font-mono">
                /{page.slug} &middot; {page.blockCount}{" "}
                {page.blockCount === 1 ? "block" : "blocks"} &middot;{" "}
                {page.createdAt.toLocaleDateString("en-US")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/pages/${page.id}`}
                className="text-xs text-muted hover:text-accent transition-colors"
              >
                Edit
              </Link>
              <form
                action={async () => {
                  "use server";
                  await deletePage(page.id);
                }}
              >
                <button
                  type="submit"
                  className="text-xs text-red-500 hover:text-red-400 transition-colors"
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
