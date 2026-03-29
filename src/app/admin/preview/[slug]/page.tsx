import { db } from "@/lib/db";
import { posts, postTags, tags } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PreviewPage({ params }: Props) {
  await requireAdmin();

  const { slug } = await params;

  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.slug, slug));

  if (!post) notFound();

  const linkedTags = await db
    .select({ name: tags.name })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, post.id));

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* Preview banner */}
      <div className="mb-8 border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-center text-sm font-mono text-yellow-600 dark:text-yellow-400 rounded-sm">
        PREVIEW MODE
      </div>

      {/* Post header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 text-xs text-muted font-mono mb-4">
          <span>{post.locale.toUpperCase()}</span>
          <span>|</span>
          <span>{post.category}</span>
          <span>|</span>
          <time dateTime={post.createdAt.toISOString()}>
            {post.createdAt.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          {post.readTimeMinutes > 0 && (
            <>
              <span>|</span>
              <span>{post.readTimeMinutes} min read</span>
            </>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
        {post.excerpt && (
          <p className="mt-3 text-muted text-lg">{post.excerpt}</p>
        )}
        {linkedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {linkedTags.map((tag) => (
              <span
                key={tag.name}
                className="px-2 py-0.5 text-xs font-mono border border-border text-muted rounded-sm"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Post content */}
      {post.content && (
        <article
          className="prose prose-neutral dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      )}

      {/* Status info */}
      <footer className="mt-12 pt-6 border-t border-border text-xs text-muted font-mono space-y-1">
        <p>Status: {post.isPublished ? "Published" : "Draft"}</p>
        {post.publishedAt && (
          <p>Published: {post.publishedAt.toISOString()}</p>
        )}
        <p>Created: {post.createdAt.toISOString()}</p>
      </footer>
    </div>
  );
}
