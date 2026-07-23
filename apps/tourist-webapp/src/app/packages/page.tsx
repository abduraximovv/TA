import React from "react";
import Link from "next/link";
import { getApprovedItineraries } from "@repo/database";
import type { ItineraryWithMeta } from "@repo/database";
import { Package, Calendar, ArrowRight, Users } from "lucide-react";

export const revalidate = 3600;

export default async function PackagesPage() {
  let itineraries: ItineraryWithMeta[] = [];
  try {
    itineraries = await getApprovedItineraries();
  } catch (err) {
    console.error("Error fetching itineraries:", err);
  }

  return (
    <main className="min-h-screen pt-24 pb-24 bg-sand-50">
      <div className="section-container">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-dark-graphite mb-4">
            Tour <span className="text-primary">Packages</span>
          </h1>
          <p className="text-gray-500 font-medium text-lg">
            Curated multi-day itineraries crafted by verified travel agencies.
          </p>
        </header>

        {itineraries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itineraries.map((itin) => (
              <PackageCard key={itin.id} itinerary={itin} />
            ))}
          </div>
        ) : (
          <div className="w-full py-20 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-[1.5rem] bg-white">
            <Package className="w-12 h-12 text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-dark-graphite mb-2">
              No packages available yet
            </h2>
            <p className="text-gray-500 text-sm mb-6 max-w-md text-center">
              Travel agencies are currently crafting exciting itineraries. Check
              back soon or explore individual experiences.
            </p>
            <Link
              href="/discover"
              className="bg-primary hover:bg-primary-dark text-white font-bold rounded-full px-8 py-3.5 inline-flex items-center gap-2 transition-colors"
            >
              Explore Destinations{" "}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

function PackageCard({ itinerary }: { itinerary: ItineraryWithMeta }) {
  const dateRange =
    itinerary.start_date && itinerary.end_date
      ? `${new Date(itinerary.start_date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        })} — ${new Date(itinerary.end_date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}`
      : null;

  return (
    <Link
      href={`/packages/${itinerary.id}`}
      className="block group h-full"
    >
      <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-card transition-all duration-300 h-full flex flex-col p-5">
        {/* Top badge area */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Package className="w-6 h-6" />
          </div>
          {itinerary.item_count > 0 && (
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {itinerary.item_count} item{itinerary.item_count !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Agency name */}
        {itinerary.agency_name && (
          <div className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase mb-1.5">
            {itinerary.agency_name}
          </div>
        )}

        {/* Title */}
        <h3 className="text-dark-graphite font-bold text-lg leading-snug tracking-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {itinerary.title}
        </h3>

        {/* Description */}
        {itinerary.description && (
          <p className="text-gray-500 text-sm line-clamp-2 mb-4">
            {itinerary.description}
          </p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium mb-4 mt-auto">
          {dateRange && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {dateRange}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-end justify-between pt-4 border-t border-gray-50">
          <span className="text-dark-graphite font-black text-lg leading-none">
            {new Intl.NumberFormat("uz-UZ").format(itinerary.total_price)}{" "}
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider ml-0.5">
              {itinerary.currency}
            </span>
          </span>
          <span className="text-primary text-sm font-bold flex items-center gap-1 group-hover:underline">
            View Details <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
