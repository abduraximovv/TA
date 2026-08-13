import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { searchServices } from "@/lib/ai/searchServices";

// GET /api/v1/ai/search-services -- real, bookable inventory for the "Plan My Trip" Compass.
// Read-only, no external API cost, so unlike the other /api/v1/ai/* routes this doesn't
// rate-limit -- only the auth requirement below. Shares its query logic with
// POST /api/v1/ai/plan-trip via lib/ai/searchServices.
export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // "Only logged-in tourists can query" -- same posture as the menu scanner and itinerary
    // generator: no anonymous fallback, this is matching/recommendation logic, not a public
    // listings browse (that's what /discover and /api/v1/services are for).
    if (!user) {
      return NextResponse.json({ success: false, error: "Sign in to search services" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const category = searchParams.get("category");
    const region = searchParams.get("region");
    const maxPriceRaw = searchParams.get("max_price");
    const maxPrice = maxPriceRaw !== null ? Number(maxPriceRaw) : null;

    const outcome = await searchServices(supabase, { category, region, maxPrice });

    if (!outcome.success) {
      const status = outcome.error === "max_price must be a positive number" ? 400 : 503;
      return NextResponse.json({ success: false, error: outcome.error }, { status });
    }

    return NextResponse.json({ success: true, services: outcome.services });
  } catch (error: any) {
    console.error("Search Services API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
