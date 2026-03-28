import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";

const techStack = [
  { name: "TypeScript", icon: "TS" },
  { name: "React Native", icon: "RN" },
  { name: "Next.js", icon: "NX" },
  { name: "Python", icon: "PY" },
  { name: "Django", icon: "DJ" },
  { name: "PostgreSQL", icon: "PG" },
  { name: "Docker", icon: "DK" },
  { name: "GCP", icon: "GC" },
  { name: "Nginx", icon: "NG" },
];

export default async function Home() {
  const recentPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.isPublished, true))
    .orderBy(desc(posts.createdAt))
    .limit(3);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden -mt-16 pt-16">
        <div className="hero-bg">
          <div className="hero-orb" />
          <div className="hero-grid" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-6 py-24 w-full">
          <div className="flex flex-col-reverse sm:flex-row items-center gap-12 sm:gap-16">
            <div className="flex-[3]">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                Adam Szczotka
              </h1>
              <p className="mt-3 text-lg sm:text-xl">
                <span className="gradient-text font-medium">
                  Software Engineer &amp; Product Architect
                </span>
              </p>
              <p className="mt-6 max-w-lg text-muted leading-relaxed">
                Coding since age 11. I build scalable backends, fast mobile
                apps, and privacy-first web tools. I deliver business value, not
                just code.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#projects"
                  className="btn-spring inline-flex items-center gap-2 border border-border px-5 py-2.5 text-sm font-medium hover:border-accent/50 rounded-sm"
                >
                  View my projects
                </a>
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
                <span className="text-4xl sm:text-5xl font-bold text-muted/30 select-none">
                  AS
                </span>
              </div>
            </div>
          </div>

          <div className="mt-20 flex flex-wrap justify-center sm:justify-start gap-4">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="tech-logo group relative w-10 h-10 border border-border rounded-sm flex items-center justify-center bg-surface"
                title={tech.name}
              >
                <span className="font-mono text-[10px] font-medium text-muted group-hover:text-accent transition-colors">
                  {tech.icon}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Projects (Z-Pattern) ──────────────────────────── */}
      <section id="projects" className="bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <p className="text-xs font-mono text-muted uppercase tracking-widest">
            Selected Work
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">
            Projects
          </h2>

          <div className="mt-16 flex flex-col sm:flex-row items-center gap-10 sm:gap-16">
            <div className="flex-1">
              <span className="font-mono text-xs text-accent">01</span>
              <h3 className="mt-2 text-xl font-bold">FormattedAI.pl</h3>
              <p className="mt-1 text-sm text-muted">
                Privacy-first developer tools
              </p>
              <div className="mt-4 space-y-3 text-sm text-muted leading-relaxed">
                <p>
                  <span className="text-foreground font-medium">Challenge:</span>{" "}
                  Every formatting tool on the market breaks NDAs by sending
                  data to external servers and tracks users with cookies.
                </p>
                <p>
                  <span className="text-foreground font-medium">Solution:</span>{" "}
                  100% client-side processing. Zero cookies, zero tracking.
                  Internationalization rendered with SSG. Markdown formatter,
                  AVIF converter, CSS/JS minifiers — all in the browser.
                </p>
              </div>
              <div className="mt-6 flex gap-3">
                <a
                  href="https://formattedai.pl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-spring text-sm border border-border px-4 py-2 hover:border-accent/50 rounded-sm"
                >
                  View Live
                </a>
                <Link
                  href="/projects/formattedai"
                  className="btn-spring text-sm text-accent hover:underline px-4 py-2"
                >
                  Case Study
                </Link>
              </div>
            </div>
            <div className="flex-1 w-full">
              <div className="card-frame border border-border rounded-sm aspect-video bg-background flex items-center justify-center">
                <span className="font-mono text-sm text-muted/40">
                  formattedai.pl
                </span>
              </div>
            </div>
          </div>

          <div className="mt-24 flex flex-col-reverse sm:flex-row items-center gap-10 sm:gap-16">
            <div className="flex-1 w-full">
              <div className="card-frame border border-border rounded-sm aspect-video bg-background flex items-center justify-center">
                <span className="font-mono text-sm text-muted/40">
                  tutorhub
                </span>
              </div>
            </div>
            <div className="flex-1">
              <span className="font-mono text-xs text-accent">02</span>
              <h3 className="mt-2 text-xl font-bold">TutorHub</h3>
              <p className="mt-1 text-sm text-muted">
                B2B tutoring school management
              </p>
              <div className="mt-4 space-y-3 text-sm text-muted leading-relaxed">
                <p>
                  <span className="text-foreground font-medium">Challenge:</span>{" "}
                  A tutoring school managing 200+ students, schedules, and
                  payments in Excel spreadsheets. Manual errors, no reporting,
                  hours wasted weekly.
                </p>
                <p>
                  <span className="text-foreground font-medium">Solution:</span>{" "}
                  Custom Django monolith with PostgreSQL. Relational data model
                  for students, teachers, schedules, and invoices. Dockerized
                  deployment. Reduced admin work from 10h to 1h per week.
                </p>
              </div>
              <div className="mt-6 flex gap-3">
                <Link
                  href="/projects/tutorhub"
                  className="btn-spring text-sm border border-border px-4 py-2 hover:border-accent/50 rounded-sm"
                >
                  Case Study
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tech Feed (Changelog style) ───────────────────── */}
      <section className="bg-background">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <p className="text-xs font-mono text-muted uppercase tracking-widest">
            Latest
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">
            From the blog
          </h2>

          <div className="mt-12">
            {recentPosts.length === 0 ? (
              <p className="text-sm text-muted">
                Posts coming soon. Building in public.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {recentPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="flex items-baseline gap-6 py-4 group"
                  >
                    <time className="shrink-0 w-28 text-xs font-mono text-muted">
                      {post.createdAt.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                    <span className="font-medium group-hover:text-accent transition-colors">
                      {post.title}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {recentPosts.length > 0 && (
              <Link
                href="/blog"
                className="mt-6 inline-flex text-sm text-accent hover:underline"
              >
                All posts
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-32 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Got an interesting problem to solve?
          </h2>
          <p className="mt-4 text-muted max-w-lg mx-auto leading-relaxed">
            I am always happy to exchange experience, discuss architecture, or
            explore a new B2B project. Let&apos;s talk.
          </p>
          <a
            href="mailto:contact@adamszczotka.dev"
            className="btn-spring mt-8 inline-flex items-center gap-2 border-2 border-accent text-accent px-8 py-3 text-sm font-medium rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Send a message
          </a>
        </div>
      </section>
    </>
  );
}
