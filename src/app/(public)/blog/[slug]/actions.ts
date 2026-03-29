"use server";

import { db } from "@/lib/db";
import { comments } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import sanitizeHtml from "sanitize-html";
import { headers } from "next/headers";

// ── In-memory rate limiting ───────────────────────────────────────
const rateLimit = new Map<string, number[]>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60_000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimit.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  if (recent.length >= RATE_LIMIT_MAX) return true;
  recent.push(now);
  rateLimit.set(ip, recent);
  return false;
}

export async function addComment(
  postId: number,
  formData: FormData,
  parentId?: number | null,
) {
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return { error: "Too many comments. Please wait a minute and try again." };
  }

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
