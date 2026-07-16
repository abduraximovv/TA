import { createClient } from "@supabase/supabase-js";
import type { Database, LocationCategory, Location } from "./types";

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

export const getSupabase = () => {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Supabase credentials missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
      );
    }
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance!;
};

export const fetchLocationsInRadius = async (
  lat: number,
  lng: number,
  radiusMeters: number
): Promise<Location[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc("get_locations_in_radius", {
    p_lat: lat,
    p_lng: lng,
    p_radius_meters: radiusMeters,
  });

  if (error) {
    console.error("Error fetching locations:", error);
    throw new Error(error.message);
  }

  return data as Location[];
};
