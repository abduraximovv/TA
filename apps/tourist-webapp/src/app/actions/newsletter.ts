"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function subscribeToNewsletter(email: string) {
  const trimmed = email.trim();
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { success: false, error: "Enter a valid email address." };
  }

  const supabase = createClient(cookies());
  const { error } = await supabase.from("newsletter_subscribers").insert({
    email: trimmed.toLowerCase(),
    source: "footer",
  });

  if (error) {
    // Unique violation -- they're already on the list, which reads as success to the visitor.
    if (error.code === "23505") {
      return { success: true, alreadySubscribed: true };
    }
    console.error("Error subscribing to newsletter:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }

  return { success: true, alreadySubscribed: false };
}
