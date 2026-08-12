import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Keep the Supabase session active -- also hands back the authenticated user (already
  // verified via supabase.auth.getUser() against the auth server, not just decoded off a
  // cookie), so role-based routing below doesn't need its own separate/hand-rolled JWT parsing.
  const { response, user } = await updateSession(request);

  // 1. Define Route Scopes
  const isPublicAsset = 
    pathname.startsWith("/_next") ||
    pathname.includes("favicon.ico") ||
    pathname.startsWith("/icon-") ||
    pathname.startsWith("/sw.js");

  if (isPublicAsset) {
    return NextResponse.next();
  }

  const isAuthRoute = pathname.startsWith("/auth");

  // Only account-specific pages require a session -- everything else (destinations, discover,
  // service listings/details, packages, map, translator, about, contact, etc.) is public
  // browsing. Actions that actually need an account (booking, reviewing, registering) are gated
  // inline at the component level (e.g. ServiceBookingModal checks `isLoggedIn` and prompts sign-in
  // rather than the whole page being blocked).
  const PROTECTED_PREFIXES = ["/profile", "/dashboard"];
  const isProtectedRoute = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  // 2. Extract Role
  const userRole: string | null = user
    ? user.app_metadata?.role || user.user_metadata?.role || "tourist" // fallback to tourist if logged in but role undefined
    : null;

  // 3. Unauthenticated User attempting to access an account-specific page -> Redirect to Login
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // 4. Role-Based Redirection Matrix (Cross-Domain for other roles)
  if (user && userRole) {
    // Landing/browsing pages stay viewable by anyone regardless of role or login state --
    // only /auth/* (login/register) redirects an already-logged-in tourist away, since landing
    // there while signed in doesn't make sense.
    if (isAuthRoute && userRole === "tourist") {
      const nextParam = request.nextUrl.searchParams.get("next");
      return NextResponse.redirect(new URL(nextParam || "/profile", request.url));
    }

    if (isProtectedRoute && userRole !== "tourist") {
      switch (userRole) {
        case "provider":
          return NextResponse.redirect("http://localhost:3002/dashboard");
        case "agency":
          return NextResponse.redirect("http://localhost:3001/dashboard");
        case "admin":
          return NextResponse.redirect("http://localhost:3000/dashboard");
      }
    }
  }

  // CSP Headers
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://api.mapbox.com;
    style-src 'self' 'unsafe-inline' https://api.mapbox.com;
    img-src 'self' data: blob: https://*.supabase.co https://api.mapbox.com https://*.basemaps.cartocdn.com https://images.unsplash.com;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.mapbox.com https://api.openai.com;
    font-src 'self' https://fonts.gstatic.com;
    frame-src 'none';
    object-src 'none';
  `.replace(/\s{2,}/g, " ").trim();

  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(self), geolocation=(self), microphone=(self)");

  return response;
}
