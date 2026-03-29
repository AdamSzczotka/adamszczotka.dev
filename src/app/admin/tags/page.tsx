import { db } from "@/lib/db";
import { tags } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/session";
import { createTag, deleteTag } from "./actions";
import { getLocaleFromCookies } from "@/lib/i18n";
import { getTranslations, t } from "@/lib/i18n/get-translations";

export default async function AdminTagsPage() {
  await requireAdmin();

  const locale = await getLocaleFromCookies();
  const translations = await getTranslations(locale);

  const allTags = await db.select().from(tags).orderBy(asc(tags.name));

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-medium">{t(translations, "admin.tags", "Tags")}</h1>

      <form action={createTag} className="mt-8 flex gap-3">
        <input
          name="name"
          type="text"
          required
          placeholder={t(translations, "admin.tag_name", "Tag name")}
          className="flex-1 border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-accent rounded-sm"
        />
        <button
          type="submit"
          className="bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity rounded-sm"
        >
          {t(translations, "admin.add", "Add")}
        </button>
      </form>

      <div className="mt-6 flex flex-wrap gap-2">
        {allTags.map((tag) => (
          <div
            key={tag.id}
            className="inline-flex items-center gap-2 border border-border px-3 py-1.5 rounded-sm"
          >
            <span className="font-mono text-xs">{tag.name}</span>
            <form
              action={async () => {
                "use server";
                await deleteTag(tag.id);
              }}
            >
              <button
                type="submit"
                className="text-xs text-muted hover:text-red-500 transition-colors"
              >
                x
              </button>
            </form>
          </div>
        ))}
        {allTags.length === 0 && (
          <p className="text-sm text-muted">{t(translations, "admin.no_tags", "No tags yet.")}</p>
        )}
      </div>
    </div>
  );
}
