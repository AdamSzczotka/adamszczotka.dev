export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-3xl font-medium tracking-tight">About</h1>

      <div className="mt-8 space-y-6 text-muted leading-relaxed">
        <p>
          I am Adam Szczotka, a Software Engineer and Product Architect. I have
          been coding since the age of 11. I build scalable backends, fast
          mobile applications, and privacy-first web tools.
        </p>
        <p>
          My approach is shaped by discipline built through years of competitive
          sports and a personal transformation that included losing 70 kg. That
          same discipline drives how I build software: methodically, with
          attention to detail, and always delivering business value.
        </p>
        <p>
          I believe in building tools that respect user privacy. My projects
          like FormattedAI are 100% client-side with zero cookies and zero
          tracking. When I write code, I think about the person using it.
        </p>
      </div>

      <div className="mt-12 border-t border-border pt-8">
        <h2 className="text-lg font-medium">Stack</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            "TypeScript",
            "React / React Native",
            "Next.js",
            "Python",
            "Django",
            "PostgreSQL",
            "Docker",
            "Nginx",
            "GCP",
          ].map((tech) => (
            <span
              key={tech}
              className="font-mono text-xs text-muted border border-border px-2 py-1 rounded-sm"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
