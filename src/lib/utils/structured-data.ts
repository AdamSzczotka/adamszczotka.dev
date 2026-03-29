const SITE_URL = "https://adamszczotka.dev";

interface PostForJsonLd {
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  coverImage?: string | null;
  createdAt: Date;
  publishedAt?: Date | null;
  updatedAt?: Date | null;
  readTimeMinutes?: number;
  locale?: string;
}

export function blogPostJsonLd(post: PostForJsonLd): object {
  const url = `${SITE_URL}/${post.locale || "en"}/blog/${post.slug}`;
  const publishedDate = post.publishedAt || post.createdAt;

  const wordCount = post.content
    ? post.content.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length
    : 0;

  const image = post.coverImage
    ? post.coverImage.startsWith("http")
      ? post.coverImage
      : `${SITE_URL}${post.coverImage}`
    : `${SITE_URL}/api/og?title=${encodeURIComponent(post.title)}`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || "",
    url,
    image,
    datePublished: publishedDate.toISOString(),
    dateModified: (post.updatedAt || publishedDate).toISOString(),
    wordCount,
    timeRequired: post.readTimeMinutes
      ? `PT${post.readTimeMinutes}M`
      : undefined,
    author: {
      "@type": "Person",
      name: "Adam Szczotka",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Person",
      name: "Adam Szczotka",
      url: SITE_URL,
    },
    inLanguage: post.locale === "pl" ? "pl-PL" : "en-US",
  };
}

export function personJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Adam Szczotka",
    jobTitle: "Software Engineer",
    url: SITE_URL,
    sameAs: ["https://github.com/adamszczotka"],
  };
}

export function websiteJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Adam Szczotka",
    url: SITE_URL,
    description: "Portfolio and blog by Adam Szczotka",
    author: {
      "@type": "Person",
      name: "Adam Szczotka",
      url: SITE_URL,
    },
  };
}

export function collectionPageJsonLd(
  name: string,
  description: string,
  url: string,
): object {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    author: {
      "@type": "Person",
      name: "Adam Szczotka",
      url: SITE_URL,
    },
  };
}

export function creativeWorkJsonLd(project: {
  title: string;
  description?: string | null;
  url: string;
  githubUrl?: string | null;
  liveUrl?: string | null;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description || "",
    url: project.url,
    author: {
      "@type": "Person",
      name: "Adam Szczotka",
      url: SITE_URL,
    },
    ...(project.liveUrl ? { mainEntityOfPage: project.liveUrl } : {}),
    ...(project.githubUrl
      ? { codeRepository: project.githubUrl }
      : {}),
  };
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[],
): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}
