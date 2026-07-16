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

  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/map") ||
    pathname.startsWith("/_next") ||
    pathname.includes("favicon.ico") ||
    pathname.startsWith("/icon-") ||
    pathname.startsWith("/sw.js");

  const accessToken = request.cookies.get("sb-access-token")?.value;

  let userRole: string | null = null;
  if (accessToken) {
    const payload = parseJwt(accessToken);
    if (payload) {
      userRole = payload.app_metadata?.role || payload.user_metadata?.role || null;
    }
  }

  if (!isPublicRoute) {
    if (!accessToken) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if (userRole && userRole !== "tourist" && userRole !== "agency") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "invalid_portal");
      
      const response = NextResponse.redirect(url);
      response.cookies.delete("sb-access-token");
      response.cookies.delete("sb-refresh-token");
      return response;
    }
  }

  const response = NextResponse.next();
  
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' https://api.mapbox.com;
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
