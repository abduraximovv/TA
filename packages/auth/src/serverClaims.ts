import type { UserRole } from "./SessionProvider";

export interface AccessTokenClaims {
  role: UserRole | null;
  isVerified: boolean;
}

/**
 * Decodes a Supabase access token's payload without verifying its signature.
 * Safe to run in Edge middleware (uses only atob/JSON, no Node APIs) — mirrors the
 * pattern already used in apps/tourist-webapp/src/middleware.ts so all apps share one
 * implementation instead of re-deriving it per app.
 */
export function decodeAccessToken(token: string): AccessTokenClaims | null {
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
    const payload = JSON.parse(jsonPayload);
    const rawRole = payload.app_metadata?.role ?? payload.user_metadata?.role ?? null;
    const role: UserRole | null =
      rawRole === "tourist" || rawRole === "provider" || rawRole === "agency" || rawRole === "admin"
        ? rawRole
        : null;
    const isVerified = Boolean(payload.app_metadata?.is_verified);
    return { role, isVerified };
  } catch {
    return null;
  }
}
