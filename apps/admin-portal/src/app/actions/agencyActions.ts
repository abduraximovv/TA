"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Initialize admin client to bypass RLS and create users
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function approveAgency(requestId: string, email: string, companyName: string) {
  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // 1. Create the Auth User
  // Generate a random secure temporary password
  const tempPassword = Math.random().toString(36).slice(-10) + "A1!";
  
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      full_name: companyName,
      role: "agency"
    }
  });

  if (authError) {
    // If the user already exists, we might still want to approve the request, or error out
    if (authError.message.includes("already has an account")) {
      console.warn("User already exists in auth.users, proceeding to approve request anyway.");
    } else {
      throw new Error(`Auth Error: ${authError.message}`);
    }
  }

  // 2. Update the agency_request status
  const { error: dbError } = await supabaseAdmin
    .from("agency_requests")
    .update({ status: "approved", updated_at: new Date().toISOString() })
    .eq("id", requestId);

  if (dbError) {
    throw new Error(`DB Error: ${dbError.message}`);
  }

  revalidatePath("/verification-hub");
  
  return { 
    success: true, 
    tempPassword: authData?.user ? tempPassword : "User already existed. No new password generated." 
  };
}

export async function rejectAgency(requestId: string) {
  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { error: dbError } = await supabaseAdmin
    .from("agency_requests")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("id", requestId);

  if (dbError) {
    throw new Error(`DB Error: ${dbError.message}`);
  }

  revalidatePath("/verification-hub");
  return { success: true };
}
