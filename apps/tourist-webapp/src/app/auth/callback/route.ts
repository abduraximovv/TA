import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    // @supabase/ssr's server client persists the exchanged session into cookies itself (via its
    // setAll callback, wired in utils/supabase/server.ts) in the format middleware/API routes
    // expect -- manually setting raw sb-access-token/sb-refresh-token cookies here (as before)
    // used a format the rest of the app's server-side code doesn't recognize.
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
