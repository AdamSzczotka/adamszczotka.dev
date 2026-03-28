"use server";

import { db } from "@/lib/db";
import { translations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";

export async function upsertTranslation(formData: FormData) {
  await requireAdmin();

  const key = (formData.get("key") as string).trim();
  const en = (formData.get("en") as string).trim();
  const pl = (formData.get("pl") as string).trim();

  if (!key || !en || !pl) return;

  await db
    .insert(translations)
    .values({ key, en, pl })
    .onConflictDoUpdate({
      target: translations.key,
      set: { en, pl },
    });

  revalidatePath("/admin/translations");
}

export async function deleteTranslation(id: number) {
  await requireAdmin();

  await db.delete(translations).where(eq(translations.id, id));
  revalidatePath("/admin/translations");
}
