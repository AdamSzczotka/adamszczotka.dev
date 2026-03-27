import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const allProjects = await db
    .select()
    .from(projects)
    .orderBy(desc(projects.createdAt));

  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <h1 className="text-3xl font-medium tracking-tight">Projects</h1>
      <p className="mt-2 text-muted">Case studies and things I have built.</p>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {allProjects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.slug}`}
            className="group border border-border p-6 hover:border-accent/30 transition-all duration-300 rounded-sm"
          >
            <h2 className="text-lg font-medium group-hover:text-accent transition-colors">
              {project.title}
            </h2>
            {project.description && (
              <p className="mt-2 text-sm text-muted leading-relaxed">
                {project.description}
              </p>
            )}
            <div className="mt-4 flex gap-3 text-xs text-muted">
              {project.liveUrl && <span>Live</span>}
              {project.githubUrl && <span>Source</span>}
            </div>
          </Link>
        ))}
        {allProjects.length === 0 && (
          <p className="text-sm text-muted">No projects yet.</p>
        )}
      </div>
    </section>
  );
}
