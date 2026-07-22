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

export async function approveUser(requestId: string, userId: string) {
  const supabaseAdmin = getAdminClient();

  // Merge into the existing app_metadata rather than replacing it outright, so we don't
  // accidentally wipe the user's `role` claim.
  const { data: existing, error: getError } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (getError || !existing.user) {
    throw new Error(getError?.message || "User not found.");
  }

  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: { ...existing.user.app_metadata, is_verified: true },
  });
  if (authError) {
    throw new Error(`Auth Error: ${authError.message}`);
  }

  const { error: profileError } = await supabaseAdmin
    .from("user_profiles")
    .update({ is_verified: true, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (profileError) {
    throw new Error(`Profile Error: ${profileError.message}`);
  }

  const { error: dbError } = await supabaseAdmin
    .from("provider_verifications")
    .update({ status: "approved", updated_at: new Date().toISOString() })
    .eq("id", requestId);
  if (dbError) {
    throw new Error(`DB Error: ${dbError.message}`);
  }

  revalidatePath("/verification-hub");
  return { success: true };
}

export async function rejectUser(requestId: string, reason: string) {
  const supabaseAdmin = getAdminClient();

  const { data: existingRequest, error: fetchError } = await supabaseAdmin
    .from("provider_verifications")
    .select("metadata")
    .eq("id", requestId)
    .single();
  if (fetchError) {
    throw new Error(`DB Error: ${fetchError.message}`);
  }

  const { error: dbError } = await supabaseAdmin
    .from("provider_verifications")
    .update({
      status: "rejected",
      metadata: { ...((existingRequest?.metadata as Record<string, unknown>) ?? {}), rejection_reason: reason },
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId);
  if (dbError) {
    throw new Error(`DB Error: ${dbError.message}`);
  }

  revalidatePath("/verification-hub");
  return { success: true };
}
