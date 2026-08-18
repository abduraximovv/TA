import type { createClient } from "@/utils/supabase/server";
import type { AIPackageSearchResult, AIPackageItemResult } from "@repo/types";

type SupabaseServerClient = ReturnType<typeof createClient>;

const MAX_REGION_LEN = 100;
const MAX_CATEGORY_LEN = 50;

export interface PackageMatchFilters {
  category?: string | null;
  region?: string | null;
  /** How many rows to skip -- used by the "Find another option" carousel button to fetch
   *  exactly one package the user hasn't already been shown, instead of re-fetching everything
   *  shown so far and discarding all but the last row. Defaults to 0 (normal, first-page search). */
  offset?: number;
  /** Defaults to 3 (the initial carousel search). "Find another option" passes 1. */
  limit?: number;
}

export type PackageMatchOutcome =
  | { success: true; packages: AIPackageSearchResult[] }
  | { success: false; error: string };

// Parallel to searchServices.ts -- called concurrently with generateObject in plan-trip/route.ts.
// Must NEVER throw: any error is caught and returned as { success: false } so a DB failure here
// can't break the load-bearing reply/itinerary generation running alongside it.
// Returns early (empty success) if neither filter is supplied -- no signal yet from the AI to
// match against, mirrors plan-trip's own ready_to_search gate.
export async function matchPackages(
  supabase: SupabaseServerClient,
  filters: PackageMatchFilters
): Promise<PackageMatchOutcome> {
  try {
    const category = filters.category?.trim().slice(0, MAX_CATEGORY_LEN) || null;
    const region = filters.region?.trim().slice(0, MAX_REGION_LEN) || null;
    const offset = Number.isFinite(filters.offset) && (filters.offset ?? 0) >= 0 ? Math.floor(filters.offset!) : 0;
    const limit = Number.isFinite(filters.limit) && (filters.limit ?? 0) > 0 ? Math.floor(filters.limit!) : 3;

    // Both category and region null is fine — the RPC returns "Greatest Hits" (top packages by
    // size) as inspiration rather than nothing.

    const { data, error } = await supabase.rpc("match_relevant_packages", {
      p_category: category,
      p_region: region,
      p_limit: limit,
      p_offset: offset,
    });

    if (error) {
      console.error("Package match RPC error:", error);
      return { success: false, error: "Package search unavailable" };
    }

    const packages: AIPackageSearchResult[] = (data ?? []).map((row: any) => {
      // items comes back as a jsonb array -- parse if string, use directly if already an object
      let rawItems: any[] = [];
      try {
        rawItems = Array.isArray(row.items)
          ? row.items
          : typeof row.items === "string"
          ? JSON.parse(row.items)
          : [];
      } catch {
        rawItems = [];
      }

      const items: AIPackageItemResult[] = rawItems.map((item: any) => ({
        id: item.id ?? "",
        service_id: item.service_id ?? null,
        title: item.title ?? null,
        description: item.description ?? null,
        price: item.price ?? null,
        image_url: item.image_url ?? null,
      }));

      return {
        id: row.id,
        title: row.title,
        description: row.description ?? null,
        start_date: row.start_date ?? null,
        end_date: row.end_date ?? null,
        total_price: Number(row.total_price) || 0,
        currency: row.currency ?? "UZS",
        agency_id: row.agency_id ?? null,
        agency_name: row.agency_name ?? null,
        image_url: row.image_url ?? null,
        cities: Array.isArray(row.cities) ? row.cities.filter(Boolean) : [],
        item_count: row.item_count ?? items.length,
        items,
      };
    });

    return { success: true, packages };
  } catch (err: any) {
    console.error("matchPackages unexpected error:", err);
    return { success: false, error: "Package search unavailable" };
  }
}
