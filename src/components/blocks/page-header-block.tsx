interface PageHeaderData {
  title?: string;
  description?: string;
}

export function PageHeaderBlock({ data }: { data: PageHeaderData }) {
  if (!data.title) return null;

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          {data.title}
        </h1>
        {data.description && (
          <p className="mt-4 text-muted max-w-2xl leading-relaxed">
            {data.description}
          </p>
        )}
      </div>
    </section>
  );
}
