import type { createClient } from "@/utils/supabase/server";
import type { AIEventSearchResult } from "@repo/types";

type SupabaseServerClient = ReturnType<typeof createClient>;

const MAX_EVENTS = 3;

export interface EventMatchFilters {
  region: string | null;
  /** Inclusive trip date range, both required -- see below for why there's no partial-info path. */
  tripStartDate: string | null;
  tripEndDate: string | null;
}

export type EventMatchOutcome =
  | { success: true; events: AIEventSearchResult[] }
  | { success: false; error: string };

// Deliberately NOT the same "broaden and pivot-and-sell" pattern as searchServices/matchPackages.
// Per explicit product decision, an event should only ever surface when it GENUINELY overlaps
// both the trip's actual dates and its region -- no closest-match, no "greatest hits" fallback
// when region/dates are missing. Returning an empty array is the normal, silent, correct outcome
// for most trips (there are only 6 seeded events total), not a degraded result to work around.
export async function matchEvents(
  supabase: SupabaseServerClient,
  filters: EventMatchFilters
): Promise<EventMatchOutcome> {
  try {
    const region = filters.region?.trim().slice(0, 100) || null;
    const { tripStartDate, tripEndDate } = filters;
    if (!region || !tripStartDate || !tripEndDate) {
      return { success: true, events: [] };
    }

    const { data, error } = await supabase
      .from("events")
      .select("id, title, description, location, image_url, start_date, end_date, event_type, ticket_url, slug")
      .lte("start_date", tripEndDate)
      .gte("end_date", tripStartDate)
      .order("start_date");

    if (error) {
      console.error("Event match query error:", error);
      return { success: false, error: "Event search unavailable" };
    }

    // Bidirectional substring match -- events.location ("Samarkand") and the resolved trip
    // region ("Samarkand Region", or just "Samarkand") aren't guaranteed to line up in either
    // direction, so check both ways rather than a single ILIKE pattern (this table is tiny,
    // filtering in JS after the date-range query is cheap and simpler than a raw SQL function).
    const regionLower = region.toLowerCase();
    const matched = (data ?? []).filter((ev: any) => {
      const loc = String(ev.location || "").toLowerCase();
      return loc.length > 0 && (loc.includes(regionLower) || regionLower.includes(loc));
    });

    const events: AIEventSearchResult[] = matched.slice(0, MAX_EVENTS).map((ev: any) => ({
      id: ev.id,
      title: ev.title,
      description: ev.description ?? null,
      location: ev.location,
      image_url: ev.image_url ?? null,
      start_date: ev.start_date,
      end_date: ev.end_date,
      event_type: ev.event_type,
      ticket_url: ev.ticket_url ?? null,
      slug: ev.slug ?? null,
    }));

    return { success: true, events };
  } catch (err: any) {
    console.error("matchEvents unexpected error:", err);
    return { success: false, error: "Event search unavailable" };
  }
}
