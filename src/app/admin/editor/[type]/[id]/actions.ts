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
