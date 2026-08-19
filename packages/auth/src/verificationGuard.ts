import { decodeAccessToken } from "./serverClaims";

export interface VerificationGuardInput {
  pathname: string;
  accessToken: string | undefined;
  /** The role this app belongs to (provider-app -> "provider", agency-portal -> "agency"). */
  appRole: "provider" | "agency";
}

export type VerificationGuardDecision =
  | { action: "next" }
  | { action: "redirect"; to: string };

/**
 * Shared route-gating logic for the B2B verification funnel, used by provider-app and
 * agency-portal middleware. Kept framework-agnostic (no next/server import) so it has
 * no dependency on the "next" package from within @repo/auth; each app's middleware.ts
 * wraps the decision with NextResponse itself.
 */
export function evaluateVerificationGuard({
  pathname,
  accessToken,
  appRole,
}: VerificationGuardInput): VerificationGuardDecision {
  const isPublicAsset =
    pathname.startsWith("/_next") ||
    pathname.includes("favicon.ico") ||
    pathname.startsWith("/icon-") ||
    pathname.startsWith("/manifest") ||
    pathname === "/sw.js";

  if (isPublicAsset) {
    return { action: "next" };
  }

  const isAuthRoute = pathname.startsWith("/auth");
  const isPublicRoute = pathname === "/" || isAuthRoute;

  const claims = accessToken ? decodeAccessToken(accessToken) : null;

  if (!claims) {
    if (!isPublicRoute) {
      return { action: "redirect", to: `/auth/login?next=${encodeURIComponent(pathname)}` };
    }
    return { action: "next" };
  }

  // A token is valid but belongs to a DIFFERENT app entirely -- e.g. a tourist or admin account
  // signing in (with their own correct password) directly on provider-app or agency-portal's own
  // login form. This must be checked, and must return, BEFORE isPending below: isPending's own
  // condition (claims.role === appRole && !isVerified) is also false for a mismatched role, and
  // falling through to the "not pending -> redirect to dashboard" branch further down would bounce
  // a mismatched user back and forth between /auth/login and /dashboard forever. Denied outright
  // rather than forwarded to whatever app the role DOES belong to -- this app has no reliable way
  // to know that app's URL in every environment, and not revealing it is the safer default anyway.
  if (claims.role !== appRole) {
    if (isPublicRoute) {
      return { action: "next" }; // let /auth/login itself render (with its own error message) without looping
    }
    return { action: "redirect", to: "/auth/login?error=wrong_portal" };
  }

  const isPending = !claims.isVerified;

  if (isPending && pathname !== "/auth/pending") {
    return { action: "redirect", to: "/auth/pending" };
  }

  if (!isPending && pathname === "/auth/pending") {
    return { action: "redirect", to: "/dashboard" };
  }

  if (!isPending && (pathname === "/auth/login" || pathname === "/auth/register")) {
    return { action: "redirect", to: "/dashboard" };
  }

  return { action: "next" };
}
