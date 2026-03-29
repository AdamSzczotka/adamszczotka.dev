import Link from "next/link";

interface SeriesPost {
  id: number;
  title: string;
  slug: string;
  seriesOrder?: number | null;
}

interface SeriesData {
  id: number;
  nameEn: string;
  namePl: string;
}

interface SeriesNavProps {
  series: SeriesData;
  posts: SeriesPost[];
  currentPostId: number;
  locale: string;
}

export function SeriesNav({
  series,
  posts,
  currentPostId,
  locale,
}: SeriesNavProps) {
  if (posts.length <= 1) return null;

  const prefix = locale === "pl" ? "/pl" : "";
  const seriesName = locale === "pl" ? series.namePl : series.nameEn;
  const sorted = [...posts].sort(
    (a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0),
  );
  const currentIndex = sorted.findIndex((p) => p.id === currentPostId);
  const prevPost = currentIndex > 0 ? sorted[currentIndex - 1] : null;
  const nextPost =
    currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null;

  return (
    <div className="mt-12 border border-[var(--border)] p-6">
      <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
        Part {currentIndex + 1} of {sorted.length}
      </p>
      <h3 className="mt-1.5 font-semibold">{seriesName}</h3>

      <ol className="mt-4 space-y-1.5">
        {sorted.map((post, idx) => {
          const isCurrent = post.id === currentPostId;
          return (
            <li key={post.id} className="text-sm">
              {isCurrent ? (
                <span className="text-[var(--accent)] font-medium">
                  {idx + 1}. {post.title}
                </span>
              ) : (
                <Link
                  href={`${prefix}/blog/${post.slug}`}
                  className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  {idx + 1}. {post.title}
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      {(prevPost || nextPost) && (
        <div className="mt-6 pt-4 border-t border-[var(--border)] flex justify-between gap-4 text-sm">
          {prevPost ? (
            <Link
              href={`${prefix}/blog/${prevPost.slug}`}
              className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              &larr; {prevPost.title}
            </Link>
          ) : (
            <span />
          )}
          {nextPost && (
            <Link
              href={`${prefix}/blog/${nextPost.slug}`}
              className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-right"
            >
              {nextPost.title} &rarr;
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
