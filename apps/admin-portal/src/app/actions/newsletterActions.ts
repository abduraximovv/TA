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

export interface NewsletterSubscriber {
  id: string;
  email: string;
  is_active: boolean;
  source: string | null;
  created_at: string;
}

// newsletter_subscribers has no public SELECT policy (same insert-only model as
// contact_messages) -- reads only ever go through this admin action via the service role key.
export async function getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  const supabaseAdmin = getAdminClient();
  const { data, error } = await supabaseAdmin
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as NewsletterSubscriber[];
}

// UI-level pause/resume only -- no email sending exists yet, so this just flips a status flag
// for whenever that's built. Subscribers never see or manage this themselves.
export async function setNewsletterSubscriberActive(id: string, isActive: boolean) {
  const supabaseAdmin = getAdminClient();
  const { error } = await supabaseAdmin
    .from("newsletter_subscribers")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/newsletter");
  return { success: true };
}
