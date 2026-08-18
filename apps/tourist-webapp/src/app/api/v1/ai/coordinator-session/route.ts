import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Same request-scoped-client-via-bearer-token pattern as /api/v1/bookings/route.ts -- the plain
// getSupabase() singleton has no session on the server, and this route needs RLS
// (auth.uid() = user_id on coordinator_sessions) to actually see who's asking.
function authedClient(token: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

function bearerToken(req: Request): string | null {
  const authHeader = req.headers.get("Authorization");
  return authHeader?.split(" ")[1] ?? null;
}

// GET -- load the signed-in tourist's saved SafronCoordinator session, if any.
export async function GET(req: Request) {
  try {
    const token = bearerToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = authedClient(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("coordinator_sessions")
      .select("state, updated_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ state: data?.state ?? null, updated_at: data?.updated_at ?? null });
  } catch (error: any) {
    console.error("Coordinator session load failed:", error);
    return NextResponse.json({ error: error.message || "Failed to load session" }, { status: 400 });
  }
}

// PUT -- upsert the current session state. Body: { state: <arbitrary JSON snapshot> }.
export async function PUT(req: Request) {
  try {
    const token = bearerToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = authedClient(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    if (body?.state === undefined) {
      return NextResponse.json({ error: "Missing state" }, { status: 400 });
    }

    const { error } = await supabase
      .from("coordinator_sessions")
      .upsert({ user_id: user.id, state: body.state, updated_at: new Date().toISOString() } as never, { onConflict: "user_id" });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Coordinator session save failed:", error);
    return NextResponse.json({ error: error.message || "Failed to save session" }, { status: 400 });
  }
}

// DELETE -- clear the saved session (called once a booking actually completes; an already-booked
// draft has nothing left to resume).
export async function DELETE(req: Request) {
  try {
    const token = bearerToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = authedClient(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { error } = await supabase.from("coordinator_sessions").delete().eq("user_id", user.id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Coordinator session clear failed:", error);
    return NextResponse.json({ error: error.message || "Failed to clear session" }, { status: 400 });
  }
}
