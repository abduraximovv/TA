"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

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

export interface AgencyRow {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  is_verified: boolean;
  packages_count: number;
  business_name: string | null;
  created_at: string;
}

export async function getAgencies(): Promise<AgencyRow[]> {
  const supabaseAdmin = getAdminClient();

  // 1. Fetch user_profiles where role = 'agency'
  const { data: profiles, error: pError } = await supabaseAdmin
    .from("user_profiles")
    .select("id, full_name, phone, role, is_verified, created_at")
    .eq("role", "agency")
    .order("created_at", { ascending: false });

  if (pError) throw new Error(`DB Error: ${pError.message}`);

  // 2. Fetch auth users for email map
  const { data: authUsers, error: aError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  if (aError) throw new Error(`Auth Error: ${aError.message}`);
  const emailById = new Map(authUsers.users.map((u) => [u.id, u.email ?? null]));

  // 3. Fetch provider_verifications for business_name map
  const { data: verifications } = await supabaseAdmin
    .from("provider_verifications")
    .select("user_id, business_name");
  const businessMap = new Map((verifications ?? []).map((v) => [v.user_id, v.business_name]));

  // 4. Fetch itineraries/packages for package counts
  const { data: itineraries } = await supabaseAdmin
    .from("itineraries")
    .select("id, user_id");
  
  const countMap = new Map<string, number>();
  (itineraries ?? []).forEach((it) => {
    if (it.user_id) {
      countMap.set(it.user_id, (countMap.get(it.user_id) || 0) + 1);
    }
  });

  return (profiles ?? []).map((p) => ({
    id: p.id,
    full_name: p.full_name,
    email: emailById.get(p.id) ?? null,
    phone: p.phone,
    is_verified: p.is_verified,
    packages_count: countMap.get(p.id) || 0,
    business_name: businessMap.get(p.id) || p.full_name || "Travel Agency",
    created_at: p.created_at,
  }));
}

export async function toggleAgencyVerification(agencyId: string, isVerified: boolean) {
  const supabaseAdmin = getAdminClient();

  const { error: pErr } = await supabaseAdmin
    .from("user_profiles")
    .update({ is_verified: isVerified, updated_at: new Date().toISOString() })
    .eq("id", agencyId);

  if (pErr) throw new Error(`DB Error: ${pErr.message}`);

  await supabaseAdmin
    .from("provider_verifications")
    .update({ status: isVerified ? "approved" : "rejected", updated_at: new Date().toISOString() })
    .eq("user_id", agencyId);

  revalidatePath("/agencies");
  revalidatePath("/verification-hub");
  return { success: true };
}
