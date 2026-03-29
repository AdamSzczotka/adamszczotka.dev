import Link from "next/link";
import Image from "next/image";

interface BlogCardTag {
  id: number;
  name: string;
}

interface BlogCardPost {
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

interface BlogCardProps {
  post: BlogCardPost;
  tags: BlogCardTag[];
  locale: string;
  featured?: boolean;
  categoryName?: string;
}

function getCoverUrl(coverImage: string, variant: "card" | "hero") {
  // New format: basePath without extension (e.g., /uploads/uuid)
  if (!coverImage.includes(".")) return `${coverImage}-${variant}.avif`;
  // Old format: full path with extension (e.g., /uploads/uuid.avif)
  return coverImage;
}

export function BlogCard({
  post,
  tags,
  locale,
  featured = false,
  categoryName,
}: BlogCardProps) {
  const prefix = locale === "pl" ? "/pl" : "";
  const dateLocale = locale === "pl" ? "pl-PL" : "en-US";
  const displayDate = post.publishedAt || post.createdAt;

  return (
    <Link
      href={`${prefix}/blog/${post.slug}`}
      className={`group card-frame card-neumorphic block border border-[var(--border)] bg-[var(--surface)] overflow-hidden${
        featured ? " sm:col-span-2" : ""
      }`}
    >
      {/* Cover image */}
      {post.coverImage ? (
        <div
          className={`relative overflow-hidden ${
            featured ? "aspect-[2/1]" : "aspect-[16/9]"
          }`}
        >
          <Image
            src={getCoverUrl(post.coverImage, "card")}
            alt={post.title}
            fill
            className="cover-image object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            {...(post.coverBlurDataUrl
              ? { placeholder: "blur", blurDataURL: post.coverBlurDataUrl }
              : {})}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)]/60 to-transparent" />
        </div>
      ) : (
        <div
          className={`relative ${
            featured ? "aspect-[2/1]" : "aspect-[16/9]"
          } bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-center`}
        >
          <span className="text-3xl font-bold text-[var(--muted)]/20 select-none font-mono">
            {post.title.charAt(0)}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        {/* Meta row */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--muted)]">
          {categoryName && (
            <>
              <span className="uppercase text-[var(--accent)]/80">
                {categoryName}
              </span>
              <span className="w-px h-3 bg-[var(--border)]" />
            </>
          )}
          <time dateTime={displayDate.toISOString()}>
            {displayDate.toLocaleDateString(dateLocale, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
          {post.readTimeMinutes > 0 && (
            <>
              <span className="w-px h-3 bg-[var(--border)]" />
              <span>{post.readTimeMinutes} min read</span>
            </>
          )}
        </div>

        {/* Title */}
        <h2 className="mt-2.5 text-lg font-semibold tracking-tight group-hover:text-[var(--accent)] transition-colors">
          {post.title}
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="font-mono text-[10px] border border-[var(--border)] px-1.5 py-0.5 text-[var(--muted)]"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
