import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // /api/og must stay crawlable — it serves the OG images used by
        // social cards on every page without a custom cover
        allow: ["/", "/api/og"],
        disallow: ["/admin/", "/api/"],
      },
      {
        userAgent: ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"],
        allow: "/",
        disallow: ["/admin/"],
      },
    ],
    sitemap: "https://adamszczotka.dev/sitemap.xml",
  };
}
