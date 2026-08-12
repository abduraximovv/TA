"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import type { ItinerarySuggestResponse } from "@repo/types";

export interface SaveGeneratedItineraryInput extends ItinerarySuggestResponse {
  title: string;
  start_date: string;
  interests: string[];
}

export async function saveGeneratedItinerary(input: SaveGeneratedItineraryInput) {
  const supabase = createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Sign in to save your trip." };
  }

  const { data: itinerary, error: itineraryError } = await supabase
    .from("itineraries")
    .insert({
      tourist_id: user.id,
      title: input.title,
      description: `AI-generated ${input.days.length}-day trip focused on ${input.interests.join(", ")}.`,
      start_date: input.start_date,
      status: "draft",
      total_price: input.total_estimated_cost,
      currency: "USD",
    })
    .select("id")
    .single();

  if (itineraryError || !itinerary) {
    console.error("Failed to save itinerary:", itineraryError);
    return { success: false, error: "Couldn't save your trip. Please try again." };
  }

  const items = input.days.flatMap((day, dayIndex) =>
    day.activities.map((activity, activityIndex) => ({
      itinerary_id: itinerary.id,
      title: activity.title,
      description: activity.description,
      location_name: activity.location_name,
      scheduled_time: activity.time,
      day_number: day.day_number,
      price: activity.estimated_cost,
      sort_order: dayIndex * 100 + activityIndex,
    }))
  );

  const { error: itemsError } = await supabase.from("itinerary_items").insert(items);
  if (itemsError) {
    console.error("Failed to save itinerary items:", itemsError);
    return { success: false, error: "Trip saved, but some activities couldn't be added.", itineraryId: itinerary.id as string };
  }

  return { success: true, itineraryId: itinerary.id as string };
}
