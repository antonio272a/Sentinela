import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/home", "/daily-check-in", "/analytics"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get("userId"));

  if (hasSession && pathname === "/") {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/home";
    return NextResponse.redirect(dashboardUrl);
  }

  const isProtected = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (isProtected && !hasSession) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/home/:path*", "/daily-check-in/:path*", "/analytics/:path*"],
};
