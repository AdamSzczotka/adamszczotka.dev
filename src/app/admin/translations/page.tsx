import { db } from "@/lib/db";
import { translations } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/session";
import { upsertTranslation } from "./actions";
import TranslationTable from "./translation-table";

export default async function AdminTranslationsPage() {
  await requireAdmin();

  const allTranslations = await db
    .select()
    .from(translations)
    .orderBy(asc(translations.key));

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-medium">Translations</h1>
      <p className="mt-1 text-sm text-muted">
        {allTranslations.length} translation{allTranslations.length !== 1 ? "s" : ""}
      </p>

      <form action={upsertTranslation} className="mt-8 border border-border p-4 rounded-sm">
        <p className="text-sm font-medium mb-3">Add Translation</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            name="key"
            type="text"
            required
            placeholder="Key (e.g. nav.home)"
            className="border border-border bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent rounded-sm"
          />
          <input
            name="en"
            type="text"
            required
            placeholder="English value"
            className="border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-accent rounded-sm"
          />
          <input
            name="pl"
            type="text"
            required
            placeholder="Polish value"
            className="border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-accent rounded-sm"
          />
        </div>
        <button
          type="submit"
          className="mt-3 bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity rounded-sm"
        >
          Add
        </button>
      </form>

      <div className="mt-8">
        <TranslationTable translations={allTranslations} />
      </div>
    </div>
  );
}
