interface StatItem {
  value: string;
  label: string;
}

interface StatsData {
  items?: StatItem[];
}

export function StatsBlock({ data }: { data: StatsData }) {
  if (!data.items || data.items.length === 0) return null;

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {data.items.map((item, i) => (
            <div
              key={i}
              className="text-center sm:border-r sm:last:border-r-0 border-[var(--border)]"
            >
              <span className="block text-3xl font-bold tracking-tight">
                {item.value}
              </span>
              <span className="mt-2 block text-sm text-muted font-mono uppercase tracking-wider">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
