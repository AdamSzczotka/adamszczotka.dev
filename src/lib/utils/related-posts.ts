import { db } from "@/lib/db";
import { posts, postTags, relatedPosts } from "@/lib/db/schema";
import { and, eq, notInArray, desc, sql, inArray } from "drizzle-orm";

type Post = typeof posts.$inferSelect;

export async function getRelatedPosts(
  postId: number,
  locale: "en" | "pl",
  limit = 3,
): Promise<Post[]> {
  const results: Post[] = [];
  const excludeIds = new Set<number>([postId]);

  // Step 1: Manual picks from relatedPosts table
  const manualPicks = await db
    .select({ post: posts })
    .from(relatedPosts)
    .innerJoin(posts, eq(relatedPosts.relatedPostId, posts.id))
    .where(
      and(
        eq(relatedPosts.postId, postId),
        eq(posts.locale, locale),
        eq(posts.isPublished, true),
      ),
    )
    .orderBy(relatedPosts.position)
    .limit(limit);

  for (const row of manualPicks) {
    results.push(row.post);
    excludeIds.add(row.post.id);
  }

  if (results.length >= limit) return results;

  // Step 2: Tag-overlap query
  const currentExcludeIds = Array.from(excludeIds);
  const remaining = limit - results.length;
  const currentPostTags = await db
    .select({ tagId: postTags.tagId })
    .from(postTags)
    .where(eq(postTags.postId, postId));

  if (currentPostTags.length > 0) {
    const tagIds = currentPostTags.map((t) => t.tagId);

    const tagMatches = await db
      .select({
        post: posts,
        sharedTags: sql<number>`count(${postTags.tagId})`.as("shared_tags"),
      })
      .from(posts)
      .innerJoin(postTags, eq(postTags.postId, posts.id))
      .where(
        and(
          inArray(postTags.tagId, tagIds),
          eq(posts.locale, locale),
          eq(posts.isPublished, true),
          currentExcludeIds.length > 0
            ? notInArray(posts.id, currentExcludeIds)
            : undefined,
        ),
      )
      .groupBy(posts.id)
      .orderBy(desc(sql`shared_tags`), desc(posts.createdAt))
      .limit(remaining);

    for (const row of tagMatches) {
      results.push(row.post);
      excludeIds.add(row.post.id);
    }
  }

  if (results.length >= limit) return results;

  // Step 3: Same-category recent posts
  const currentPost = await db
    .select({ categoryId: posts.categoryId })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (currentPost.length > 0 && currentPost[0].categoryId) {
    const finalExcludeIds = Array.from(excludeIds);
    const finalRemaining = limit - results.length;

    const categoryPosts = await db
      .select()
      .from(posts)
      .where(
        and(
          eq(posts.categoryId, currentPost[0].categoryId),
          eq(posts.locale, locale),
          eq(posts.isPublished, true),
          finalExcludeIds.length > 0
            ? notInArray(posts.id, finalExcludeIds)
            : undefined,
        ),
      )
      .orderBy(desc(posts.createdAt))
      .limit(finalRemaining);

    for (const post of categoryPosts) {
      results.push(post);
    }
  }

  return results;
}
