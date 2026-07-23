import React from "react";
import Link from "next/link";
import { ServiceBookingModal } from "@/components/booking/ServiceBookingModal";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { getServiceById, getReviewsForService } from "@repo/database";
import { formatDuration } from "@repo/database";
import type { ReviewWithAuthor } from "@repo/database";
import { Button } from "@repo/ui";
import { ArrowLeft, Star, Clock, MapPin, CheckCircle, User } from "lucide-react";

export const revalidate = 3600;

export default async function ServiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient(cookies());
  const [{ data: { user } }, service, reviews] = await Promise.all([
    supabase.auth.getUser(),
    getServiceById(params.id),
    getReviewsForService(params.id).catch(() => [] as ReviewWithAuthor[]),
  ]);

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Service Not Found
        </h1>
        <p className="text-gray-500 mb-6">
          The experience you are looking for does not exist or has been removed.
        </p>
        <Link href="/discover">
          <Button className="bg-primary">Return to Discover</Button>
        </Link>
      </div>
    );
  }

  const duration = formatDuration(service.duration_minutes);
  const locationText = [service.city, service.region]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="min-h-screen bg-white pb-24">
      {/* Media Gallery / Header */}
      <div className="relative h-[40vh] bg-gray-200">
        <img
          src={
            service.image_url ||
            "https://images.unsplash.com/photo-1524317420516-7fc1154c1fce?q=80&w=1200"
          }
          alt={service.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 w-full p-4 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
          <Link
            href="/discover"
            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 -mt-8 relative z-10 bg-white rounded-t-3xl shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)]">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-xs font-bold tracking-wider text-accent uppercase mb-2">
              {service.category}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {service.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600 border-b border-gray-100 pb-6">
          {service.rating_avg > 0 && (
            <div className="flex items-center">
              <Star className="w-4 h-4 text-accent fill-accent mr-1" />
              <span className="font-semibold text-gray-900 mr-1">
                {service.rating_avg.toFixed(1)}
              </span>
              {reviews.length > 0 && (
                <span className="text-gray-500">
                  ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
                </span>
              )}
            </div>
          )}
          {duration && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" /> {duration}
            </div>
          )}
          {locationText && (
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" /> {locationText}
            </div>
          )}
          {service.max_guests && (
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" /> Max {service.max_guests} guests
            </div>
          )}
        </div>

        {service.description && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              About this experience
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {service.description}
            </p>
          </div>
        )}

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
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
                        Business Reply
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
          <div className="text-xs text-gray-500 font-medium">
            Price per person
          </div>
          <div className="text-xl font-bold text-gray-900">
            {new Intl.NumberFormat("uz-UZ").format(service.price)}{" "}
            <span className="text-sm font-normal text-gray-500">
              {service.currency}
            </span>
          </div>
        </div>
        <ServiceBookingModal 
          serviceId={service.id} 
          price={service.price} 
          currency={service.currency} 
          isLoggedIn={!!user} 
        />
      </div>
    </main>
  );
}
