import { db } from "@/lib/db";
import { translations } from "@/lib/db/schema";
import type { Locale } from "./index";

export async function getTranslations(
  locale: Locale,
): Promise<Record<string, string>> {
  const rows = await db.select().from(translations);
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row[locale];
  }
  return map;
}

export function t(
  translations: Record<string, string>,
  key: string,
  fallback?: string,
): string {
  return translations[key] || fallback || key;
}
