"use server";

import { db } from "@/lib/db";
import { tags } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { slugify, uniqueSlug } from "@/lib/utils/slug";

export async function createTag(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const slug = await uniqueSlug(slugify(name), async (candidate) => {
    const [row] = await db
      .select({ id: tags.id })
      .from(tags)
      .where(eq(tags.slug, candidate));
    return !!row;
  });

  await db.insert(tags).values({ name, slug });
  revalidatePath("/admin/tags");
}

export async function deleteTag(id: number) {
  await requireAdmin();

  await db.delete(tags).where(eq(tags.id, id));
  revalidatePath("/admin/tags");
}
