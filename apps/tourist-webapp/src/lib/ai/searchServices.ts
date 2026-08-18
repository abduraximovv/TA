import type { createClient } from "@/utils/supabase/server";
import type { AIServiceSearchResult, AIServiceAvailableSlot } from "@repo/types";

type SupabaseServerClient = ReturnType<typeof createClient>;

export const SEARCH_RESULT_LIMIT = 5;
const MAX_REGION_LEN = 100;
const MAX_CATEGORY_LEN = 50;

export interface ServiceSearchFilters {
  category?: string | null;
  region?: string | null;
  maxPrice?: number | null;
  excludeId?: string | null;
  /** YYYY-MM-DD. When set, services with a full/blocked service_inventory row for this date are
   *  excluded; services with no inventory configured for the date are still included (unmanaged
   *  services are treated as always-open, see the service_inventory migration). */
  travelDate?: string | null;
}

export type ServiceSearchOutcome =
  | { success: true; services: AIServiceSearchResult[] }
  | { success: false; error: string };

const TRAVEL_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Shared by GET /api/v1/ai/search-services (direct query-param search from the client) and
// POST /api/v1/ai/plan-trip (Kimi-triggered search mid-conversation) -- same query and
// validation, one place to keep them in sync instead of two copies drifting apart.
//
// Delegates to the search_available_services() RPC (see supabase/migrations/
// 20260816000000_service_inventory.sql) rather than a .from("services") query builder chain --
// the inventory/capacity check needs a NOT EXISTS/aggregate subquery per candidate row, which
// isn't expressible through the JS query builder.
export async function searchServices(
  supabase: SupabaseServerClient,
  filters: ServiceSearchFilters
): Promise<ServiceSearchOutcome> {
  const category = filters.category?.trim().slice(0, MAX_CATEGORY_LEN) || null;
  const region = filters.region?.trim().slice(0, MAX_REGION_LEN) || null;
  const maxPrice = filters.maxPrice ?? null;
  const travelDate = filters.travelDate && TRAVEL_DATE_RE.test(filters.travelDate) ? filters.travelDate : null;

  if (maxPrice !== null && (!Number.isFinite(maxPrice) || maxPrice <= 0)) {
    return { success: false, error: "max_price must be a positive number" };
  }

  // category is free-text on the live table (e.g. "masterclass", "tour", "bazaar", "stay",
  // "adventure", "nature", "food") -- not the older ('food'|'stay'|'experience'|'transport')
  // enum from the original schema migration, which the live data has outgrown.
  //
  // "5 highly relevant items" -- absent a real search-relevance score, highest-rated first is
  // the closest honest proxy (and matches the platform's "Trust Through Design" principle);
  // enforced inside the RPC itself (ORDER BY rating_avg DESC, LIMIT).
  const { data, error } = await supabase.rpc("search_available_services", {
    p_category: category,
    p_region: region,
    p_max_price: maxPrice,
    p_exclude_id: filters.excludeId || null,
    p_travel_date: travelDate,
    p_limit: SEARCH_RESULT_LIMIT,
  });

  if (error) {
    console.error("Service search error:", error);
    return { success: false, error: "Search unavailable" };
  }

  // available_slots (real bookable time chips for travelDate) are fetched via a second, separate
  // query rather than extended into search_available_services()'s own return shape -- that RPC
  // returns `SETOF public.services` today, and changing its RETURNS clause would require a
  // DROP + CREATE (Postgres disallows changing an existing function's return type in place),
  // which is real risk to a function three other call sites already depend on in production. A
  // plain follow-up SELECT against service_inventory, scoped to just the <=SEARCH_RESULT_LIMIT
  // service ids this call already resolved, gets the same result with none of that risk.
  const rows: any[] = data ?? [];
  const slotsByService = new Map<string, AIServiceAvailableSlot[]>();

  if (travelDate && rows.length > 0) {
    const { data: invRows, error: invError } = await supabase
      .from("service_inventory")
      .select("service_id, start_time, end_time, total_capacity, booked_capacity")
      .in("service_id", rows.map((r) => r.id))
      .eq("available_date", travelDate)
      .eq("is_blocked", false)
      .not("start_time", "is", null);

    // A slot-lookup failure shouldn't take down the whole search -- services just render without
    // time chips (same as an unmanaged service) rather than the request failing outright.
    if (invError) {
      console.error("Slot lookup error:", invError);
    } else {
      for (const inv of invRows ?? []) {
        const remaining = (inv.total_capacity ?? 0) - (inv.booked_capacity ?? 0);
        if (remaining <= 0) continue;
        const list = slotsByService.get(inv.service_id) ?? [];
        list.push({ start_time: inv.start_time, end_time: inv.end_time, remaining_capacity: remaining });
        slotsByService.set(inv.service_id, list);
      }
      for (const list of slotsByService.values()) {
        list.sort((a, b) => a.start_time.localeCompare(b.start_time));
      }
    }
  }

  // The RPC returns full `services` rows (SETOF public.services) since the capacity filter needs
  // to run server-side over every column-agnostic candidate -- project down to the same field
  // set the old .select(...) query builder chain returned, so payload size sent to the client and
  // into the Kimi prompt is unchanged.
  const services: AIServiceSearchResult[] = rows.map((row: any) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    price: row.price,
    currency: row.currency,
    region: row.region,
    city: row.city,
    is_rural_provider: row.is_rural_provider,
    provider_name: row.provider_name,
    rating_avg: row.rating_avg,
    rating_count: row.rating_count,
    duration_minutes: row.duration_minutes,
    neighborhood: row.neighborhood,
    max_guests: row.max_guests,
    image_url: row.image_url,
    available_slots: slotsByService.get(row.id) ?? [],
  }));

  return { success: true, services };
}
