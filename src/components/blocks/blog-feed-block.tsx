import Link from "next/link";

interface Post {
  id: number;
  title: string;
  slug: string;
  createdAt: Date;
}

export function BlogFeedBlock({
  posts,
  locale,
  t,
}: {
  posts: Post[];
  locale: string;
  t: Record<string, string>;
}) {
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
            <div className="divide-y divide-border">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`${prefix}/blog/${post.slug}`}
                  className="flex items-baseline gap-6 py-4 group"
                >
                  <time className="shrink-0 w-28 text-xs font-mono text-muted">
                    {post.createdAt.toLocaleDateString(locale === "pl" ? "pl-PL" : "en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  <span className="font-medium group-hover:text-accent transition-colors">
                    {post.title}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {posts.length > 0 && (
            <Link
              href={`${prefix}/blog`}
              className="mt-6 inline-flex text-sm text-accent hover:underline"
            >
              {t["home.blog.all"] || "All posts"}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
