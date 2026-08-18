import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { evaluateVerificationGuard } from "@repo/auth";

export function middleware(request: NextRequest) {
  const decision = evaluateVerificationGuard({
    pathname: request.nextUrl.pathname,
    // Must match accessTokenCookieName() in packages/auth/src/SessionProvider.tsx for this app's
    // NEXT_PUBLIC_APP_ROLE ("provider") -- was the shared literal "sb-access-token" before, which
    // any of the other three apps' sign-ins would also write on this same host.
    accessToken: request.cookies.get("sb-provider-access-token")?.value,
    appRole: "provider",
  });

  if (decision.action === "redirect") {
    return NextResponse.redirect(new URL(decision.to, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon-|manifest|sw.js).*)"],
};
