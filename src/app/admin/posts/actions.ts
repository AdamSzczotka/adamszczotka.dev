"use server";

import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { slugify, uniqueSlug } from "@/lib/utils/slug";

export async function createPost(formData: FormData) {
  await requireAdmin();

  const title = formData.get("title") as string;
  const excerpt = formData.get("excerpt") as string;
  const slug = await uniqueSlug(
    slugify((formData.get("slug") as string) || title),
    async (candidate) => {
      const [row] = await db
        .select({ id: posts.id })
        .from(posts)
        .where(and(eq(posts.slug, candidate), eq(posts.locale, "en")));
      return !!row;
    },
  );

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

  await db
    .update(posts)
    .set({
      isPublished: !isPublished,
      // Stamp publishedAt on first publish; keep the original date afterwards
      ...(isPublished
        ? {}
        : { publishedAt: sql`COALESCE(${posts.publishedAt}, now())` }),
    })
    .where(eq(posts.id, id));
  revalidatePath("/admin/posts");
}

export async function deletePost(id: number) {
  await requireAdmin();

  await db.delete(posts).where(eq(posts.id, id));
  revalidatePath("/admin/posts");
}
