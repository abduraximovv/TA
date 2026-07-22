import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { evaluateVerificationGuard } from "@repo/auth";

export function middleware(request: NextRequest) {
  const decision = evaluateVerificationGuard({
    pathname: request.nextUrl.pathname,
    accessToken: request.cookies.get("sb-access-token")?.value,
    appRole: "agency",
  });

  if (decision.action === "redirect") {
    return NextResponse.redirect(new URL(decision.to, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon-).*)"],
};
