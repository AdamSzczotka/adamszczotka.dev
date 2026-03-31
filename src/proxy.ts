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

  // ── Locale detection for html lang attribute ─────────────────────
  const segment = pathname.split("/")[1];
  const locale = segment === "pl" ? "pl" : "en";

  const response = NextResponse.next();
  response.headers.set("x-locale", locale);
  return response;
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
