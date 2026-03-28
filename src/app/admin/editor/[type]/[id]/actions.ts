"use server";

import { db } from "@/lib/db";
import { posts, projects, postTags, projectTags } from "@/lib/db/schema";
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
    coverImage?: string;
    imageUrl?: string;
    liveUrl?: string;
    githubUrl?: string;
    isPublished?: boolean;
    category?: string;
    locale?: string;
    selectedTagIds?: number[];
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
        coverImage: data.coverImage || null,
        isPublished: data.isPublished ?? false,
        category: (data.category as "TECH" | "PERSONAL") || "TECH",
        locale: (data.locale as "en" | "pl") || "en",
      })
      .where(eq(posts.id, id));

    // Update tags
    if (data.selectedTagIds) {
      await db.delete(postTags).where(eq(postTags.postId, id));
      if (data.selectedTagIds.length > 0) {
        await db.insert(postTags).values(
          data.selectedTagIds.map((tagId) => ({ postId: id, tagId })),
        );
      }
    }

    revalidatePath("/admin/posts");
    revalidatePath(`/blog/${data.slug}`);
  } else if (type === "project") {
    await db
      .update(projects)
      .set({
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        coverImage: data.coverImage || null,
        imageUrl: data.imageUrl || null,
        liveUrl: data.liveUrl || null,
        githubUrl: data.githubUrl || null,
        locale: (data.locale as "en" | "pl") || "en",
      })
      .where(eq(projects.id, id));

    // Update tags
    if (data.selectedTagIds) {
      await db.delete(projectTags).where(eq(projectTags.projectId, id));
      if (data.selectedTagIds.length > 0) {
        await db.insert(projectTags).values(
          data.selectedTagIds.map((tagId) => ({ projectId: id, tagId })),
        );
      }
    }

    revalidatePath("/admin/projects");
    revalidatePath(`/projects/${data.slug}`);
  }
}
