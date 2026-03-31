import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

const SITE_URL = "https://adamszczotka.dev";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const recentPosts = await db
    .select({
      title: posts.title,
      slug: posts.slug,
      locale: posts.locale,
      excerpt: posts.excerpt,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .where(eq(posts.isPublished, true))
    .orderBy(desc(posts.createdAt))
    .limit(20);

  const items = recentPosts
    .map((post) => {
      const link = `${SITE_URL}/${post.locale}/blog/${post.slug}`;
      const pubDate = new Date(post.createdAt).toUTCString();
      return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description><![CDATA[${post.excerpt ?? ""}]]></description>
      <pubDate>${pubDate}</pubDate>
      <dc:language>${post.locale}</dc:language>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Adam Szczotka</title>
    <link>${SITE_URL}</link>
    <description>Personal portfolio and technical blog by Adam Szczotka, Software Engineer.</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
