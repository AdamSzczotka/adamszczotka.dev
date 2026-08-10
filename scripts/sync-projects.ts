import { db } from "../src/lib/db";
import { projects, projectTags, tags } from "../src/lib/db/schema";
import { and, eq } from "drizzle-orm";
import projectData from "../content/projects.json";
import tagData from "../content/tags.json";

// Projects are repo-managed content: content/projects.json is the source of
// truth and this script pushes it into the database (insert or update by
// locale+slug). Posts are CMS-managed and deliberately NOT touched here.
//
// Usage: npx tsx --env-file=.env scripts/sync-projects.ts

async function syncProjects() {
  await db.insert(tags).values(tagData).onConflictDoNothing();
  const allTags = await db.select().from(tags);
  const tagIdBySlug = Object.fromEntries(allTags.map((t) => [t.slug, t.id]));

  for (const p of projectData) {
    const locale = p.locale as "en" | "pl";
    const values = {
      title: p.title,
      description: p.description,
      content: p.content,
      coverImage: p.coverImage,
      imageUrl: p.imageUrl,
      liveUrl: p.liveUrl,
      githubUrl: p.githubUrl,
      slides: p.slides ?? null,
    };

    const [existing] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.slug, p.slug), eq(projects.locale, locale)));

    let projectId: number;
    if (existing) {
      await db.update(projects).set(values).where(eq(projects.id, existing.id));
      projectId = existing.id;
      console.log(`Updated ${p.slug} (${locale})`);
    } else {
      const [created] = await db
        .insert(projects)
        .values({ ...values, slug: p.slug, locale, createdAt: new Date(p.createdAt) })
        .returning();
      projectId = created.id;
      console.log(`Created ${p.slug} (${locale})`);
    }

    await db.delete(projectTags).where(eq(projectTags.projectId, projectId));
    for (const tagSlug of p.tags) {
      if (tagIdBySlug[tagSlug]) {
        await db
          .insert(projectTags)
          .values({ projectId, tagId: tagIdBySlug[tagSlug] })
          .onConflictDoNothing();
      }
    }
  }
  process.exit(0);
}

syncProjects().catch((e) => {
  console.error(e);
  process.exit(1);
});
