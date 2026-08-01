import React from "react";
import { getAvailableServices, getSupabase } from "@repo/database";
import type { Service, Location } from "@repo/database";
import { ServiceListClient } from "./ServiceListClient";

export const revalidate = 3600;

export default async function ServiceListPage() {
  const supabase = getSupabase();

  const [services, { data: locations, error: locationsError }] = await Promise.all([
    getAvailableServices(20),
    supabase.from("locations").select("*").limit(5),
  ]);

  if (locationsError) {
    console.error("Error fetching locations:", locationsError);
  }

  const safeLocations: Location[] = (locations as Location[]) || [];

  return <ServiceListClient services={services} locations={safeLocations} />;
}
