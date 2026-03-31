import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "pl"] as const;
const defaultLocale = "en";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract locale from path
  const segment = pathname.split("/")[1];
  const locale = locales.includes(segment as (typeof locales)[number])
    ? segment
    : defaultLocale;

  const response = NextResponse.next();
  response.headers.set("x-locale", locale);

  return response;
}

export const config = {
  matcher: ["/((?!_next|api|admin|favicon.ico|feed.xml|sitemap.xml|robots.txt|.*\\..*).*)"],
};
