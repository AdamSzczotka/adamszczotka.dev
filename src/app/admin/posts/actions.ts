"use server";

import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";

export async function createPost(formData: FormData) {
  await requireAdmin();

  const title = formData.get("title") as string;
  const slug = (formData.get("slug") as string) || title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const excerpt = formData.get("excerpt") as string;

  await db.insert(posts).values({
    title,
    slug,
    excerpt,
    content: "",
    isPublished: false,
  });

  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function togglePublished(id: number, isPublished: boolean) {
  await requireAdmin();

  await db.update(posts).set({ isPublished: !isPublished }).where(eq(posts.id, id));
  revalidatePath("/admin/posts");
}

export async function deletePost(id: number) {
  await requireAdmin();

  await db.delete(posts).where(eq(posts.id, id));
  revalidatePath("/admin/posts");
}
