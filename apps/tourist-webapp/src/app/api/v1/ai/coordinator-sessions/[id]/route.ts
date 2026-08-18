import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

// GET -- load one specific session's full state (used when the user clicks a chat in the history
// list to resume it).
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = bearerToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = authedClient(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("coordinator_sessions")
      .select("id, title, state, updated_at")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    return NextResponse.json({ session: data });
  } catch (error: any) {
    console.error("Coordinator session load failed:", error);
    return NextResponse.json({ error: error.message || "Failed to load session" }, { status: 400 });
  }
}

// PUT -- upsert this specific session (create it if this id hasn't been saved yet, update it
// otherwise). The client owns the id -- generated client-side the first time a new chat has
// anything worth saving -- so this is always a plain upsert-by-id, never a "create and return a
// new id" round trip. Body: { state: <jsonb snapshot>, title?: string }.
export async function PUT(req: Request, { params }: { params: { id: string } }) {
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
      .upsert(
        {
          id: params.id,
          user_id: user.id,
          state: body.state,
          title: typeof body.title === "string" ? body.title.slice(0, 200) : null,
          updated_at: new Date().toISOString(),
        } as never,
        { onConflict: "id" }
      );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Coordinator session save failed:", error);
    return NextResponse.json({ error: error.message || "Failed to save session" }, { status: 400 });
  }
}

// DELETE -- remove this one specific session (the per-row delete button in the history list).
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = bearerToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = authedClient(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { error } = await supabase
      .from("coordinator_sessions")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Coordinator session delete failed:", error);
    return NextResponse.json({ error: error.message || "Failed to delete session" }, { status: 400 });
  }
}
