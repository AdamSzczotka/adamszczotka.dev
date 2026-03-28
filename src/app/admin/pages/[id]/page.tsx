import { db } from "@/lib/db";
import { pages, pageBlocks, projects } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/session";
import { notFound } from "next/navigation";
import { PageEditor } from "./page-editor";

export default async function AdminPageEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const pageId = parseInt(id, 10);

  if (isNaN(pageId)) {
    notFound();
  }

  const [page] = await db
    .select()
    .from(pages)
    .where(eq(pages.id, pageId));

  if (!page) {
    notFound();
  }

  const blocks = await db
    .select()
    .from(pageBlocks)
    .where(eq(pageBlocks.pageId, pageId))
    .orderBy(asc(pageBlocks.position));

  const allProjects = await db
    .select({
      id: projects.id,
      title: projects.title,
      locale: projects.locale,
    })
    .from(projects);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <PageEditor
        page={page}
        blocks={blocks.map((b) => ({
          id: b.id,
          pageId: b.pageId,
          type: b.type,
          position: b.position,
          dataEn: b.dataEn as Record<string, unknown>,
          dataPl: b.dataPl as Record<string, unknown>,
        }))}
        projects={allProjects}
      />
    </div>
  );
}
