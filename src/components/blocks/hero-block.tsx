interface HeroData {
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
}

export function HeroBlock({ data }: { data: HeroData }) {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden -mt-16 pt-16">
      <div className="hero-bg">
        <div className="hero-orb" />
        <div className="hero-grid" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-24 w-full">
        <div className="flex flex-col-reverse sm:flex-row items-center gap-12 sm:gap-16">
          <div className="flex-[3]">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              {data.title || "Adam Szczotka"}
            </h1>
            <p className="mt-3 text-lg sm:text-xl">
              <span className="gradient-text font-medium">
                {data.subtitle || "Software Engineer"}
              </span>
            </p>
            {data.description && (
              <p className="mt-6 max-w-lg text-muted leading-relaxed">
                {data.description}
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              {data.buttonText && (
                <a
                  href={data.buttonUrl || "#projects"}
                  className="btn-spring inline-flex items-center gap-2 border border-border px-5 py-2.5 text-sm font-medium hover:border-accent/50 rounded-sm"
                >
                  {data.buttonText}
                </a>
              )}
              <a
                href="https://github.com/AdamSzczotka"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-spring inline-flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 text-sm font-medium rounded-sm"
              >
                GitHub
              </a>
            </div>
          </div>
          <div className="flex-[2] flex justify-center">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-sm border border-border bg-surface flex items-center justify-center">
              <span className="text-4xl sm:text-5xl font-bold text-muted/30 select-none">AS</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
