"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export interface RegisterProviderInput {
  businessName: string;
  email: string;
  phone: string;
  password: string;
}

export async function registerProvider(input: RegisterProviderInput) {
  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Create the auth user up front with is_verified: false in app_metadata (tamper-proof,
  // only settable via the service role) so the middleware guard can block them immediately.
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    app_metadata: { role: "provider", is_verified: false },
    user_metadata: { role: "provider", full_name: input.businessName, phone: input.phone },
  });

  if (authError || !authData.user) {
    if (authError?.message.includes("already been registered")) {
      throw new Error("An account with this email already exists.");
    }
    throw new Error(authError?.message || "Failed to create account.");
  }

  const { error: dbError } = await supabaseAdmin.from("provider_verifications").insert({
    user_id: authData.user.id,
    role: "provider",
    business_name: input.businessName,
    email: input.email,
    phone: input.phone,
  });

  if (dbError) {
    // Roll back the auth user so we don't leave an orphaned account with no request.
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    throw new Error(dbError.message || "Failed to submit verification request.");
  }

  return { success: true };
}
