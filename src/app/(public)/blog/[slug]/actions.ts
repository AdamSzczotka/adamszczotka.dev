"use server";

import { db } from "@/lib/db";
import { comments } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import sanitizeHtml from "sanitize-html";

export async function addComment(
  postId: number,
  formData: FormData,
  parentId?: number | null,
) {
  const authorName = (formData.get("authorName") as string).trim();
  const rawContent = (formData.get("content") as string).trim();

  if (!authorName || !rawContent) {
    return { error: "Name and comment are required." };
  }

  if (authorName.length > 100) {
    return { error: "Name too long (max 100 characters)." };
  }

  if (rawContent.length > 2000) {
    return { error: "Comment too long (max 2000 characters)." };
  }

  const content = sanitizeHtml(rawContent, {
    allowedTags: [],
    allowedAttributes: {},
  });

  await db.insert(comments).values({
    postId,
    parentId: parentId ?? null,
    authorName: sanitizeHtml(authorName, {
      allowedTags: [],
      allowedAttributes: {},
    }),
    content,
    status: "PENDING",
  });

  revalidatePath(`/blog`);
  return { success: true };
}
