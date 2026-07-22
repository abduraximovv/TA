import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeAccessToken } from "@repo/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("sb-access-token")?.value;
  const isAuthPage = pathname.startsWith("/login");
  const isRoot = pathname === "/";
  const claims = token ? decodeAccessToken(token) : null;
  const isAdmin = claims?.role === "admin";

  // The root path has no content of its own — it always resolves to /login or /dashboard.
  if (isRoot) {
    return NextResponse.redirect(new URL(token && isAdmin ? "/dashboard" : "/login", request.url));
  }

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isAuthPage && isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Only admins may reach the protected admin routes, even if they hold a valid session
  // for another app (e.g. a provider/agency token leaking in via a shared cookie domain).
  if (token && !isAuthPage && !isAdmin) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/verification-hub/:path*",
    "/analytics/:path*",
    "/users/:path*",
    "/settings/:path*",
    "/login",
  ],
};
