import React from "react";
import { getSupabase } from "@repo/database";
import { DiscoverClient } from "./DiscoverClient";

export const revalidate = 3600; // Cache data for 1 hour for performance

export default async function DiscoverPage() {
  const supabase = getSupabase();

  // Fetch real data from Supabase
  // We use Promise.all to fetch them in parallel for speed
  const [
    { data: services, error: servicesError },
    { data: locations, error: locationsError }
  ] = await Promise.all([
    supabase.from("services").select("*").order("created_at", { ascending: false }).limit(10),
    supabase.from("locations").select("*").limit(5)
  ]);

  if (servicesError || locationsError) {
    console.error("Error fetching data:", servicesError || locationsError);
  }

  // Ensure we have arrays even if fetch fails
  const safeServices: any[] = services || [];
  const safeLocations: any[] = locations || [];

  return <DiscoverClient services={safeServices} locations={safeLocations} />;
}
