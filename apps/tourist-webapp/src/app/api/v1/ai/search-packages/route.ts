import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { matchPackages } from "@/lib/ai/matchPackages";

// GET /api/v1/ai/search-packages -- sibling to /api/v1/ai/search-services, same query-param
// shape. Currently the only caller is SafronCoordinator's "Find another option" carousel button
// (category/region carried forward from the plan-trip META: line, offset = packages.length,
// limit = 1), but this isn't a narrowly one-off endpoint -- it's a general paginated package
// search, same as search-services is for services.
export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { searchParams } = req.nextUrl;
    const category = searchParams.get("category");
    const region = searchParams.get("region");
    const offsetRaw = searchParams.get("offset");
    const limitRaw = searchParams.get("limit");
    const offset = offsetRaw !== null ? Number(offsetRaw) : undefined;
    const limit = limitRaw !== null ? Number(limitRaw) : undefined;

    const outcome = await matchPackages(supabase, { category, region, offset, limit });

    if (!outcome.success) {
      return NextResponse.json({ success: false, error: outcome.error }, { status: 503 });
    }

    return NextResponse.json({ success: true, packages: outcome.packages });
  } catch (error: any) {
    console.error("Search Packages API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
