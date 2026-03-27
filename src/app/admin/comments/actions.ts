"use server";

import { db } from "@/lib/db";
import { comments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";

export async function approveComment(id: number) {
  await requireAdmin();

  await db.update(comments).set({ status: "APPROVED" }).where(eq(comments.id, id));
  revalidatePath("/admin/comments");
}

export async function rejectComment(id: number) {
  await requireAdmin();

  await db.update(comments).set({ status: "REJECTED" }).where(eq(comments.id, id));
  revalidatePath("/admin/comments");
}
