export default function Home() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <h1 className="text-4xl font-medium tracking-tight">
        Adam Szczotka
      </h1>
      <p className="mt-2 text-xl text-muted">
        Software Engineer & Product Architect
      </p>
      <p className="mt-6 max-w-2xl text-muted leading-relaxed">
        Coding since age 11. Building scalable backends, fast mobile apps, and
        privacy-first web tools. Delivering business value, not just code.
      </p>
      <div className="mt-8 flex gap-4">
        <a
          href="#projects"
          className="inline-flex items-center gap-2 border border-border px-4 py-2 text-sm font-medium hover:bg-foreground/5 transition-colors rounded-sm"
        >
          View my projects
        </a>
        <a
          href="https://github.com/AdamSzczotka"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity rounded-sm"
        >
          GitHub
        </a>
      </div>

      <div className="mt-16 flex flex-wrap gap-3">
        {["TypeScript", "React Native", "Python", "Django", "Docker", "GCP", "Nginx"].map(
          (tech) => (
            <span
              key={tech}
              className="font-mono text-xs text-muted border border-border px-2 py-1 rounded-sm"
            >
              {tech}
            </span>
          )
        )}
      </div>
    </section>
  );
}
