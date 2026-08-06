import React from "react";
import Link from "next/link";
import { getEventBySlug, getDestinationById, getAllExperiences, getAllEvents } from "@repo/database";
import { EventDetailClient } from "./EventDetailClient";

export const revalidate = 3600;

export default async function EventDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const event = await getEventBySlug(params.slug);

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-sand-50">
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            fontWeight: 600,
            color: "#0A2320",
            marginBottom: 8,
          }}
        >
          Event Not Found
        </h1>
        <p style={{ color: "rgba(10,35,32,0.5)", marginBottom: 24 }}>
          This event does not exist, has concluded and been archived, or has been removed.
        </p>
        <Link href="/events" className="btn-primary">
          Browse Events
        </Link>
      </div>
    );
  }

  const [destination, allExperiences, allEvents] = await Promise.all([
    event.destination_id ? getDestinationById(event.destination_id) : Promise.resolve(null),
    getAllExperiences(),
    getAllEvents(),
  ]);

  // Real, region-matched -- same pattern as the destination detail page's "Experiences Here".
  const nearbyExperiences = destination?.region ? allExperiences.filter((e) => e.region === destination.region).slice(0, 6) : [];

  const today = new Date().toISOString().split("T")[0];
  const moreEvents = allEvents
    .filter((e) => e.id !== event.id && e.start_date >= today)
    .sort((a, b) => a.start_date.localeCompare(b.start_date))
    .slice(0, 3);

  return <EventDetailClient event={event} destination={destination} nearbyExperiences={nearbyExperiences} moreEvents={moreEvents} />;
}
