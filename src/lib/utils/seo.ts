import type { Metadata } from "next";

const SITE_URL = "https://adamszczotka.dev";

interface PostForMeta {
  title: string;
  slug: string;
  excerpt?: string | null;
  metaDescription?: string | null;
  coverImage?: string | null;
  ogImage?: string | null;
  createdAt: Date;
  publishedAt?: Date | null;
}

interface PageForMeta {
  title: string;
  slug: string;
  metaDescriptionEn?: string | null;
  metaDescriptionPl?: string | null;
}

export function generatePostMetadata(
  post: PostForMeta,
  locale: string,
): Metadata {
  const description = post.metaDescription || post.excerpt || "";
  const canonicalUrl = `${SITE_URL}/${locale}/blog/${post.slug}`;
  const altLocale = locale === "en" ? "pl" : "en";

  let ogImage: string;
  if (post.ogImage) {
    ogImage = post.ogImage.startsWith("http")
      ? post.ogImage
      : `${SITE_URL}${post.ogImage}`;
  } else if (post.coverImage) {
    ogImage = `${SITE_URL}${post.coverImage}-og.jpg`;
  } else {
    ogImage = `${SITE_URL}/api/og?title=${encodeURIComponent(post.title)}`;
  }

  return {
    title: post.title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${SITE_URL}/en/blog/${post.slug}`,
        pl: `${SITE_URL}/pl/blog/${post.slug}`,
      },
    },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: canonicalUrl,
      publishedTime: (post.publishedAt || post.createdAt).toISOString(),
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function generatePageMetadata(
  page: PageForMeta,
  locale: string,
): Metadata {
  const description =
    locale === "pl" ? page.metaDescriptionPl : page.metaDescriptionEn;
  const canonicalUrl = `${SITE_URL}/${locale}/${page.slug}`;

  return {
    title: page.title,
    description: description || "",
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${SITE_URL}/en/${page.slug}`,
        pl: `${SITE_URL}/pl/${page.slug}`,
      },
    },
    openGraph: {
      type: "website",
      title: page.title,
      description: description || "",
      url: canonicalUrl,
      images: [
        {
          url: `${SITE_URL}/api/og?title=${encodeURIComponent(page.title)}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: description || "",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
