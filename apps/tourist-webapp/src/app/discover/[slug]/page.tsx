import React from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { getDestinationBySlug, getDestinationReviews, getAllExperiences, getAllEvents } from "@repo/database";
import { DiscoverDetailClient } from "./DiscoverDetailClient";

export const revalidate = 3600;

// Events don't carry a region column, only a free-text `location` -- this maps each
// destination's page to the real city name(s) its seeded events/experiences actually use, so
// "Experiences Here" / "Upcoming Events" only ever show real, correctly-placed data.
const DESTINATION_CITY_MATCH: Record<string, string[]> = {
  samarkand: ["Samarkand", "Urgut"],
  bukhara: ["Bukhara"],
  khiva: ["Khiva"],
  tashkent: ["Tashkent"],
  nurata: ["Nurata", "Sentob"],
  chimgan: ["Chimgan"],
  "fergana-valley": ["Fergana", "Rishtan", "Margilan"],
  moynaq: [],
};

export default async function DiscoverDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient(cookies());
  const [{ data: { user } }, destination] = await Promise.all([
    supabase.auth.getUser(),
    getDestinationBySlug(params.slug),
  ]);

  if (!destination) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-sand-50"
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            fontWeight: 600,
            color: "#0A2320",
            marginBottom: 8,
          }}
        >
          Destination Not Found
        </h1>
        <p style={{ color: "rgba(10,35,32,0.5)", marginBottom: 24 }}>
          This destination guide does not exist or has been removed.
        </p>
        <Link href="/discover" className="btn-primary">
          Browse Destinations
        </Link>
      </div>
    );
  }

  const [opinions, allExperiences, allEvents] = await Promise.all([
    getDestinationReviews(destination.id),
    getAllExperiences(),
    getAllEvents(),
  ]);

  // Real, region-matched subsets -- not hardcoded, and not shown at all when genuinely empty
  // (e.g. Moynaq has no providers yet, so it correctly shows zero rather than fabricated ones).
  const experiences = destination.region
    ? allExperiences.filter((e) => e.region === destination.region)
    : [];

  const cityMatches = DESTINATION_CITY_MATCH[destination.slug] || [];
  const today = new Date().toISOString().split("T")[0];
  const events = cityMatches.length
    ? allEvents
        .filter((e) => cityMatches.some((city) => (e.location || "").startsWith(city)))
        .filter((e) => e.start_date >= today)
    : [];

  return (
    <DiscoverDetailClient
      destination={destination}
      opinions={opinions}
      experiences={experiences}
      events={events}
      isLoggedIn={!!user}
    />
  );
}
