interface CtaData {
  heading?: string;
  text?: string;
  buttonText?: string;
  email?: string;
}

export function CtaBlock({ data }: { data: CtaData }) {
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-5xl px-6 py-32 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
          {data.heading || "Got an interesting problem to solve?"}
        </h2>
        {data.text && (
          <p className="mt-4 text-muted max-w-lg mx-auto leading-relaxed">
            {data.text}
          </p>
        )}
        <a
          href={`mailto:${data.email || "contact@adamszczotka.dev"}`}
          className="btn-spring mt-8 inline-flex items-center gap-2 border-2 border-accent text-accent px-8 py-3 text-sm font-medium rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {data.buttonText || "Send a message"}
        </a>
      </div>
    </section>
  );
}
