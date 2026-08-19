"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Clock, MapPin, User, Heart, CheckCircle2, Navigation } from "lucide-react";
import { ServiceBookingModal } from "@/components/booking/ServiceBookingModal";
import { formatDuration } from "@repo/database";
import type { Service, ReviewWithAuthor } from "@repo/database";

interface ServiceDetailClientProps {
  service: Service;
  reviews: ReviewWithAuthor[];
}

export function ServiceDetailClient({ service, reviews }: ServiceDetailClientProps) {
  const duration = formatDuration(service.duration_minutes);
  const locationText = [service.city, service.region].filter(Boolean).join(", ");
  const heroImage = service.image_url || "/images/registan_4k.png";
  const priceStr = (Number(service.price) || 0).toLocaleString("en-US").replace(/,/g, " ");

  // Average rating
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : (service.rating_avg > 0 ? service.rating_avg.toFixed(1) : null);

  return (
    <main className="min-h-screen bg-[#F9F8F5] pb-56 md:pb-32 text-[#0A2320]">

      {/* Hero Image Section */}
      <div className="relative w-full aspect-[4/3] md:aspect-[16/7] max-h-[500px] md:max-h-[600px]">
        <img
          src={heroImage}
          alt={service.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/30" />

        {/* Back Button */}
        <Link
          href="/experiences"
          className="absolute top-12 left-5 md:left-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        {/* Price Badge */}
        <div className="absolute bottom-5 left-5 md:bottom-8 md:left-10 z-10">
          <div className="bg-[#0A2320]/80 backdrop-blur-md rounded-2xl px-5 py-3">
            <div className="text-white/70 text-[11px] font-mono uppercase tracking-wider mb-0.5">{service.category || "Experience"}</div>
            <div className="text-white text-xl md:text-2xl font-bold font-mono">
              {priceStr} <span className="text-sm text-white/60 font-medium">{service.currency}</span>
            </div>
          </div>
        </div>

        {/* Heart Button */}
        <button className="absolute bottom-5 right-5 md:bottom-8 md:right-10 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center z-10">
          <Heart className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="px-5 md:px-10 max-w-[900px] mx-auto">

        {/* Title + Rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pt-6 pb-4"
        >
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-[26px] md:text-4xl font-serif font-bold leading-tight text-[#0A2320]">
              {service.title}
            </h1>
            {avgRating && (
              <div className="flex items-center gap-1.5 shrink-0 bg-[#FFF8E7] px-3 py-1.5 rounded-full">
                <Star className="w-4 h-4 text-[#C5A880] fill-[#C5A880]" />
                <span className="text-sm font-bold text-[#0A2320]">{avgRating}</span>
              </div>
            )}
          </div>

          {/* Location */}
          {locationText && (
            <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{locationText}</span>
            </div>
          )}
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-gray-200 my-4" />

        {/* Experience Details Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="py-4"
        >
          <h2 className="text-lg font-serif font-bold text-[#0A2320] mb-5">Experience Details</h2>
          <div className="grid grid-cols-3 gap-y-6 gap-x-4">
            {duration && (
              <div className="flex flex-col items-center text-center gap-1.5">
                <Clock className="w-6 h-6 text-gray-400" />
                <div className="text-[15px] font-bold text-[#0A2320]">{duration}</div>
                <div className="text-[11px] text-gray-400 font-medium">Duration</div>
              </div>
            )}
            {service.rating_avg > 0 && (
              <div className="flex flex-col items-center text-center gap-1.5">
                <Star className="w-6 h-6 text-gray-400" />
                <div className="text-[15px] font-bold text-[#0A2320]">{service.rating_avg.toFixed(1)}</div>
                <div className="text-[11px] text-gray-400 font-medium">{reviews.length} Reviews</div>
              </div>
            )}
            {locationText && (
              <div className="flex flex-col items-center text-center gap-1.5">
                <MapPin className="w-6 h-6 text-gray-400" />
                <div className="text-[13px] font-bold text-[#0A2320] truncate max-w-[80px]">{service.city || "Uzbekistan"}</div>
                <div className="text-[11px] text-gray-400 font-medium">Location</div>
              </div>
            )}
            {service.max_guests && (
              <div className="flex flex-col items-center text-center gap-1.5">
                <User className="w-6 h-6 text-gray-400" />
                <div className="text-[15px] font-bold text-[#0A2320]">{service.max_guests}</div>
                <div className="text-[11px] text-gray-400 font-medium">Max Guests</div>
              </div>
            )}
            {service.category && (
              <div className="flex flex-col items-center text-center gap-1.5">
                <Navigation className="w-6 h-6 text-gray-400" />
                <div className="text-[13px] font-bold text-[#0A2320] truncate max-w-[80px]">{service.category}</div>
                <div className="text-[11px] text-gray-400 font-medium">Category</div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-gray-200 my-4" />

        {/* Description */}
        {service.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="py-4"
          >
            <h2 className="text-lg font-serif font-bold text-[#0A2320] mb-4">The Experience</h2>
            <p className="text-gray-500 text-[15px] leading-relaxed">
              {service.description}
            </p>
          </motion.div>
        )}

        {/* Divider */}
        <div className="h-px bg-gray-200 my-4" />

        {/* Location Section */}
        {locationText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="py-4"
          >
            <h2 className="text-lg font-serif font-bold text-[#0A2320] mb-4">Location</h2>
            <div className="w-full h-[200px] md:h-[300px] bg-gray-200 rounded-2xl overflow-hidden relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[#0A2320]/5" />
              <div className="flex flex-col items-center text-[#0A2320]/60 gap-3 z-10">
                <Navigation className="w-8 h-8" />
                <span className="font-medium font-sans text-sm">{locationText}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Divider */}
        <div className="h-px bg-gray-200 my-4" />

        {/* Reviews */}
        {reviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="py-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-serif font-bold text-[#0A2320]">
                Reviews ({reviews.length})
              </h2>
              <span className="text-sm font-semibold text-[#006B70]">See all</span>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {reviews.slice(0, 5).map((review) => (
                <div key={review.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 min-w-[260px] max-w-[300px] shrink-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-[#0A2320] text-white flex items-center justify-center font-serif font-semibold text-sm">
                      {(review.author_name || "A")[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-[#0A2320] truncate">{review.author_name ?? "Anonymous"}</div>
                      <div className="text-xs text-gray-400">Traveler</div>
                    </div>
                    <div className="flex items-center gap-1 bg-[#FFF8E7] px-2 py-1 rounded-full">
                      <Star className="w-3.5 h-3.5 text-[#C5A880] fill-[#C5A880]" />
                      <span className="text-xs font-bold">{review.rating}</span>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-500 text-[13px] leading-relaxed line-clamp-3">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <ServiceBookingModal
        serviceId={service.id}
        price={service.price}
        currency={service.currency}
        maxGuests={service.max_guests}
      />
    </main>
  );
}
