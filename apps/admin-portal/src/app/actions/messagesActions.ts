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

export type MessageStatus = "new" | "read" | "resolved";

export interface ContactMessage {
  id: string;
  type: "contact" | "feedback";
  name: string;
  email: string;
  subject: string | null;
  message: string;
  rating: number | null;
  page_source: string | null;
  user_id: string | null;
  status: MessageStatus;
  created_at: string;
}

// contact_messages is write-only from the public API (no SELECT policy) -- this is the "admin
// surface" the table's own migration comment flagged as not existing yet.
export async function getContactMessages(): Promise<ContactMessage[]> {
  const supabaseAdmin = getAdminClient();
  const { data, error } = await supabaseAdmin
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ContactMessage[];
}

export async function updateMessageStatus(id: string, status: MessageStatus) {
  const supabaseAdmin = getAdminClient();
  const { error } = await supabaseAdmin.from("contact_messages").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/messages");
  return { success: true };
}
