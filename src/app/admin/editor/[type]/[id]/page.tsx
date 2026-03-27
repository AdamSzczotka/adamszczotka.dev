import { db } from "@/lib/db";
import { posts, projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { EditorWrapper } from "./editor-wrapper";

interface Props {
  params: Promise<{ type: string; id: string }>;
}

export default async function EditorPage({ params }: Props) {
  await requireAdmin();

  const { type, id } = await params;
  const numId = parseInt(id, 10);

  let title = "";
  let content = "";

  if (type === "post") {
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, numId));
    if (!post) notFound();
    title = post.title;
    content = post.content || "";
  } else if (type === "project") {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, numId));
    if (!project) notFound();
    title = project.title;
    content = project.content || "";
  } else {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-medium">{title}</h1>
      <p className="mt-1 text-sm text-muted">
        Editing {type} #{id}
      </p>
      <div className="mt-8">
        <EditorWrapper type={type} id={numId} content={content} />
      </div>
    </div>
  );
}
