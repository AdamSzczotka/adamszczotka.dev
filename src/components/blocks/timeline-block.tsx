interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

interface TimelineData {
  items?: TimelineItem[];
}

export function TimelineBlock({ data }: { data: TimelineData }) {
  if (!data.items || data.items.length === 0) return null;

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="relative border-l-2 border-[var(--border)] pl-8 space-y-10">
          {data.items.map((item, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[calc(2rem+5px)] top-1 w-3 h-3 rounded-full bg-accent border-2 border-[var(--background)]" />
              <span className="block font-mono text-sm text-accent">
                {item.year}
              </span>
              <h3 className="mt-1 font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="mt-1 text-muted leading-relaxed text-sm">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
