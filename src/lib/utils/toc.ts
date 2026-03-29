export type TocEntry = { id: string; text: string; level: 2 | 3 };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function extractToc(html: string): { toc: TocEntry[]; html: string } {
  const toc: TocEntry[] = [];
  const slugCounts = new Map<string, number>();

  const enrichedHtml = html.replace(
    /<(h[23])(\s[^>]*)?>([^<]*)<\/\1>/gi,
    (match, tag: string, attrs: string | undefined, text: string) => {
      const level = (tag.toLowerCase() === "h2" ? 2 : 3) as 2 | 3;
      const trimmedText = text.trim();

      // Check if heading already has an id
      const existingId = attrs?.match(/id=["']([^"']+)["']/)?.[1];

      let id: string;
      if (existingId) {
        id = existingId;
      } else {
        const baseSlug = slugify(trimmedText);
        const count = slugCounts.get(baseSlug) ?? 0;
        id = count === 0 ? baseSlug : `${baseSlug}-${count}`;
        slugCounts.set(baseSlug, count + 1);
      }

      toc.push({ id, text: trimmedText, level });

      if (existingId) {
        return match;
      }

      const attrStr = attrs ? ` ${attrs.trim()}` : "";
      return `<${tag}${attrStr} id="${id}">${trimmedText}</${tag}>`;
    },
  );

  return { toc, html: enrichedHtml };
}
