"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getAdminClient() {
  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export interface UserProfileRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: "tourist" | "provider" | "agency" | "admin";
  is_verified: boolean;
  created_at: string;
  email: string | null;
}

export async function getAllUserProfiles(): Promise<UserProfileRow[]> {
  const supabaseAdmin = getAdminClient();

  const { data: profiles, error } = await supabaseAdmin
    .from("user_profiles")
    .select("id, full_name, phone, role, is_verified, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  // Email lives on auth.users, not user_profiles -- fetch it via the admin API and join in memory.
  const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  if (authError) throw new Error(authError.message);
  const emailById = new Map(authUsers.users.map((u) => [u.id, u.email ?? null]));

  return (profiles ?? []).map((p) => ({
    ...(p as Omit<UserProfileRow, "email">),
    email: emailById.get(p.id) ?? null,
  }));
}
