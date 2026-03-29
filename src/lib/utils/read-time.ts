export function calculateReadTime(html: string): number {
  // Count code blocks before stripping tags
  const codeBlockCount = (html.match(/<pre[\s>]/gi) || []).length;

  // Strip HTML tags and decode entities
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  const wordCount = text ? text.split(/\s+/).length : 0;
  const readingMinutes = wordCount / 238;
  const codeMinutes = codeBlockCount * 0.5;

  return Math.max(1, Math.ceil(readingMinutes + codeMinutes));
}
