"use server";

import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";

export async function createProject(formData: FormData) {
  await requireAdmin();

  const title = formData.get("title") as string;
  const slug = (formData.get("slug") as string) || title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const description = formData.get("description") as string;
  const liveUrl = formData.get("liveUrl") as string;
  const githubUrl = formData.get("githubUrl") as string;

  await db.insert(projects).values({
    title,
    slug,
    description,
    content: "",
    liveUrl: liveUrl || null,
    githubUrl: githubUrl || null,
  });

  revalidatePath("/admin/projects");
  redirect("/admin/projects");
}

export async function deleteProject(id: number) {
  await requireAdmin();

  await db.delete(projects).where(eq(projects.id, id));
  revalidatePath("/admin/projects");
}
