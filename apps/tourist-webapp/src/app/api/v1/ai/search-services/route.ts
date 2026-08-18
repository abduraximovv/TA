import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { searchServices } from "@/lib/ai/searchServices";

// GET /api/v1/ai/search-services -- real, bookable inventory for the "Plan My Trip" Compass.
// POST /api/v1/ai/search-services -- supports the hot-swap functionality from SafronCoordinator
export async function GET(req: NextRequest) {
  return handleSearch(req, "GET");
}

export async function POST(req: NextRequest) {
  return handleSearch(req, "POST");
}

async function handleSearch(req: NextRequest, method: "GET" | "POST") {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    /*
    // Disabled auth block for testing
    if (!user) {
      return NextResponse.json({ success: false, error: "Sign in to search services" }, { status: 401 });
    }
    */

    let category: string | null = null;
    let region: string | null = null;
    let maxPrice: number | null = null;
    let excludeId: string | null = null;
    let travelDate: string | null = null;

    if (method === "GET") {
      const { searchParams } = req.nextUrl;
      category = searchParams.get("category");
      region = searchParams.get("region");
      const maxPriceRaw = searchParams.get("max_price");
      maxPrice = maxPriceRaw !== null ? Number(maxPriceRaw) : null;
      travelDate = searchParams.get("travel_date");
    } else {
      const body = await req.json().catch(() => ({}));
      category = body.category ?? null;
      region = body.region ?? null;
      excludeId = body.exclude_id ?? null;
      maxPrice = body.max_price !== undefined ? Number(body.max_price) : null;
      travelDate = body.travel_date ?? null;
    }

    const outcome = await searchServices(supabase, { category, region, maxPrice, excludeId, travelDate });

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
