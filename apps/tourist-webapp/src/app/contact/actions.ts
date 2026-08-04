"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function submitContactMessage(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  const type = formData.get("type") as string || "contact";
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const subject = formData.get("subject") as string | null;
  const message = formData.get("message") as string;
  const ratingStr = formData.get("rating") as string | null;
  const pageSource = formData.get("page_source") as string | null;

  const { data: { user } } = await supabase.auth.getUser();

  const rating = ratingStr ? parseInt(ratingStr, 10) : null;

  const { error } = await supabase
    .from("contact_messages")
    .insert({
      type,
      name,
      email,
      subject,
      message,
      rating: rating && !isNaN(rating) ? rating : null,
      page_source: pageSource,
      user_id: user?.id || null,
    });

  if (error) {
    console.error("Error submitting contact message:", error);
    return { success: false, error: "Failed to submit message." };
  }

  return { success: true };
}
