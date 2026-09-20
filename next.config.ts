import type { NextConfig } from "next";

// Security headers are not set here. The CSP carries a per-request nonce, so it
// is built in src/proxy.ts; X-Content-Type-Options, X-Frame-Options,
// Referrer-Policy and HSTS come from nginx on the server (see docs/DEPLOY.md).
// Setting any of them in both places sends the header twice, which is what
// made a scanner report X-Content-Type-Options as unrecognised.
const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
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
