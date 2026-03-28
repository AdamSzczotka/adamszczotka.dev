"use server";

import { db } from "@/lib/db";
import { posts, projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";

export async function saveContent(type: string, id: number, html: string) {
  await requireAdmin();

  if (type === "post") {
    await db.update(posts).set({ content: html }).where(eq(posts.id, id));
    revalidatePath(`/admin/editor/post/${id}`);
    revalidatePath("/admin/posts");
  } else if (type === "project") {
    await db.update(projects).set({ content: html }).where(eq(projects.id, id));
    revalidatePath(`/admin/editor/project/${id}`);
    revalidatePath("/admin/projects");
  }
}

export async function saveMetadata(
  type: string,
  id: number,
  data: {
    title: string;
    slug: string;
    excerpt?: string;
    description?: string;
    imageUrl?: string;
    liveUrl?: string;
    githubUrl?: string;
    isPublished?: boolean;
  },
) {
  await requireAdmin();

  if (type === "post") {
    await db
      .update(posts)
      .set({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        isPublished: data.isPublished ?? false,
      })
      .where(eq(posts.id, id));
    revalidatePath("/admin/posts");
    revalidatePath(`/blog/${data.slug}`);
  } else if (type === "project") {
    await db
      .update(projects)
      .set({
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        liveUrl: data.liveUrl || null,
        githubUrl: data.githubUrl || null,
      })
      .where(eq(projects.id, id));
    revalidatePath("/admin/projects");
    revalidatePath(`/projects/${data.slug}`);
  }
}
