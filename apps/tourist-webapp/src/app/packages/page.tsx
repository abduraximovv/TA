import React from "react";
import { getApprovedItineraries } from "@repo/database";
import type { ItineraryWithMeta } from "@repo/database";
import { PackagesClient } from "./PackagesClient";

export const revalidate = 3600;

export default async function PackagesPage() {
  let itineraries: ItineraryWithMeta[] = [];
  try {
    itineraries = await getApprovedItineraries();
  } catch (err) {
    console.error("Error fetching itineraries:", err);
  }

  return <PackagesClient itineraries={itineraries} />;
}
