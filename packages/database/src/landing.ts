import { getSupabase } from "./client";
import type { Destination, Service, Event } from "./types";

/**
 * Fetch featured destinations for the Landing Page carousel.
 * Returns destinations ordered by display_order, featured first.
 */
export async function getTopDestinations(limit = 5): Promise<Destination[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .eq("is_featured", true)
    .order("display_order", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Error fetching destinations:", error);
    return [];
  }

  return (data as Destination[]) || [];
}

/**
 * Fetch featured experiences for the Landing Page.
 * Prioritizes high-rated services with verified rural providers.
 */
export async function getFeaturedExperiences(limit = 8): Promise<Service[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_featured", true)
    .order("avg_rating", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching experiences:", error);
    return [];
  }

  return (data as Service[]) || [];
}

/**
 * Fetch upcoming featured events for the Landing Page.
 * Only returns future events, ordered by start_date.
 */
export async function getUpcomingEvents(limit = 6): Promise<Event[]> {
  const supabase = getSupabase();
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("is_featured", true)
    .gte("start_date", today)
    .order("start_date", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Error fetching events:", error);
    return [];
  }

  return (data as Event[]) || [];
}

/**
 * Fetch all destinations (featured + non-featured).
 */
export async function getAllDestinations(): Promise<Destination[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching all destinations:", error);
    return [];
  }

  return (data as Destination[]) || [];
}
