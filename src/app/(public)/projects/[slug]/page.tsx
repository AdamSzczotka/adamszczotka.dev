import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.slug, slug));
  if (!project) return { title: "Not Found" };
  return { title: project.title };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.slug, slug));

  if (!project) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-3xl font-medium tracking-tight">{project.title}</h1>
      {project.description && (
        <p className="mt-4 text-lg text-muted">{project.description}</p>
      )}

      <div className="mt-6 flex gap-4 text-sm">
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-border px-3 py-1.5 hover:bg-foreground/5 transition-colors rounded-sm"
          >
            View Live
          </a>
        )}
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-border px-3 py-1.5 hover:bg-foreground/5 transition-colors rounded-sm"
          >
            Source Code
          </a>
        )}
      </div>

      {project.content && (
        <div
          className="prose prose-neutral dark:prose-invert mt-12 max-w-none"
          dangerouslySetInnerHTML={{ __html: project.content }}
        />
      )}
    </article>
  );
}
