import type sanitizeHtml from "sanitize-html";

export const CONTENT_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "br", "hr",
    "ul", "ol", "li",
    "strong", "em", "s", "u",
    "a", "img",
    "pre", "code",
    "blockquote",
    "table", "thead", "tbody", "tr", "th", "td",
    "div", "span",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height"],
    code: ["class"],
    pre: ["class"],
    div: ["data-slider"],
    h2: ["id"],
    h3: ["id"],
    h4: ["id"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: {
    img: ["http", "https"],
  },
};
