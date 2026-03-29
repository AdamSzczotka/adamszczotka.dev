import { db } from "@/lib/db";
import { posts, projects } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

const SITE_URL = "https://adamszczotka.dev";

export async function GET() {
  const publishedPosts = await db
    .select({
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
    })
    .from(posts)
    .where(eq(posts.isPublished, true))
    .orderBy(desc(posts.createdAt));

  const allProjects = await db
    .select({
      title: projects.title,
      slug: projects.slug,
      description: projects.description,
    })
    .from(projects)
    .orderBy(desc(projects.createdAt));

  const blogSection = publishedPosts
    .map((post) => `- [${post.title}](${SITE_URL}/blog/${post.slug}): ${post.excerpt ?? ""}`)
    .join("\n");

  const projectSection = allProjects
    .map((project) => `- [${project.title}](${SITE_URL}/projects/${project.slug}): ${project.description ?? ""}`)
    .join("\n");

  const content = `# adamszczotka.dev

> Personal portfolio and technical blog by Adam Szczotka, Software Engineer.

## Blog Posts
${blogSection || "No posts published yet."}

## Projects
${projectSection || "No projects listed yet."}

## Pages
- [About](${SITE_URL}/about): Background, skills, experience
- [Privacy Policy](${SITE_URL}/privacy): Privacy policy and data handling
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
