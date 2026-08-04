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

export interface EventFormInput {
  title: string;
  description: string;
  location: string;
  image_url: string;
  start_date: string;
  end_date: string;
  event_type: string;
  is_featured: boolean;
  ticket_url: string;
}

export async function createEvent(input: EventFormInput) {
  const supabaseAdmin = getAdminClient();

  const { error } = await supabaseAdmin.from("events").insert({
    title: input.title,
    description: input.description || null,
    location: input.location || null,
    image_url: input.image_url || null,
    start_date: input.start_date,
    end_date: input.end_date || null,
    event_type: input.event_type || "festival",
    is_featured: input.is_featured,
    ticket_url: input.ticket_url || null,
  });
  if (error) throw new Error(`DB Error: ${error.message}`);

  revalidatePath("/events");
  revalidatePath("/");
  return { success: true };
}

export async function updateEvent(id: string, input: EventFormInput) {
  const supabaseAdmin = getAdminClient();

  const { error } = await supabaseAdmin
    .from("events")
    .update({
      title: input.title,
      description: input.description || null,
      location: input.location || null,
      image_url: input.image_url || null,
      start_date: input.start_date,
      end_date: input.end_date || null,
      event_type: input.event_type || "festival",
      is_featured: input.is_featured,
      ticket_url: input.ticket_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(`DB Error: ${error.message}`);

  revalidatePath("/events");
  revalidatePath("/");
  return { success: true };
}

export async function deleteEvent(id: string) {
  const supabaseAdmin = getAdminClient();

  const { error } = await supabaseAdmin.from("events").delete().eq("id", id);
  if (error) throw new Error(`DB Error: ${error.message}`);

  revalidatePath("/events");
  revalidatePath("/");
  return { success: true };
}
