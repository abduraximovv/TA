import { getSupabase } from "./client";
import type { Destination, DestinationReview, Service, Event } from "./types";
import type { Itinerary } from "@repo/types";

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
export async function getFeaturedExperiences(limit = 24): Promise<Service[]> {
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
 * Fetch all experiences for the Experiences page.
 */
export async function getAllExperiences(): Promise<Service[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("avg_rating", { ascending: false });

  if (error) {
    console.error("Error fetching all experiences:", error);
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
 * Fetch a single event by its slug, for the /events/[slug] detail page.
 */
export async function getEventBySlug(slug: string): Promise<Event | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Error fetching event by slug:", error);
    return null;
  }

  return data ? (data as Event) : null;
}

/**
 * Fetch every event (not just upcoming/featured) -- used by the /map page, which plots
 * everything on the calendar rather than just the homepage's featured/future subset.
 */
export async function getAllEvents(): Promise<Event[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("start_date", { ascending: true });

  if (error) {
    console.error("Error fetching all events:", error);
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

/**
 * Fetch a single destination by id -- used by the /events/[slug] detail page to resolve an
 * event's linked destination_id back into a full destination for cross-linking.
 */
export async function getDestinationById(id: string): Promise<Destination | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching destination by id:", error);
    return null;
  }

  return data ? (data as Destination) : null;
}

/**
 * Fetch a single destination by its slug, for the blog-style detail page.
 */
export async function getDestinationBySlug(slug: string): Promise<Destination | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Error fetching destination by slug:", error);
    return null;
  }

  return data ? (data as Destination) : null;
}

export interface DestinationReviewWithAuthor extends DestinationReview {
  author_name: string | null;
}

/**
 * Fetch visitor opinions left on a destination, newest first.
 */
export async function getDestinationReviews(destinationId: string): Promise<DestinationReviewWithAuthor[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("destination_reviews")
    .select("*")
    .eq("destination_id", destinationId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching destination reviews:", error);
    return [];
  }

  const reviews = (data as DestinationReview[]) || [];
  if (reviews.length === 0) return [];

  const touristIds = [...new Set(reviews.map((r) => r.tourist_id))];
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, full_name")
    .in("id", touristIds);
  const nameMap: Record<string, string> = {};
  if (profiles) {
    (profiles as { id: string; full_name: string | null }[]).forEach((p) => {
      nameMap[p.id] = p.full_name ?? "Tourist";
    });
  }

  return reviews.map((r) => ({ ...r, author_name: nameMap[r.tourist_id] ?? null }));
}

/**
 * Fetch active agency-curated packages (itineraries) for the Landing Page.
 */
export async function getFeaturedItineraries(limit = 8): Promise<Itinerary[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("itineraries")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching itineraries:", error);
    return [];
  }

  return (data as Itinerary[]) || [];
}

export interface SiteStats {
  experienceCount: number;
  verifiedProviderCount: number;
  destinationCount: number;
}

/**
 * Real, live counts from the database -- used for the About page's impact numbers
 * instead of hardcoded marketing claims.
 */
export async function getSiteStats(): Promise<SiteStats> {
  const supabase = getSupabase();
  const [servicesRes, providersRes, destinationsRes] = await Promise.all([
    supabase.from("services").select("*", { count: "exact", head: true }),
    supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "provider")
      .eq("is_verified", true),
    supabase.from("destinations").select("*", { count: "exact", head: true }),
  ]);

  return {
    experienceCount: servicesRes.count ?? 0,
    verifiedProviderCount: providersRes.count ?? 0,
    destinationCount: destinationsRes.count ?? 0,
  };
}
