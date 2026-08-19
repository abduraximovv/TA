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

  // A valid token whose role isn't admin -- e.g. a tourist/provider/agency account signing in
  // (with their own correct password) directly on this app's own login form. Denied outright with
  // the same ?error=wrong_portal signal used by provider-app/agency-portal/tourist-webapp (see
  // packages/auth/src/verificationGuard.ts), rather than forwarded to whichever app the role DOES
  // belong to -- this app has no reliable way to know that app's URL in every environment.
  if (token && !isAuthPage && !isAdmin) {
    return NextResponse.redirect(new URL("/login?error=wrong_portal", request.url));
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
