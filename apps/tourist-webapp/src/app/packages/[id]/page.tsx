import React from "react";
import Link from "next/link";
import { PackageBookingModal } from "@/components/booking/PackageBookingModal";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { getItineraryById, getReviewsForItinerary } from "@repo/database";
import type { ReviewWithAuthor } from "@repo/database";
import { Button } from "@repo/ui";
import {
  ArrowLeft,
  Package,
  Calendar,
  Star,
  MapPin,
} from "lucide-react";

export const revalidate = 3600;

export default async function PackageDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient(cookies());
  const [{ data: { user } }, itinerary, reviews] = await Promise.all([
    supabase.auth.getUser(),
    getItineraryById(params.id),
    getReviewsForItinerary(params.id).catch(() => [] as ReviewWithAuthor[]),
  ]);

  if (!itinerary) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Package Not Found
        </h1>
        <p className="text-gray-500 mb-6">
          This tour package does not exist or has been removed.
        </p>
        <Link href="/packages">
          <Button className="bg-primary">Browse Packages</Button>
        </Link>
      </div>
    );
  }

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
    <main className="min-h-screen bg-sand-50 pb-28">
      {/* Header */}
      <div className="bg-primary text-white pt-24 pb-12">
        <div className="section-container">
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Packages
          </Link>

          {itinerary.agency_name && (
            <div className="text-xs font-bold tracking-[0.2em] text-white/60 uppercase mb-2">
              by {itinerary.agency_name}
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
            {itinerary.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
            {dateRange && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> {dateRange}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Package className="w-4 h-4" /> {itinerary.items.length} item
              {itinerary.items.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="section-container -mt-6">
        {/* Description */}
        {itinerary.description && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-bold text-dark-graphite mb-3">
              Overview
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {itinerary.description}
            </p>
          </div>
        )}

        {/* Itinerary Items */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-bold text-dark-graphite mb-4">
            Included in this package
          </h2>

          {itinerary.items.length > 0 ? (
            <div className="space-y-3">
              {itinerary.items.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-sm mr-4 shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-dark-graphite text-sm truncate">
                      {item.service_title ?? item.title ?? "Custom Item"}
                    </h3>
                  </div>
                  {item.price != null && (
                    <span className="text-dark-graphite font-bold text-sm ml-4 shrink-0">
                      {new Intl.NumberFormat("uz-UZ").format(item.price)}{" "}
                      <span className="text-[10px] text-gray-400 font-semibold">
                        UZS
                      </span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              No items in this package yet.
            </p>
          )}
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-bold text-dark-graphite mb-4">
              Reviews ({reviews.length})
            </h2>
            <div className="space-y-4">
              {reviews.slice(0, 5).map((review) => (
                <div
                  key={review.id}
                  className="p-4 bg-gray-50 rounded-2xl border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900 text-sm">
                      {review.author_name ?? "Anonymous"}
                    </span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-3.5 h-3.5 text-accent fill-accent"
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                  )}
                  {review.response && (
                    <div className="mt-3 pl-4 border-l-2 border-primary/20">
                      <p className="text-xs font-semibold text-primary mb-1">
                        Agency Reply
                      </p>
                      <p className="text-gray-600 text-sm">
                        {review.response}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] flex items-center justify-between z-50">
        <div>
          <div className="text-xs text-gray-500 font-medium">Total price</div>
          <div className="text-xl font-bold text-gray-900">
            {new Intl.NumberFormat("uz-UZ").format(itinerary.total_price)}{" "}
            <span className="text-sm font-normal text-gray-500">
              {itinerary.currency}
            </span>
          </div>
        </div>
        <PackageBookingModal 
          itineraryId={itinerary.id} 
          price={itinerary.total_price} 
          currency={itinerary.currency} 
          isLoggedIn={!!user} 
        />
      </div>
    </main>
  );
}
