import React from "react";
import { LandingClient } from "@/components/landing/LandingClient";
import {
  getAllDestinations,
  getFeaturedExperiences,
  getFeaturedItineraries,
  getUpcomingEvents,
} from "@repo/database";

// Revalidate data every hour
export const revalidate = 3600;

export default async function LandingPage() {
  // 1. Server-side data fetching directly from Supabase via Database Package
  // Using Promise.all to fetch everything in parallel for maximum performance
  // Destinations uses the full list (not just is_featured) so the carousel and
  // map both have enough cities to be worth scrolling through.
  const [destinations, experiences, packages, events] = await Promise.all([
    getAllDestinations(),
    getFeaturedExperiences(24),
    getFeaturedItineraries(8),
    getUpcomingEvents(6),
  ]);

  // 2. Pass data to client orchestrator
  return (
    <div className="w-full flex flex-col min-h-screen">
      <LandingClient
        destinations={destinations}
        experiences={experiences}
        packages={packages}
        events={events}
      />
    </div>
  );
}
