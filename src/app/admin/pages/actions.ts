"use server";

import { db } from "@/lib/db";
import { pages, pageBlocks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";

export async function createPage(formData: FormData) {
  await requireAdmin();

  const title = formData.get("title") as string;
  const slug =
    (formData.get("slug") as string) ||
    title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  const [page] = await db.insert(pages).values({ title, slug }).returning();

  revalidatePath("/admin/pages");
  redirect(`/admin/pages/${page.id}`);
}

export async function deletePage(id: number) {
  await requireAdmin();

  await db.delete(pages).where(eq(pages.id, id));
  revalidatePath("/admin/pages");
}

export async function addBlock(
  pageId: number,
  type: "hero" | "project_showcase" | "blog_feed" | "cta" | "text",
  position: number,
) {
  await requireAdmin();

  await db.insert(pageBlocks).values({
    pageId,
    type,
    position,
    dataEn: {},
    dataPl: {},
  });

  revalidatePath(`/admin/pages/${pageId}`);
}

export async function updateBlock(
  blockId: number,
  locale: "en" | "pl",
  data: Record<string, unknown>,
) {
  await requireAdmin();

  if (locale === "en") {
    await db
      .update(pageBlocks)
      .set({ dataEn: data })
      .where(eq(pageBlocks.id, blockId));
  } else {
    await db
      .update(pageBlocks)
      .set({ dataPl: data })
      .where(eq(pageBlocks.id, blockId));
  }

  // Revalidate the page editor — we need the pageId
  const [block] = await db
    .select({ pageId: pageBlocks.pageId })
    .from(pageBlocks)
    .where(eq(pageBlocks.id, blockId));

  if (block) {
    revalidatePath(`/admin/pages/${block.pageId}`);
  }
}

export async function deleteBlock(blockId: number) {
  await requireAdmin();

  const [block] = await db
    .select({ pageId: pageBlocks.pageId })
    .from(pageBlocks)
    .where(eq(pageBlocks.id, blockId));

  await db.delete(pageBlocks).where(eq(pageBlocks.id, blockId));

  if (block) {
    revalidatePath(`/admin/pages/${block.pageId}`);
  }
}

export async function reorderBlocks(pageId: number, blockIds: number[]) {
  await requireAdmin();

  await Promise.all(
    blockIds.map((id, index) =>
      db
        .update(pageBlocks)
        .set({ position: index })
        .where(eq(pageBlocks.id, id)),
    ),
  );

  revalidatePath(`/admin/pages/${pageId}`);
}
