"use server";

import { db } from "@/lib/db";
import { posts, projects, postTags, projectTags, relatedPosts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { calculateReadTime } from "@/lib/utils/read-time";
import { extractToc } from "@/lib/utils/toc";

export async function saveContent(type: string, id: number, html: string) {
  await requireAdmin();

  if (type === "post") {
    const { toc, html: enrichedHtml } = extractToc(html);
    const readTimeMinutes = calculateReadTime(html);

    await db
      .update(posts)
      .set({ content: enrichedHtml, readTimeMinutes, toc })
      .where(eq(posts.id, id));
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
    categoryId?: number | null;
    seriesId?: number | null;
    seriesOrder?: number | null;
    metaDescription?: string;
    ogImage?: string;
    relatedPostIds?: number[];
  },
) {
  await requireAdmin();

  if (type === "post") {
    const isPublished = data.isPublished ?? false;

    // Only set publishedAt on first publish (when it's not already set)
    let publishedAtUpdate = {};
    if (isPublished) {
      const [existing] = await db
        .select({ publishedAt: posts.publishedAt })
        .from(posts)
        .where(eq(posts.id, id));
      if (!existing?.publishedAt) {
        publishedAtUpdate = { publishedAt: new Date() };
      }
    }

    await db
      .update(posts)
      .set({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        coverImage: data.coverImage || null,
        isPublished: isPublished,
        category: (data.category as "TECH" | "PERSONAL") || "TECH",
        locale: (data.locale as "en" | "pl") || "en",
        categoryId: data.categoryId ?? null,
        seriesId: data.seriesId ?? null,
        seriesOrder: data.seriesOrder ?? null,
        metaDescription: data.metaDescription || null,
        ogImage: data.ogImage || null,
        ...publishedAtUpdate,
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

    // Update related posts
    if (data.relatedPostIds) {
      await db.delete(relatedPosts).where(eq(relatedPosts.postId, id));
      if (data.relatedPostIds.length > 0) {
        await db.insert(relatedPosts).values(
          data.relatedPostIds.map((relatedPostId, index) => ({
            postId: id,
            relatedPostId,
            position: index,
          })),
        );
      }
    }

    const locale = data.locale || "en";
    revalidatePath("/admin/posts");
    revalidatePath(`/${locale}/blog/${data.slug}`);
    revalidatePath(`/${locale}/blog`);
    revalidatePath("/feed.xml");
    revalidatePath("/llms.txt");
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

    const locale = data.locale || "en";
    revalidatePath("/admin/projects");
    revalidatePath(`/${locale}/projects/${data.slug}`);
  }
}
