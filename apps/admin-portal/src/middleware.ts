import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeAccessToken } from "@repo/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Must match accessTokenCookieName() in packages/auth/src/SessionProvider.tsx for this app's
  // NEXT_PUBLIC_APP_ROLE ("admin") -- was the shared literal "sb-access-token" before, which any
  // of the other three apps' sign-ins would also write on this same host (this app's own role
  // check below already rejected a leaked non-admin token from reaching admin routes, but did
  // nothing to stop tourist-webapp/provider-app/agency-portal from treating an admin session as
  // their own -- the cookie name split fixes the leak itself, not just this app's symptom of it).
  const token = request.cookies.get("sb-admin-access-token")?.value;
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

  // Defense in depth: only admins may reach the protected admin routes even if a non-admin
  // token somehow ends up in this app's cookie (the app-scoped cookie name above is the primary
  // defense against that happening at all -- see its comment).
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
