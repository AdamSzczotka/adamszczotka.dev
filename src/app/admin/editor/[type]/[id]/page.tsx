import { db } from "@/lib/db";
import {
  posts,
  projects,
  tags,
  postTags,
  projectTags,
  categories,
  series,
  relatedPosts,
} from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
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

  const allTags = await db.select().from(tags).orderBy(asc(tags.name));

  if (type === "post") {
    const [post] = await db.select().from(posts).where(eq(posts.id, numId));
    if (!post) notFound();

    const [linkedTags, allCategories, allSeries, linkedRelated] =
      await Promise.all([
        db
          .select({ tagId: postTags.tagId })
          .from(postTags)
          .where(eq(postTags.postId, numId)),
        db
          .select()
          .from(categories)
          .orderBy(asc(categories.position)),
        db
          .select()
          .from(series)
          .orderBy(asc(series.nameEn)),
        db
          .select({ relatedPostId: relatedPosts.relatedPostId })
          .from(relatedPosts)
          .where(eq(relatedPosts.postId, numId))
          .orderBy(asc(relatedPosts.position)),
      ]);

    // Fetch all published posts for the related posts selector (exclude self)
    const publishedPosts = await db
      .select({ id: posts.id, title: posts.title, locale: posts.locale })
      .from(posts)
      .where(eq(posts.isPublished, true))
      .orderBy(asc(posts.title));

    return (
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-center gap-3 text-sm text-muted">
          <Link
            href="/admin/posts"
            className="hover:text-foreground transition-colors"
          >
            Posts
          </Link>
          <span>/</span>
          <span className="text-foreground">{post.title}</span>
        </div>
        <div className="mt-8">
          <EditorWrapper
            type="post"
            id={numId}
            content={post.content || ""}
            allTags={allTags}
            allCategories={allCategories}
            allSeries={allSeries}
            allPosts={publishedPosts}
            metadata={{
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt || "",
              description: "",
              coverImage: post.coverImage || "",
              imageUrl: "",
              liveUrl: "",
              githubUrl: "",
              isPublished: post.isPublished,
              category: post.category,
              locale: post.locale,
              selectedTagIds: linkedTags.map((t) => t.tagId),
              categoryId: post.categoryId ?? null,
              seriesId: post.seriesId ?? null,
              seriesOrder: post.seriesOrder ?? null,
              metaDescription: post.metaDescription || "",
              ogImage: post.ogImage || "",
              relatedPostIds: linkedRelated.map((r) => r.relatedPostId),
            }}
          />
        </div>
      </div>
    );
  }

  if (type === "project") {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, numId));
    if (!project) notFound();

    const linkedTags = await db
      .select({ tagId: projectTags.tagId })
      .from(projectTags)
      .where(eq(projectTags.projectId, numId));

    return (
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-center gap-3 text-sm text-muted">
          <Link
            href="/admin/projects"
            className="hover:text-foreground transition-colors"
          >
            Projects
          </Link>
          <span>/</span>
          <span className="text-foreground">{project.title}</span>
        </div>
        <div className="mt-8">
          <EditorWrapper
            type="project"
            id={numId}
            content={project.content || ""}
            allTags={allTags}
            metadata={{
              title: project.title,
              slug: project.slug,
              excerpt: "",
              description: project.description || "",
              coverImage: project.coverImage || "",
              imageUrl: project.imageUrl || "",
              liveUrl: project.liveUrl || "",
              githubUrl: project.githubUrl || "",
              isPublished: false,
              category: "TECH",
              locale: project.locale,
              selectedTagIds: linkedTags.map((t) => t.tagId),
              categoryId: null,
              seriesId: null,
              seriesOrder: null,
              metaDescription: "",
              ogImage: "",
              relatedPostIds: [],
            }}
          />
        </div>
      </div>
    );
  }

  notFound();
}
