import { db } from "./index";
import {
  posts,
  postTags,
  projects,
  tags,
  projectTags,
  translations,
  pages,
  pageBlocks,
  categories,
} from "./schema";
import { eq, and } from "drizzle-orm";

import tagData from "../../../content/tags.json";
import categoryData from "../../../content/categories.json";
import projectData from "../../../content/projects.json";
import postData from "../../../content/posts.json";
import translationData from "../../../content/translations.json";
import pageData from "../../../content/pages.json";

// Content lives in content/*.json — exported from the production database.
// The seed is idempotent: existing rows (matched by slug/key) are left untouched.

async function seed() {
  console.log("Seeding database from content/ ...");

  await db.insert(tags).values(tagData).onConflictDoNothing();
  const allTags = await db.select().from(tags);
  const tagIdBySlug = Object.fromEntries(allTags.map((t) => [t.slug, t.id]));
  console.log(`Tags: ${allTags.length}`);

  await db.insert(categories).values(categoryData).onConflictDoNothing();
  const allCategories = await db.select().from(categories);
  const categoryIdBySlug = Object.fromEntries(allCategories.map((c) => [c.slug, c.id]));
  console.log(`Categories: ${allCategories.length}`);

  // ── Projects ───────────────────────────────────────────────────────
  for (const p of projectData) {
    const locale = p.locale as "en" | "pl";
    let [existing] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.slug, p.slug), eq(projects.locale, locale)));
    if (!existing) {
      [existing] = await db
        .insert(projects)
        .values({
          locale,
          slug: p.slug,
          title: p.title,
          description: p.description,
          content: p.content,
          coverImage: p.coverImage,
          imageUrl: p.imageUrl,
          liveUrl: p.liveUrl,
          githubUrl: p.githubUrl,
          createdAt: new Date(p.createdAt),
        })
        .returning();
      console.log(`Created project ${p.slug} (${p.locale})`);
    }
    for (const tagSlug of p.tags) {
      if (tagIdBySlug[tagSlug]) {
        await db
          .insert(projectTags)
          .values({ projectId: existing.id, tagId: tagIdBySlug[tagSlug] })
          .onConflictDoNothing();
      }
    }
  }

  // ── Posts ──────────────────────────────────────────────────────────
  for (const p of postData) {
    const locale = p.locale as "en" | "pl";
    let [existing] = await db
      .select()
      .from(posts)
      .where(and(eq(posts.slug, p.slug), eq(posts.locale, locale)));
    if (!existing) {
      [existing] = await db
        .insert(posts)
        .values({
          locale,
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          content: p.content,
          category: p.category as typeof posts.$inferInsert.category,
          categoryId: p.categorySlug ? categoryIdBySlug[p.categorySlug] : null,
          coverImage: p.coverImage,
          coverBlurDataUrl: p.coverBlurDataUrl,
          metaDescription: p.metaDescription,
          ogImage: p.ogImage,
          readTimeMinutes: p.readTimeMinutes,
          toc: p.toc,
          isPublished: p.isPublished,
          publishedAt: p.publishedAt ? new Date(p.publishedAt) : null,
          createdAt: new Date(p.createdAt),
          updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
        })
        .returning();
      console.log(`Created post ${p.slug} (${p.locale})`);
    }
    for (const tagSlug of p.tags) {
      if (tagIdBySlug[tagSlug]) {
        await db
          .insert(postTags)
          .values({ postId: existing.id, tagId: tagIdBySlug[tagSlug] })
          .onConflictDoNothing();
      }
    }
  }

  // ── Translations ───────────────────────────────────────────────────
  const insertedTranslations = await db
    .insert(translations)
    .values(translationData)
    .onConflictDoNothing()
    .returning();
  console.log(`Translations inserted: ${insertedTranslations.length}`);

  // ── Pages & blocks ─────────────────────────────────────────────────
  const enProjects = await db.select().from(projects).where(eq(projects.locale, "en"));
  const projectIdBySlug = Object.fromEntries(enProjects.map((p) => [p.slug, p.id]));

  const resolveBlockData = (data: Record<string, unknown> | null) => {
    if (!data) return data;
    if (typeof data.projectSlug === "string") {
      const { projectSlug, ...rest } = data;
      return { ...rest, projectId: projectIdBySlug[projectSlug] };
    }
    return data;
  };

  for (const p of pageData) {
    const [existing] = await db.select().from(pages).where(eq(pages.slug, p.slug));
    if (existing) {
      console.log(`Page ${p.slug} already exists, skipping blocks`);
      continue;
    }
    const [page] = await db
      .insert(pages)
      .values({
        slug: p.slug,
        title: p.title,
        metaDescriptionEn: p.metaDescriptionEn,
        metaDescriptionPl: p.metaDescriptionPl,
        isPublished: p.isPublished,
      })
      .returning();
    for (const block of p.blocks) {
      await db.insert(pageBlocks).values({
        pageId: page.id,
        type: block.type as typeof pageBlocks.$inferInsert.type,
        position: block.position,
        dataEn: resolveBlockData(block.dataEn),
        dataPl: resolveBlockData(block.dataPl),
      });
    }
    console.log(`Created page ${p.slug} with ${p.blocks.length} blocks`);
  }

  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
