"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Package, Calendar, Star, MapPin, CheckCircle2 } from "lucide-react";
import { PackageBookingModal } from "@/components/booking/PackageBookingModal";
import type { ItineraryDetail, ReviewWithAuthor } from "@repo/database";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

interface PackageDetailClientProps {
  itinerary: ItineraryDetail;
  reviews: ReviewWithAuthor[];
  isLoggedIn: boolean;
}

export function PackageDetailClient({ itinerary, reviews, isLoggedIn }: PackageDetailClientProps) {
  const dateRange =
    itinerary.start_date && itinerary.end_date
      ? `${new Date(itinerary.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} — ${new Date(
          itinerary.end_date
        ).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
      : null;

  // Extract a hero image from items, or use a default
  const heroImage =
    itinerary.items.find((item) => item.service_image)?.service_image ||
    "/images/registan_4k.png";

  return (
    <main className="min-h-screen bg-[#F9F8F5] pb-24 text-[#0A2320]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-32 lg:pt-40">
        
        {/* Top Breadcrumb */}
        <div className="mb-12">
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-[#0A2320] text-sm font-medium transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to all packages
          </Link>
          <Breadcrumb 
            items={[{ label: "Packages", href: "/packages" }, { label: itinerary.title }]} 
            className="!p-0"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 relative items-start">
          
          {/* Left Column (Sticky Details) */}
          <motion.div 
            className="w-full lg:w-[45%] lg:sticky lg:top-32"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            {itinerary.agency_name && (
              <div className="inline-block px-4 py-1.5 bg-[#C5A880]/10 rounded-full text-[11px] font-bold uppercase tracking-wider text-[#8A6D3B] font-mono mb-6">
                Curated by {itinerary.agency_name}
              </div>
            )}

            <h1 className="text-5xl lg:text-7xl font-serif font-semibold leading-[1.05] tracking-tight text-[#0A2320] mb-8">
              {itinerary.title}
            </h1>

            <div className="flex flex-wrap gap-6 text-[15px] text-gray-600 font-sans mb-10 pb-10 border-b border-[#0A2320]/10">
              {dateRange && (
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-[#C5A880]" />
                  <span>{dateRange}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5 text-[#C5A880]" />
                <span>{itinerary.items.length} Curated Experiences</span>
              </div>
            </div>

            {itinerary.description && (
              <div className="mb-12">
                <h2 className="text-xl font-serif font-semibold mb-4 text-[#0A2320]">Overview</h2>
                <p className="text-gray-600 leading-relaxed text-[15.5px] font-sans">
                  {itinerary.description}
                </p>
              </div>
            )}

            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100/50">
              <p className="text-sm font-medium text-gray-500 mb-1">Total Package Price</p>
              <div className="text-4xl font-serif font-bold text-[#0A2320] mb-6">
                {(Number(itinerary.total_price) || 0).toLocaleString("en-US").replace(/,/g, " ")} 
                <span className="text-lg font-medium text-gray-400 ml-2">{itinerary.currency}</span>
              </div>
              
              <PackageBookingModal 
                itineraryId={itinerary.id} 
                price={itinerary.total_price} 
                currency={itinerary.currency} 
                isLoggedIn={isLoggedIn} 
              />
            </div>
          </motion.div>

          {/* Right Column (Hero Collage + Timeline) */}
          <motion.div 
            className="w-full lg:w-[55%] flex flex-col gap-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            
            {/* Hero Image / Collage */}
            <div className="w-full h-[500px] lg:h-[650px] rounded-[32px] overflow-hidden relative shadow-lg">
              <img 
                src={heroImage} 
                alt={itinerary.title} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* Journey Timeline */}
            <div>
              <h2 className="text-3xl font-serif font-semibold text-[#0A2320] mb-10">
                Your Journey
              </h2>
              
              {itinerary.items.length > 0 ? (
                <div className="relative pl-6 md:pl-8 border-l-2 border-[#C5A880]/30 space-y-12">
                  {itinerary.items.map((item, idx) => (
                    <div key={item.id} className="relative">
                      {/* Timeline Node */}
                      <div className="absolute -left-[35px] md:-left-[43px] top-1 w-6 h-6 rounded-full bg-[#F9F8F5] border-4 border-[#C5A880] shadow-sm" />
                      
                      <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 flex flex-col sm:flex-row">
                        {item.service_image && (
                          <div className="w-full sm:w-48 h-40 sm:h-auto shrink-0 relative">
                            <img src={item.service_image} alt="Service" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-6 flex-1 flex flex-col justify-center">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 font-mono mb-2">
                            Stop {idx + 1}
                          </div>
                          <h3 className="text-xl font-serif font-semibold text-[#0A2320] mb-2 leading-snug">
                            {item.service_title ?? item.title ?? "Custom Experience"}
                          </h3>
                          {item.price != null && (
                            <div className="text-sm font-semibold text-[#006B70] mt-auto">
                              Value: {(Number(item.price) || 0).toLocaleString("en-US").replace(/,/g, " ")} {itinerary.currency}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-[15px]">No specific items detailed for this package.</p>
              )}
            </div>

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <div>
                <h2 className="text-3xl font-serif font-semibold text-[#0A2320] mb-8">
                  Traveler Reviews
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
                      {review.response && (
                        <div className="mt-6 p-5 bg-[#F9F8F5] rounded-2xl border-l-4 border-[#C5A880]">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-4 h-4 text-[#C5A880]" />
                            <span className="text-xs font-bold uppercase tracking-wider text-[#C5A880] font-mono">Agency Response</span>
                          </div>
                          <p className="text-gray-600 text-[14.5px] leading-relaxed">{review.response}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </main>
  );
}
