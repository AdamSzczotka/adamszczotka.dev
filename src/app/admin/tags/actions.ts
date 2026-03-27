"use server";

import { db } from "@/lib/db";
import { tags } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";

export async function createTag(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  await db.insert(tags).values({ name, slug });
  revalidatePath("/admin/tags");
}

export async function deleteTag(id: number) {
  await requireAdmin();

  await db.delete(tags).where(eq(tags.id, id));
  revalidatePath("/admin/tags");
}
