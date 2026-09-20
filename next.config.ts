import type { NextConfig } from "next";

// Security headers are not set here. The CSP carries a per-request nonce, so it
// is built in src/proxy.ts; X-Content-Type-Options, X-Frame-Options,
// Referrer-Policy and HSTS come from nginx on the server (see docs/DEPLOY.md).
// Setting any of them in both places sends the header twice, which is what
// made a scanner report X-Content-Type-Options as unrecognised.
// src/proxy.ts sets the CSP for everything it runs on, but its matcher skips
// static assets — and one of those paths (/_next/static) answers with an HTML
// 404, a document with no policy at all. These paths never need a nonce, so a
// fixed, maximally restrictive policy covers them. Keep the sources in sync
// with the matcher exclusions in src/proxy.ts, or a header lands twice.
const STATIC_ASSET_CSP =
  "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";

const STATIC_ASSET_PATHS = [
  "/_next/static",
  "/_next/static/:path*",
  "/_next/image",
  "/favicon.ico",
  "/sitemap.xml",
  "/robots.txt",
  "/:path*.:ext(svg|png|jpg|jpeg|gif|webp|ico)",
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  headers: async () =>
    STATIC_ASSET_PATHS.map((source) => ({
      source,
      headers: [{ key: "Content-Security-Policy", value: STATIC_ASSET_CSP }],
    })),
  // Legacy unprefixed URLs. Done here rather than with redirect() inside a page
  // component, which answers with a full HTML body attached to the redirect.
  redirects: async () => [
    { source: "/", destination: "/en", permanent: true },
    { source: "/about", destination: "/en/about", permanent: true },
    { source: "/projects", destination: "/en/projects", permanent: true },
    { source: "/privacy", destination: "/en/privacy", permanent: true },
    { source: "/blog", destination: "/en/blog", permanent: true },
    { source: "/blog/:slug", destination: "/en/blog/:slug", permanent: true },
    { source: "/projects/:slug", destination: "/en/projects/:slug", permanent: true },
  ],
};

export default nextConfig;
