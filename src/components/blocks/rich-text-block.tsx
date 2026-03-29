interface RichTextData {
  html?: string;
}

export function RichTextBlock({ data }: { data: RichTextData }) {
  if (!data.html) return null;

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div
          className="prose prose-neutral dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: data.html }}
        />
      </div>
    </section>
  );
}
