import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { posts, projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const BASE_URL = "https://adamszczotka.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publishedPosts = await db
    .select({ slug: posts.slug, locale: posts.locale, createdAt: posts.createdAt })
    .from(posts)
    .where(eq(posts.isPublished, true));

  const allProjects = await db
    .select({ slug: projects.slug, locale: projects.locale, createdAt: projects.createdAt })
    .from(projects);

  const staticPages = [
    { url: BASE_URL, changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${BASE_URL}/en`, changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${BASE_URL}/pl`, changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${BASE_URL}/en/blog`, changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${BASE_URL}/pl/blog`, changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${BASE_URL}/en/projects`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${BASE_URL}/pl/projects`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${BASE_URL}/en/about`, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${BASE_URL}/pl/about`, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${BASE_URL}/en/privacy`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${BASE_URL}/pl/privacy`, changeFrequency: "monthly" as const, priority: 0.6 },
  ];

  const postEntries: MetadataRoute.Sitemap = publishedPosts.map((post) => ({
    url: `${BASE_URL}/${post.locale}/blog/${post.slug}`,
    lastModified: post.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const projectEntries: MetadataRoute.Sitemap = allProjects.map((project) => ({
    url: `${BASE_URL}/${project.locale}/projects/${project.slug}`,
    lastModified: project.createdAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...postEntries, ...projectEntries];
}
