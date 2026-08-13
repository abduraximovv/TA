import type { createClient } from "@/utils/supabase/server";
import type { AIServiceSearchResult } from "@repo/types";

type SupabaseServerClient = ReturnType<typeof createClient>;

export const SEARCH_RESULT_LIMIT = 5;
const MAX_REGION_LEN = 100;
const MAX_CATEGORY_LEN = 50;

export interface ServiceSearchFilters {
  category?: string | null;
  region?: string | null;
  maxPrice?: number | null;
}

export type ServiceSearchOutcome =
  | { success: true; services: AIServiceSearchResult[] }
  | { success: false; error: string };

// Shared by GET /api/v1/ai/search-services (direct query-param search from the client) and
// POST /api/v1/ai/plan-trip (Kimi-triggered search mid-conversation) -- same query and
// validation, one place to keep them in sync instead of two copies drifting apart.
export async function searchServices(
  supabase: SupabaseServerClient,
  filters: ServiceSearchFilters
): Promise<ServiceSearchOutcome> {
  const category = filters.category?.trim().slice(0, MAX_CATEGORY_LEN) || null;
  const region = filters.region?.trim().slice(0, MAX_REGION_LEN) || null;
  const maxPrice = filters.maxPrice ?? null;

  if (maxPrice !== null && (!Number.isFinite(maxPrice) || maxPrice <= 0)) {
    return { success: false, error: "max_price must be a positive number" };
  }

  // category is free-text on the live table (e.g. "masterclass", "tour", "bazaar", "stay",
  // "adventure", "nature", "food") -- not the older ('food'|'stay'|'experience'|'transport')
  // enum from the original schema migration, which the live data has outgrown.
  let query = supabase
    .from("services")
    .select(
      "id, title, description, category, price, currency, region, city, is_rural_provider, provider_name, rating_avg, rating_count, duration_minutes, max_guests, image_url"
    )
    .eq("is_available", true);

  if (category) query = query.eq("category", category);
  if (region) query = query.ilike("region", `%${region}%`);
  if (maxPrice !== null) query = query.lte("price", maxPrice);

  // "5 highly relevant items" -- absent a real search-relevance score, highest-rated first is
  // the closest honest proxy (and matches the platform's "Trust Through Design" principle).
  const { data, error } = await query.order("rating_avg", { ascending: false }).limit(SEARCH_RESULT_LIMIT);

  if (error) {
    console.error("Service search error:", error);
    return { success: false, error: "Search unavailable" };
  }

  return { success: true, services: (data ?? []) as unknown as AIServiceSearchResult[] };
}
