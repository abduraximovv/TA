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

  const isPending = claims.role === appRole && !claims.isVerified;

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
