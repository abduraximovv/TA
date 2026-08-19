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

// GET -- list the signed-in tourist's saved SafronCoordinator sessions, most recently updated
// first. Deliberately lightweight: id/title/timestamps only, NOT the full state jsonb blob (which
// can carry a full itinerary + matched packages' nested items) -- the history list only needs
// enough to render itself, individual sessions are fetched in full via GET [id] on demand.
export async function GET(req: Request) {
  try {
    const token = bearerToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = authedClient(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("coordinator_sessions")
      .select("id, title, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ sessions: data ?? [] });
  } catch (error: any) {
    console.error("Coordinator sessions list failed:", error);
    return NextResponse.json({ error: error.message || "Failed to list sessions" }, { status: 400 });
  }
}

// DELETE -- clear ALL of the signed-in tourist's saved sessions ("Clear history" in the panel,
// as distinct from deleting one session at a time via DELETE [id]).
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
    console.error("Coordinator sessions clear-all failed:", error);
    return NextResponse.json({ error: error.message || "Failed to clear history" }, { status: 400 });
  }
}
