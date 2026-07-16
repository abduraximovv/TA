import { NextResponse } from "next/server";
import { getSupabase } from "@repo/database";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.session) {
      const response = NextResponse.redirect(`${origin}${next}`);
      
      response.cookies.set("sb-access-token", data.session.access_token, {
        path: "/",
        maxAge: data.session.expires_in,
        sameSite: "lax",
        secure: true,
      });
      response.cookies.set("sb-refresh-token", data.session.refresh_token, {
        path: "/",
        maxAge: 604800,
        sameSite: "lax",
        secure: true,
      });
      
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
