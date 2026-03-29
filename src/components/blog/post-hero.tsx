import Image from "next/image";
import { PostMeta } from "./post-meta";

function getCoverUrl(coverImage: string, variant: "card" | "hero") {
  if (!coverImage.includes(".")) return `${coverImage}-${variant}.avif`;
  return coverImage;
}

interface PostHeroTag {
  id: number;
  name: string;
}

interface PostHeroPost {
  title: string;
  coverImage?: string | null;
  coverBlurDataUrl?: string | null;
  createdAt: Date;
  publishedAt?: Date | null;
  readTimeMinutes: number;
  categoryId?: number | null;
}

interface PostHeroProps {
  post: PostHeroPost;
  tags: PostHeroTag[];
  locale: string;
  categoryName?: string;
}

export function PostHero({ post, tags, locale, categoryName }: PostHeroProps) {
  const displayDate = post.publishedAt || post.createdAt;

  if (post.coverImage) {
    return (
      <section className="relative h-[50vh] sm:h-[60vh] -mt-16 flex items-end overflow-hidden">
        <Image
          src={getCoverUrl(post.coverImage, "hero")}
          alt={post.title}
          fill
          priority
          className="cover-image object-cover"
          {...(post.coverBlurDataUrl
            ? { placeholder: "blur", blurDataURL: post.coverBlurDataUrl }
            : {})}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/40 to-transparent" />

        <div className="relative z-10 mx-auto max-w-5xl w-full px-6 pb-12">
          <PostMeta
            categoryName={categoryName}
            date={displayDate}
            readTimeMinutes={post.readTimeMinutes}
            locale={locale}
          />
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
            {post.title}
          </h1>
          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="font-mono text-[10px] border border-[var(--border)] px-1.5 py-0.5 text-[var(--muted)] bg-[var(--background)]/50"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-6 pt-12 pb-8">
      <PostMeta
        categoryName={categoryName}
        date={displayDate}
        readTimeMinutes={post.readTimeMinutes}
        locale={locale}
      />
      <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
        {post.title}
      </h1>
      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
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
    </section>
  );
}
