interface PostMetaProps {
  categoryName?: string;
  date: Date;
  readTimeMinutes: number;
  locale: string;
}

export function PostMeta({
  categoryName,
  date,
  readTimeMinutes,
  locale,
}: PostMetaProps) {
  const dateLocale = locale === "pl" ? "pl-PL" : "en-US";

  return (
    <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted)]">
      {categoryName && (
        <>
          <span className="uppercase text-[var(--accent)] font-medium">
            {categoryName}
          </span>
          <span className="w-px h-3 bg-[var(--border)]" />
        </>
      )}
      <time dateTime={date.toISOString()}>
        {date.toLocaleDateString(dateLocale, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </time>
      {readTimeMinutes > 0 && (
        <>
          <span className="w-px h-3 bg-[var(--border)]" />
          <span>{readTimeMinutes} min read</span>
        </>
      )}
    </div>
  );
}
