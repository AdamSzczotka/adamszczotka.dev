import { NextRequest, NextResponse } from "next/server";

const isDev = process.env.NODE_ENV === "development";

// A per-request nonce is what lets script-src drop 'unsafe-inline': every
// inline script either carries this nonce or does not run. Next reads the
// nonce out of the request's CSP header and stamps its own script tags with
// it; ours get it from the x-nonce header via headers().
// next-themes renders its theme script without passing through any prop, so it
// cannot take the nonce and is allowed by hash instead. Regenerate after
// upgrading next-themes or changing ThemeProvider's options:
//   npm run csp:hash
// If it ever goes stale the script is blocked, which costs nothing visible —
// the inline script in app/layout.tsx already applies the theme before paint.
const THEME_SCRIPT_HASH = "'sha256-wkjS4zijHQljbuQzwpQdd2Wvq3fpRtpxgPGRt+U5jFY='";

function buildCsp(nonce: string) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' ${THEME_SCRIPT_HASH}${isDev ? " 'unsafe-eval'" : ""}`,
    // Next injects inline styles it does not nonce, so this one stays.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' https://fonts.gstatic.com",
    `connect-src 'self'${isDev ? " ws://localhost:*" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

function withSecurityHeaders(response: NextResponse, csp: string) {
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const nonce = crypto.randomUUID().replaceAll("-", "");
  const csp = buildCsp(nonce);

  // Next looks for the nonce on the *request* headers, so they have to be
  // forwarded, not just set on the response.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  // ── Let API routes through without locale logic ──────────────────
  if (pathname.startsWith("/api")) {
    return withSecurityHeaders(
      NextResponse.next({ request: { headers: requestHeaders } }),
      csp,
    );
  }

  // ── Admin auth protection ────────────────────────────────────────
  // Middleware validates token format for UX; the real security gate
  // is requireAdmin() in every server action and page component.
  const sessionToken = request.cookies.get("better-auth.session_token")?.value;
  const isValidFormat = sessionToken && sessionToken.length >= 32;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!isValidFormat) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  if (pathname === "/admin/login" && isValidFormat) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // ── Locale detection for html lang attribute ─────────────────────
  const segment = pathname.split("/")[1];
  const locale = segment === "pl" ? "pl" : "en";

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("x-locale", locale);
  return withSecurityHeaders(response, csp);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
