interface BlogHeaderProps {
  title: string;
  description: string;
}

export function BlogHeader({ title, description }: BlogHeaderProps) {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="hero-bg">
        <div className="hero-orb" />
        <div className="hero-grid" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="mt-3 max-w-lg text-muted leading-relaxed">
          {description}
        </p>
      </div>
    </section>
  );
}
