import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Define Route Scopes
  const isPublicAsset = 
    pathname.startsWith("/_next") ||
    pathname.includes("favicon.ico") ||
    pathname.startsWith("/icon-") ||
    pathname.startsWith("/sw.js");

  if (isPublicAsset) {
    return NextResponse.next();
  }

  const isPublicLanding = pathname === "/";
  const isAuthRoute = pathname.startsWith("/auth");
  
  // F-T01 and F-T04 can be public if needed, but the prompt says:
  // "Enforce server-side protection for all routes except / and /auth/*."
  // So /map and /translator become protected.
  const isPublicRoute = isPublicLanding || isAuthRoute;

  // 2. Extract Token and Role
  const accessToken = request.cookies.get("sb-access-token")?.value;
  let userRole: string | null = null;
  
  if (accessToken) {
    const payload = parseJwt(accessToken);
    if (payload) {
      userRole = payload.app_metadata?.role || payload.user_metadata?.role || "tourist"; // fallback to tourist if logged in but role undefined
    }
  }

  // 3. Unauthenticated User attempting to access Private Routes -> Redirect to Login
  if (!isPublicRoute && !accessToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // 4. Role-Based Redirection Matrix (Cross-Domain for other roles)
  if (accessToken && userRole) {
    // If they hit the public landing page or auth routes while logged in, redirect them to their dashboard
    if (isPublicRoute) {
      switch (userRole) {
        case "tourist":
          return NextResponse.redirect(new URL("/dashboard", request.url));
        case "provider":
          return NextResponse.redirect("http://localhost:3002/dashboard");
        case "agency":
          return NextResponse.redirect("http://localhost:3000/dashboard");
        case "admin":
          return NextResponse.redirect("http://localhost:3001/dashboard");
      }
    }

    if (!isPublicRoute && userRole !== "tourist") {
      switch (userRole) {
        case "provider":
          return NextResponse.redirect("http://localhost:3002/dashboard");
        case "agency":
          return NextResponse.redirect("http://localhost:3000/dashboard");
        case "admin":
          return NextResponse.redirect("http://localhost:3001/dashboard");
      }
    }
  }

  const response = NextResponse.next();
  
  // CSP Headers
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://api.mapbox.com;
    style-src 'self' 'unsafe-inline' https://api.mapbox.com;
    img-src 'self' data: blob: https://*.supabase.co https://api.mapbox.com;
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
