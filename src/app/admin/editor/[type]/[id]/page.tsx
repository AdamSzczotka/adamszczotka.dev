import { db } from "@/lib/db";
import { posts, projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { EditorWrapper } from "./editor-wrapper";
import Link from "next/link";

interface Props {
  params: Promise<{ type: string; id: string }>;
}

export default async function EditorPage({ params }: Props) {
  await requireAdmin();

  const { type, id } = await params;
  const numId = parseInt(id, 10);

  let item: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string | null;
    description?: string | null;
    imageUrl?: string | null;
    liveUrl?: string | null;
    githubUrl?: string | null;
    isPublished?: boolean;
  };

  if (type === "post") {
    const [post] = await db.select().from(posts).where(eq(posts.id, numId));
    if (!post) notFound();
    item = {
      title: post.title,
      slug: post.slug,
      content: post.content || "",
      excerpt: post.excerpt,
      isPublished: post.isPublished,
    };
  } else if (type === "project") {
    const [project] = await db.select().from(projects).where(eq(projects.id, numId));
    if (!project) notFound();
    item = {
      title: project.title,
      slug: project.slug,
      content: project.content || "",
      description: project.description,
      imageUrl: project.imageUrl,
      liveUrl: project.liveUrl,
      githubUrl: project.githubUrl,
    };
  } else {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center gap-3 text-sm text-muted">
        <Link href={`/admin/${type}s`} className="hover:text-foreground transition-colors">
          {type === "post" ? "Posts" : "Projects"}
        </Link>
        <span>/</span>
        <span className="text-foreground">{item.title}</span>
      </div>

      <div className="mt-8">
        <EditorWrapper
          type={type}
          id={numId}
          content={item.content}
          metadata={{
            title: item.title,
            slug: item.slug,
            excerpt: item.excerpt || "",
            description: item.description || "",
            imageUrl: item.imageUrl || "",
            liveUrl: item.liveUrl || "",
            githubUrl: item.githubUrl || "",
            isPublished: item.isPublished ?? false,
          }}
        />
      </div>
    </div>
  );
}
