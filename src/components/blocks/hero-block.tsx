import Image from "next/image";

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
          <div className="flex-[2] flex justify-end">
            <div className="w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-sm border border-border bg-surface overflow-hidden shadow-lg shadow-black/10 dark:shadow-black/30">
              <Image
                src="/uploads/hero-adam.avif"
                alt="Adam Szczotka"
                width={320}
                height={320}
                className="w-full h-full object-cover"
                style={{ objectPosition: "center 30%" }}
                priority
              />
            </div>
          </div>
        </div>

          {/* Tech stack */}
          <div className="mt-20 flex flex-wrap justify-center sm:justify-start gap-4">
            {["TS", "RN", "NX", "PY", "DJ", "PG", "DK", "GC", "NG"].map((icon, i) => {
              const names = ["TypeScript", "React Native", "Next.js", "Python", "Django", "PostgreSQL", "Docker", "GCP", "Nginx"];
              return (
                <div
                  key={icon}
                  className="tech-logo group relative w-10 h-10 border border-border rounded-sm flex items-center justify-center bg-surface"
                  title={names[i]}
                >
                  <span className="font-mono text-[10px] font-medium text-muted group-hover:text-accent transition-colors">
                    {icon}
                  </span>
                </div>
              );
            })}
          </div>
      </div>
    </section>
  );
}
