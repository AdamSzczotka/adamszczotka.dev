import Link from "next/link";

interface RelatedPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  createdAt: Date;
  publishedAt?: Date | null;
}

interface RelatedPostsProps {
  posts: RelatedPost[];
  locale: string;
}

export function RelatedPosts({ posts, locale }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  const prefix = locale === "pl" ? "/pl" : "";
  const dateLocale = locale === "pl" ? "pl-PL" : "en-US";

  return (
    <section className="mx-auto max-w-5xl px-6 pt-16 pb-24">
      <div className="border-t border-[var(--border)] pt-12">
        <h2 className="text-lg font-semibold tracking-tight">Keep reading</h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {posts.map((post) => {
            const displayDate = post.publishedAt || post.createdAt;
            return (
              <Link
                key={post.id}
                href={`${prefix}/blog/${post.slug}`}
                className="group block"
              >
                <time
                  dateTime={displayDate.toISOString()}
                  className="text-xs font-mono text-[var(--muted)]"
                >
                  {displayDate.toLocaleDateString(dateLocale, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
                <h3 className="mt-1.5 font-medium leading-snug group-hover:text-[var(--accent)] transition-colors">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="mt-1.5 text-sm text-[var(--muted)] line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
