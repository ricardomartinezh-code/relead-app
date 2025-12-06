import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const RESERVED_PATHS = new Set([
  "api",
  "auth",
  "dashboard",
  "settings",
  "link-pages",
  "legal",
  "_next",
]);

export function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const segments = url.pathname.split("/").filter(Boolean);

  if (segments.length === 2) {
    const [username, slug] = segments;

    const acceptsHtml = request.headers.get("accept")?.includes("text/html");
    const isStaticFile = slug.includes(".") || username.startsWith("_");

    if (acceptsHtml && !isStaticFile && !RESERVED_PATHS.has(username)) {
      const redirectUrl = new URL(`/link-pages/${username}/${slug}`, url.origin);
      return NextResponse.redirect(redirectUrl, 308);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
