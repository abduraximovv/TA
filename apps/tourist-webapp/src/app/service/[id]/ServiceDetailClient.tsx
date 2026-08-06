"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Clock, MapPin, User, CheckCircle2, Navigation } from "lucide-react";
import { ServiceBookingModal } from "@/components/booking/ServiceBookingModal";
import { formatDuration } from "@repo/database";
import type { Service, ReviewWithAuthor } from "@repo/database";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};

interface ServiceDetailClientProps {
  service: Service;
  reviews: ReviewWithAuthor[];
  isLoggedIn: boolean;
}

export function ServiceDetailClient({ service, reviews, isLoggedIn }: ServiceDetailClientProps) {
  const duration = formatDuration(service.duration_minutes);
  const locationText = [service.city, service.region].filter(Boolean).join(", ");
  const heroImage = service.image_url || "/images/registan_4k.png";

  return (
    <main className="min-h-screen bg-[#F9F8F5] pb-24 text-[#0A2320]">
      
      {/* Immersive Hero */}
      <div className="relative h-[65vh] min-h-[500px] w-full bg-[#0A2320]">
        <img
          src={heroImage}
          alt={service.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {/* Top scrim -- the gradient above fades to fully transparent at the top edge, so on a
            bright photo (sky, snow, light stone) the back button and breadcrumb lose all
            contrast. This keeps the top nav readable regardless of the photo behind it. */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />

        {/* Top Nav Overlay */}
        <div className="absolute top-0 left-0 w-full p-6 md:p-10 flex items-center gap-4 z-10">
          <Link
            href="/service"
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Breadcrumb 
            light 
            items={[{ label: "Experiences", href: "/service" }, { label: service.title }]} 
            className="!p-0"
          />
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10">
          <div className="max-w-[1200px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-white font-mono mb-6">
                {service.category}
              </div>
              <h1 className="text-5xl md:text-7xl font-serif font-semibold text-white leading-[1.05] tracking-tight max-w-4xl">
                {service.title}
              </h1>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content Layout */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 pt-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Left Column (Main Details) */}
          <motion.div 
            className="w-full lg:w-[60%]"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            {/* Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pb-12 border-b border-[#0A2320]/10 mb-12">
              {service.rating_avg > 0 && (
                <div className="flex flex-col gap-2">
                  <Star className="w-6 h-6 text-[#C5A880] fill-[#C5A880]" />
                  <div>
                    <div className="font-semibold text-lg">{service.rating_avg.toFixed(1)}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest font-bold font-mono">
                      {reviews.length} Review{reviews.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              )}
              {duration && (
                <div className="flex flex-col gap-2">
                  <Clock className="w-6 h-6 text-[#C5A880]" />
                  <div>
                    <div className="font-semibold text-lg">{duration}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest font-bold font-mono">Duration</div>
                  </div>
                </div>
              )}
              {locationText && (
                <div className="flex flex-col gap-2">
                  <MapPin className="w-6 h-6 text-[#C5A880]" />
                  <div>
                    <div className="font-semibold text-lg truncate" title={locationText}>{locationText}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest font-bold font-mono">Location</div>
                  </div>
                </div>
              )}
              {service.max_guests && (
                <div className="flex flex-col gap-2">
                  <User className="w-6 h-6 text-[#C5A880]" />
                  <div>
                    <div className="font-semibold text-lg">Up to {service.max_guests}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest font-bold font-mono">Guests</div>
                  </div>
                </div>
              )}
            </div>

            {/* Overview */}
            {service.description && (
              <div className="mb-16">
                <h2 className="text-3xl font-serif font-semibold text-[#0A2320] mb-6">
                  The Experience
                </h2>
                <p className="text-gray-600 leading-relaxed text-[16px] font-sans">
                  {service.description}
                </p>
              </div>
            )}

            {/* Map/Location Placeholder */}
            {locationText && (
              <div className="mb-16">
                <h2 className="text-3xl font-serif font-semibold text-[#0A2320] mb-6">
                  Where you'll be
                </h2>
                <div className="w-full h-[300px] bg-gray-200 rounded-[24px] overflow-hidden relative flex items-center justify-center">
                  {/* Replace with actual Mapbox component later */}
                  <div className="absolute inset-0 bg-[#0A2320]/5" />
                  <div className="flex flex-col items-center text-[#0A2320]/60 gap-3 z-10">
                    <Navigation className="w-8 h-8" />
                    <span className="font-medium font-sans">{locationText}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div>
                <h2 className="text-3xl font-serif font-semibold text-[#0A2320] mb-8">
                  Guest Reviews
                </h2>
                <div className="space-y-6">
                  {reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#0A2320] text-white flex items-center justify-center font-serif font-semibold">
                            {(review.author_name || "A")[0]}
                          </div>
                          <span className="font-semibold text-[#0A2320]">
                            {review.author_name ?? "Anonymous"}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-[#C5A880] fill-[#C5A880]" />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-600 leading-relaxed text-[15px] mt-4">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Right Column (Sticky Booking Card) */}
          <div className="w-full lg:w-[40%]">
            <div className="sticky top-32 bg-white p-8 lg:p-10 rounded-[32px] shadow-xl shadow-black/5 border border-gray-100/50">
              <div className="mb-8">
                <div className="text-sm font-medium text-gray-500 mb-2">Price per person</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-serif font-bold text-[#0A2320]">
                    {(Number(service.price) || 0).toLocaleString("en-US").replace(/,/g, " ")}
                  </span>
                  <span className="text-lg font-medium text-gray-400">{service.currency}</span>
                </div>
              </div>

              <div className="space-y-4 text-[14px] text-gray-600 font-sans mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#C5A880]" /> Free cancellation available
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#C5A880]" /> Instant confirmation
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#C5A880]" /> Secure booking
                </div>
              </div>
              
              <div className="w-full">
                <ServiceBookingModal 
                  serviceId={service.id} 
                  price={service.price} 
                  currency={service.currency} 
                  isLoggedIn={isLoggedIn} 
                />
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}
