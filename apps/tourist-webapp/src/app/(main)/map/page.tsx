import React from "react";
import { getAllDestinations, getAllExperiences, getAllEvents } from "@repo/database";
import type { MapPin } from "@/components/map/mapConstants";
import { MapPageClient } from "./MapPageClient";

function formatPrice(price: number, currency: string) {
  return `${Math.round(Number(price) || 0).toLocaleString("en-US").replace(/,/g, " ")} ${currency}`;
}

function formatDateRange(start: string, end: string | null) {
  const startDate = new Date(start).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  if (!end) return startDate;
  const endDate = new Date(end).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return `${startDate} — ${endDate}`;
}

export default async function MapPage() {
  const [destinations, experiences, events] = await Promise.all([getAllDestinations(), getAllExperiences(), getAllEvents()]);

  const pins: MapPin[] = [
    ...destinations
      .filter((d) => d.latitude != null && d.longitude != null)
      .map((d) => ({
        id: d.id,
        kind: "destination" as const,
        name: d.name,
        lat: d.latitude as number,
        lng: d.longitude as number,
        image: d.image_url,
        description: d.description,
        category: d.region,
        city: d.name,
        meta: d.region,
        href: `/discover/${d.slug}`,
        featured: d.is_featured,
        // Destinations don't carry a rating_count -- the density formula gives every
        // destination-kind pin a flat weight instead (see ExploreMap's buildClusters).
        ratingCount: 0,
      })),
    ...experiences
      .filter((s) => s.latitude != null && s.longitude != null)
      .map((s) => ({
        id: s.id,
        kind: "experience" as const,
        name: s.title,
        lat: s.latitude as number,
        lng: s.longitude as number,
        image: s.image_url,
        description: s.description,
        category: s.category,
        city: s.city,
        meta: formatPrice(s.price, s.currency),
        href: `/service/${s.id}`,
        featured: s.is_featured,
        ratingCount: s.rating_count,
      })),
    ...events
      .filter((e) => e.latitude != null && e.longitude != null)
      .map((e) => ({
        id: e.id,
        kind: "event" as const,
        name: e.title,
        lat: e.latitude as number,
        lng: e.longitude as number,
        image: e.image_url,
        description: e.description,
        category: e.event_type,
        city: (e.location || "").split(",")[0].trim() || null,
        meta: formatDateRange(e.start_date, e.end_date),
        href: e.ticket_url || "/discover",
        featured: e.is_featured,
        // Events don't carry a rating_count either -- same flat-weight treatment as destinations.
        ratingCount: 0,
      })),
  ];

  return (
    <main style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden" }}>
      <div className="pt-16" style={{ position: "relative", zIndex: 0, width: "100%", height: "100%", boxSizing: "border-box" }}>
        <MapPageClient pins={pins} />
      </div>
    </main>
  );
}
