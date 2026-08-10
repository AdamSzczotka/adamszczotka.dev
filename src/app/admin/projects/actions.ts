"use server";

import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { slugify, uniqueSlug } from "@/lib/utils/slug";

export async function createProject(formData: FormData) {
  await requireAdmin();

  const title = formData.get("title") as string;
  const slug = await uniqueSlug(
    slugify((formData.get("slug") as string) || title),
    async (candidate) => {
      const [row] = await db
        .select({ id: projects.id })
        .from(projects)
        .where(and(eq(projects.slug, candidate), eq(projects.locale, "en")));
      return !!row;
    },
  );
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
