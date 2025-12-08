import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const APP_DOMAIN = "relead.com.mx";
const LINK_DOMAIN = "rlead.xyz";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const url = req.nextUrl;

  if (host === LINK_DOMAIN) {
    const pathname = url.pathname;

    const isAsset =
      pathname.startsWith("/_next") ||
      pathname.startsWith("/favicon") ||
      pathname.startsWith("/images") ||
      pathname.startsWith("/api");

    if (isAsset) {
      return NextResponse.next();
    }

    const parts = pathname.split("/").filter(Boolean);
    const isPublicSlug = parts.length === 1;

    if (!isPublicSlug) {
      url.hostname = APP_DOMAIN;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
