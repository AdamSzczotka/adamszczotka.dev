import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/session";
import Link from "next/link";
import { deleteProject } from "./actions";
import { getLocaleFromCookies } from "@/lib/i18n";
import { getTranslations, t } from "@/lib/i18n/get-translations";

export default async function AdminProjectsPage() {
  await requireAdmin();

  const locale = await getLocaleFromCookies();
  const translations = await getTranslations(locale);

  const allProjects = await db
    .select()
    .from(projects)
    .orderBy(desc(projects.createdAt));

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">{t(translations, "admin.projects", "Projects")}</h1>
        <Link
          href="/admin/projects/new"
          className="bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity rounded-sm"
        >
          {t(translations, "admin.new_project", "New Project")}
        </Link>
      </div>

      <div className="mt-8 border border-border divide-y divide-border">
        {allProjects.length === 0 && (
          <p className="p-6 text-sm text-muted">{t(translations, "admin.no_projects", "No projects yet.")}</p>
        )}
        {allProjects.map((project) => (
          <div
            key={project.id}
            className="flex items-center justify-between p-4"
          >
            <div>
              <Link
                href={`/admin/editor/project/${project.id}`}
                className="font-medium hover:text-accent transition-colors"
              >
                {project.title}
              </Link>
              <p className="mt-0.5 text-xs text-muted">
                {project.slug} &middot;{" "}
                {project.createdAt.toLocaleDateString("en-US")}
              </p>
            </div>
            <form
              action={async () => {
                "use server";
                await deleteProject(project.id);
              }}
            >
              <button
                type="submit"
                className="text-xs text-red-500 hover:text-red-400 transition-colors"
              >
                {t(translations, "admin.delete", "Delete")}
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
