import { and, eq } from "drizzle-orm";
import { db } from "../src/lib/db";
import {
  pageBlockTypeEnum,
  pageBlocks,
  pages,
  posts,
  projectTags,
  projects,
  tags,
  translations,
} from "../src/lib/db/schema";
import pageData from "../content/pages.json";
import projectData from "../content/projects.json";
import tagData from "../content/tags.json";
import translationData from "../content/translations.json";

// content/ is the source of truth for repo-managed content: projects and the
// block-based pages (home, about, privacy). This script pushes it into the
// database, inserting or updating by slug, and runs on every production deploy.
// Blog posts stay CMS-owned: their text is never replaced from content/, and
// the only thing done to them here is normalising em dashes to plain hyphens.
// Translations are CMS-editable too, so new keys are added but existing ones
// are left alone.
//
// Usage: npx tsx --env-file=.env scripts/sync-content.ts

type BlockType = (typeof pageBlockTypeEnum)["enumValues"][number];
type Slide = { src: string; alt: string; title: string; description: string };

type ProjectRow = {
  locale: "en" | "pl";
  slug: string;
  title: string;
  description: string | null;
  content: string | null;
  coverImage: string | null;
  imageUrl: string | null;
  liveUrl: string | null;
  githubUrl: string | null;
  slides: Slide[] | null;
  tags: string[];
  createdAt: string;
};

type PageRow = {
  slug: string;
  title: string;
  metaDescriptionEn: string | null;
  metaDescriptionPl: string | null;
  isPublished: boolean;
  blocks: {
    type: BlockType;
    position: number;
    dataEn: Record<string, unknown>;
    dataPl: Record<string, unknown>;
  }[];
};

async function syncProjects(tagIdBySlug: Record<string, number>) {
  for (const p of projectData as ProjectRow[]) {
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
      .where(and(eq(projects.slug, p.slug), eq(projects.locale, p.locale)));

    let projectId: number;
    if (existing) {
      await db.update(projects).set(values).where(eq(projects.id, existing.id));
      projectId = existing.id;
      console.log(`Project updated: ${p.slug} (${p.locale})`);
    } else {
      const [created] = await db
        .insert(projects)
        .values({
          ...values,
          slug: p.slug,
          locale: p.locale,
          createdAt: new Date(p.createdAt),
        })
        .returning();
      projectId = created.id;
      console.log(`Project created: ${p.slug} (${p.locale})`);
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
}

// Blocks are positional, so the whole set is replaced rather than diffed.
// Editing these pages in the CMS is therefore not durable: content/pages.json
// wins on the next deploy.
async function syncPages() {
  for (const p of pageData as PageRow[]) {
    const values = {
      title: p.title,
      metaDescriptionEn: p.metaDescriptionEn,
      metaDescriptionPl: p.metaDescriptionPl,
      isPublished: p.isPublished,
    };

    const [existing] = await db
      .select({ id: pages.id })
      .from(pages)
      .where(eq(pages.slug, p.slug));

    let pageId: number;
    if (existing) {
      await db.update(pages).set(values).where(eq(pages.id, existing.id));
      pageId = existing.id;
      console.log(`Page updated: ${p.slug}`);
    } else {
      const [created] = await db
        .insert(pages)
        .values({ ...values, slug: p.slug })
        .returning();
      pageId = created.id;
      console.log(`Page created: ${p.slug}`);
    }

    await db.delete(pageBlocks).where(eq(pageBlocks.pageId, pageId));
    for (const block of p.blocks) {
      await db.insert(pageBlocks).values({
        pageId,
        type: block.type,
        position: block.position,
        dataEn: block.dataEn,
        dataPl: block.dataPl,
      });
    }
    console.log(`  ${p.blocks.length} blocks`);
  }
}

// UI strings are editable in the CMS, so existing keys are left alone; this
// only delivers keys newly added in the repo.
async function syncTranslations() {
  const inserted = await db
    .insert(translations)
    .values(translationData)
    .onConflictDoNothing()
    .returning({ key: translations.key });
  console.log(
    inserted.length > 0
      ? `Translations added: ${inserted.map((t) => t.key).join(", ")}`
      : "Translations: no new keys",
  );
}

// Blog posts live in the database, not in content/, so the em dashes Adam does
// not want in his writing can only be reached here. Idempotent: once a post
// holds none, it is left alone.
async function normalizeDashes() {
  const all = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      locale: posts.locale,
      title: posts.title,
      excerpt: posts.excerpt,
      content: posts.content,
      metaDescription: posts.metaDescription,
      toc: posts.toc,
    })
    .from(posts);

  const strip = (v: string | null) => (v ? v.replaceAll("—", "-") : v);
  let changed = 0;

  for (const p of all) {
    const next = {
      title: strip(p.title) as string,
      excerpt: strip(p.excerpt),
      content: strip(p.content),
      metaDescription: strip(p.metaDescription),
      toc: p.toc
        ? (JSON.parse(JSON.stringify(p.toc).replaceAll("—", "-")) as typeof p.toc)
        : p.toc,
    };

    const untouched =
      next.title === p.title &&
      next.excerpt === p.excerpt &&
      next.content === p.content &&
      next.metaDescription === p.metaDescription &&
      JSON.stringify(next.toc) === JSON.stringify(p.toc);
    if (untouched) continue;

    await db.update(posts).set(next).where(eq(posts.id, p.id));
    console.log(`Dashes normalised in post: ${p.slug} (${p.locale})`);
    changed++;
  }

  if (changed === 0) console.log("Dashes: nothing to normalise");
}

async function syncContent() {
  await db.insert(tags).values(tagData).onConflictDoNothing();
  const allTags = await db.select().from(tags);
  const tagIdBySlug = Object.fromEntries(allTags.map((t) => [t.slug, t.id]));

  await syncTranslations();
  await normalizeDashes();
  await syncProjects(tagIdBySlug);
  await syncPages();
  console.log("Content sync done.");
  process.exit(0);
}

syncContent().catch((err) => {
  console.error(err);
  process.exit(1);
});
