import Link from "next/link";
import { BlogCard } from "@/components/blog/blog-card";

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  coverBlurDataUrl?: string | null;
  createdAt: Date;
  publishedAt?: Date | null;
  readTimeMinutes: number;
  categoryId?: number | null;
}

interface BlogFeedBlockProps {
  posts: Post[];
  locale: string;
  t: Record<string, string>;
  categoryMap?: Map<number, { nameEn: string; namePl: string }>;
  tagsByPostId?: Record<number, { id: number; name: string }[]>;
}

export function BlogFeedBlock({
  posts,
  locale,
  t,
  categoryMap,
  tagsByPostId,
}: BlogFeedBlockProps) {
  const prefix = locale === "pl" ? "/pl" : "";

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-5xl px-6 py-24">
        <p className="text-xs font-mono text-muted uppercase tracking-widest">
          {t["home.blog.label"] || "Latest"}
        </p>
        <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">
          {t["home.blog.title"] || "From the blog"}
        </h2>

        <div className="mt-12">
          {posts.length === 0 ? (
            <p className="text-sm text-muted">
              {t["home.blog.empty"] || "Posts coming soon."}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => {
                const cat =
                  post.categoryId && categoryMap
                    ? categoryMap.get(post.categoryId)
                    : null;
                const categoryName = cat
                  ? locale === "pl"
                    ? cat.namePl
                    : cat.nameEn
                  : undefined;

                return (
                  <BlogCard
                    key={post.id}
                    post={post}
                    tags={tagsByPostId?.[post.id] || []}
                    locale={locale}
                    categoryName={categoryName}
                  />
                );
              })}
            </div>
          )}

          {posts.length > 0 && (
            <Link
              href={`${prefix}/blog`}
              className="mt-8 inline-flex text-sm text-accent hover:underline"
            >
              {t["home.blog.all"] || "All posts"}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
