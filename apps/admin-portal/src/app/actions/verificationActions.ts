"use server";

import { createClient } from "@supabase/supabase-js";
import { unstable_noStore, revalidatePath } from "next/cache";

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

export interface VerificationRequestRow {
  id: string;
  user_id: string;
  business_name: string;
  email: string;
  phone: string | null;
  role: "provider" | "agency";
  status: "pending" | "approved" | "rejected" | "incomplete";
  created_at: string;
}

export async function getUnifiedVerificationRequests(): Promise<VerificationRequestRow[]> {
  unstable_noStore();
  const supabaseAdmin = getAdminClient();

  // 1. Fetch provider & agency user profiles
  const { data: profiles, error: pErr } = await supabaseAdmin
    .from("user_profiles")
    .select("id, full_name, phone, role, is_verified, created_at")
    .in("role", ["provider", "agency"]);
  if (pErr) throw new Error(`DB Error: ${pErr.message}`);

  // 2. Fetch provider verifications table
  const { data: verifications, error: vErr } = await supabaseAdmin
    .from("provider_verifications")
    .select("*");
  if (vErr) throw new Error(`DB Error: ${vErr.message}`);

  // 3. Fetch auth users for email map
  const { data: authUsers, error: aErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  if (aErr) throw new Error(`Auth Error: ${aErr.message}`);
  const emailById = new Map(authUsers.users.map((u) => [u.id, u.email ?? null]));

  const verMap = new Map((verifications ?? []).map((v) => [v.user_id, v]));

  // Combine user_profiles and provider_verifications so ALL providers and agencies show in the queue
  const rows: VerificationRequestRow[] = (profiles ?? []).map((p) => {
    const v = verMap.get(p.id);
    const email = emailById.get(p.id) || v?.email || "—";
    const business_name = v?.business_name || p.full_name || "Business Account";

    // Determine status: if provider_verifications has status, use it; otherwise infer from is_verified
    let status: "pending" | "approved" | "rejected" | "incomplete" = "incomplete";
    if (v?.status) {
      status = v.status as "pending" | "approved" | "rejected";
    } else if (p.is_verified) {
      status = "approved";
    }

    const req: VerificationRequestRow = {
      id: v?.id || p.id,
      user_id: p.id,
      business_name,
      email,
      phone: p.phone || v?.phone || null,
      role: p.role as "provider" | "agency",
      status,
      created_at: v?.created_at || p.created_at,
    };
    return req;
  });

  // Sort: pending requests first, then by date descending
  return rows.sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export async function approveUser(requestId: string, userId: string) {
  const supabaseAdmin = getAdminClient();

  // 1. Auth app_metadata
  const { data: existing, error: getError } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (!getError && existing?.user) {
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      app_metadata: { ...existing.user.app_metadata, is_verified: true },
    });
  }

  // 2. User profile
  const { error: profileError } = await supabaseAdmin
    .from("user_profiles")
    .update({ is_verified: true, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (profileError) {
    throw new Error(`Profile Error: ${profileError.message}`);
  }

  // 3. Provider verification (upsert to handle users missing a row in provider_verifications)
  const { data: profile } = await supabaseAdmin.from("user_profiles").select("*").eq("id", userId).single();
  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);

  await supabaseAdmin
    .from("provider_verifications")
    .upsert(
      {
        user_id: userId,
        role: profile?.role || "provider",
        business_name: profile?.full_name || "Business Account",
        email: authUser?.user?.email || "unknown@example.com",
        status: "approved",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  revalidatePath("/verification-hub");
  revalidatePath("/providers");
  revalidatePath("/agencies");
  return { success: true };
}

export async function rejectUser(requestId: string, reason: string) {
  const supabaseAdmin = getAdminClient();

  // Update user_profile is_verified = false
  const { data: ver } = await supabaseAdmin.from("provider_verifications").select("user_id").eq("id", requestId).single();
  const userId = ver?.user_id || requestId;

  await supabaseAdmin
    .from("user_profiles")
    .update({ is_verified: false, updated_at: new Date().toISOString() })
    .eq("id", userId);

  await supabaseAdmin
    .from("provider_verifications")
    .upsert(
      {
        user_id: userId,
        role: "provider",
        business_name: "Business Account",
        email: "unknown@example.com",
        status: "rejected",
        metadata: { rejection_reason: reason },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  revalidatePath("/verification-hub");
  revalidatePath("/providers");
  revalidatePath("/agencies");
  return { success: true };
}
