import type { getSupabaseBrowserClient } from "@repo/database";

export interface CreatePackageBookingResult {
  data: { id: string } | null;
  error: { message: string } | null;
}

// @repo/database's Database type (packages/database/src/types.ts) does register
// create_package_booking's Args/Returns shape, but postgrest-js's generic Database-based
// inference for .rpc() doesn't resolve through this workspace's package boundary -- confirmed by
// the exact same failure reproducing for already-existing, already-working RPCs (e.g.
// search_available_services) when called via getSupabase()/getSupabaseBrowserClient() from this
// app, not just this function. A pre-existing gap, not something either caller introduced.
// Isolated here once so every caller (PackageDepartureSelector, PackageBookingWidget, ...) shares
// one workaround instead of re-deriving it.
export async function createPackageBooking(
  supabase: ReturnType<typeof getSupabaseBrowserClient>,
  args: { p_departure_id: string; p_guests: number }
): Promise<CreatePackageBookingResult> {
  return (supabase.rpc as unknown as (fn: string, args: unknown) => Promise<CreatePackageBookingResult>)(
    "create_package_booking",
    args
  );
}
