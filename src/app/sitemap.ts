import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { posts, projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const BASE_URL = "https://adamszczotka.dev";

function withAlternates(
  url: string,
  enPath: string,
  plPath: string,
  opts: Partial<MetadataRoute.Sitemap[number]> = {},
): MetadataRoute.Sitemap[number] {
  return {
    url,
    alternates: {
      languages: {
        en: `${BASE_URL}${enPath}`,
        pl: `${BASE_URL}${plPath}`,
        "x-default": `${BASE_URL}${enPath}`,
      },
    },
    ...opts,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publishedPosts = await db
    .select({ slug: posts.slug, locale: posts.locale, createdAt: posts.createdAt })
    .from(posts)
    .where(eq(posts.isPublished, true));

  const allProjects = await db
    .select({ slug: projects.slug, locale: projects.locale, createdAt: projects.createdAt })
    .from(projects);

  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    withAlternates(`${BASE_URL}/en`, "/en", "/pl", {
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    }),
    withAlternates(`${BASE_URL}/pl`, "/en", "/pl", {
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    }),
    withAlternates(`${BASE_URL}/en/blog`, "/en/blog", "/pl/blog", {
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    }),
    withAlternates(`${BASE_URL}/pl/blog`, "/en/blog", "/pl/blog", {
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    }),
    withAlternates(`${BASE_URL}/en/projects`, "/en/projects", "/pl/projects", {
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }),
    withAlternates(`${BASE_URL}/pl/projects`, "/en/projects", "/pl/projects", {
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }),
    withAlternates(`${BASE_URL}/en/about`, "/en/about", "/pl/about", {
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    }),
    withAlternates(`${BASE_URL}/pl/about`, "/en/about", "/pl/about", {
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    }),
    withAlternates(`${BASE_URL}/en/privacy`, "/en/privacy", "/pl/privacy", {
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    }),
    withAlternates(`${BASE_URL}/pl/privacy`, "/en/privacy", "/pl/privacy", {
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    }),
  ];

  const postEntries: MetadataRoute.Sitemap = publishedPosts.map((post) =>
    withAlternates(
      `${BASE_URL}/${post.locale}/blog/${post.slug}`,
      `/en/blog/${post.slug}`,
      `/pl/blog/${post.slug}`,
      {
        lastModified: post.createdAt,
        changeFrequency: "weekly",
        priority: 0.6,
      },
    ),
  );

  const projectEntries: MetadataRoute.Sitemap = allProjects.map((project) =>
    withAlternates(
      `${BASE_URL}/${project.locale}/projects/${project.slug}`,
      `/en/projects/${project.slug}`,
      `/pl/projects/${project.slug}`,
      {
        lastModified: project.createdAt,
        changeFrequency: "monthly",
        priority: 0.6,
      },
    ),
  );

  return [...staticPages, ...postEntries, ...projectEntries];
}
