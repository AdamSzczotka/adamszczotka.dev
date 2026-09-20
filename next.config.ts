import type { NextConfig } from "next";

// Security headers are not set here. The CSP carries a per-request nonce, so it
// is built in src/proxy.ts; X-Content-Type-Options, X-Frame-Options,
// Referrer-Policy and HSTS come from nginx on the server (see docs/DEPLOY.md).
// Setting any of them in both places sends the header twice, which is what
// made a scanner report X-Content-Type-Options as unrecognised.
const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
};

export default nextConfig;
