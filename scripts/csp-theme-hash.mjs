// Prints the CSP hash for the inline script next-themes injects, which cannot
// carry a nonce (see src/components/layout/theme-provider.tsx).
//
// Usage: start the app, then: node scripts/csp-theme-hash.mjs http://localhost:3000/en
import { createHash } from "node:crypto";

const url = process.argv[2] ?? "http://localhost:3000/en";
const html = await fetch(url).then((r) => r.text());

const match = html.match(
  /<script>((?:\(\(|\(function)[\s\S]*?document\.documentElement[\s\S]*?)<\/script>/,
);
if (!match) {
  console.error("Theme script not found in", url);
  process.exit(1);
}

const hash = createHash("sha256").update(match[1], "utf8").digest("base64");
console.log(`'sha256-${hash}'`);
