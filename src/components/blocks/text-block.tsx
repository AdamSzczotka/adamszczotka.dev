interface TextData {
  html?: string;
}

export function TextBlock({ data }: { data: TextData }) {
  if (!data.html) return null;

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div
          className="prose prose-neutral dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: data.html }}
        />
      </div>
    </section>
  );
}
