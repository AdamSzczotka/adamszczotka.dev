import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";

export const metadata = { title: "Blog" };

export default async function BlogPage() {
  const publishedPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.isPublished, true))
    .orderBy(desc(posts.createdAt));

  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-3xl font-medium tracking-tight">Blog</h1>
      <p className="mt-2 text-muted">Thoughts on engineering, architecture, and building products.</p>

      <div className="mt-12 divide-y divide-border">
        {publishedPosts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="block py-6 group"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-medium group-hover:text-accent transition-colors">
                {post.title}
              </h2>
              <time className="shrink-0 text-xs text-muted font-mono">
                {post.createdAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
            </div>
            {post.excerpt && (
              <p className="mt-2 text-sm text-muted leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </Link>
        ))}
        {publishedPosts.length === 0 && (
          <p className="py-6 text-sm text-muted">No posts yet.</p>
        )}
      </div>
    </section>
  );
}
