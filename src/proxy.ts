import { NextRequest, NextResponse } from "next/server";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Let API routes through without locale logic ──────────────────
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
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

  // ── Locale routing ───────────────────────────────────────────────
  // /pl/* — Polish content, let it through
  // /admin/* — no locale prefix, already handled above
  // Everything else — English (default), no redirect needed
  if (pathname.startsWith("/pl/") || pathname === "/pl") {
    return NextResponse.next();
  }

  return NextResponse.next();
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
