"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Heart, X, CheckCircle2, XCircle, Star } from "lucide-react";
import { PackageBookingModal } from "@/components/booking/PackageBookingModal";
import type { ItineraryDetail, ReviewWithAuthor } from "@repo/database";

interface PackageDetailClientProps {
  itinerary: ItineraryDetail;
  reviews: ReviewWithAuthor[];
}

export function PackageDetailClient({ itinerary, reviews }: PackageDetailClientProps) {
  const tourPhotos = itinerary.items
    .filter((item) => item.service_image)
    .map((item) => item.service_image!);
    
  // Use a fallback for photos to ensure we have exactly 4 for the gallery layout
  const displayPhotos = [...tourPhotos, "/images/registan_4k.png", "/images/registan_4k.png", "/images/registan_4k.png"].slice(0, 4);

  const [activeImage, setActiveImage] = React.useState(displayPhotos[0]);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Calculate duration in days
  const durationDays =
    itinerary.start_date && itinerary.end_date
      ? Math.ceil((new Date(itinerary.end_date).getTime() - new Date(itinerary.start_date).getTime()) / (1000 * 60 * 60 * 24))
      : 3; // fallback for design

  // Average rating
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "4.8";

  return (
    <main className="min-h-screen bg-white pb-56 md:pb-32 text-[#0A2320]">
      
      {/* Fixed Back and Favorite Buttons */}
      <div className="fixed top-[90px] left-5 right-5 max-w-[900px] mx-auto flex justify-between items-center z-[45] pointer-events-none">
        <Link
          href="/packages"
          className="w-10 h-10 rounded-full bg-[#0A2320] flex items-center justify-center text-white shadow-md hover:bg-black transition-colors pointer-events-auto"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <button className="w-10 h-10 rounded-full bg-[#0A2320] flex items-center justify-center text-white shadow-md hover:bg-black transition-colors pointer-events-auto">
          <Heart className="w-5 h-5" />
        </button>
      </div>

      {/* Fullscreen Photo Viewer */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center touch-none">
          {/* Close button */}
          <button 
            onClick={() => setIsFullscreen(false)}
            className="absolute top-8 right-6 text-white w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
          >
            <X className="w-6 h-6" />
          </button>
          
          {/* Main Large Photo */}
          <div className="w-full px-4 max-h-[70vh] flex items-center justify-center">
            <motion.img
              key={activeImage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={activeImage}
              alt="Fullscreen View"
              className="max-w-full max-h-[70vh] object-contain rounded-xl"
            />
          </div>

          {/* Thumbnails at the bottom */}
          <div className="absolute bottom-10 left-0 right-0 px-6 flex justify-center gap-3 md:gap-5 overflow-x-auto pb-4 scrollbar-hide">
            {displayPhotos.map((photo, i) => (
              <button 
                key={i}
                onClick={() => setActiveImage(photo)}
                className={`w-[70px] h-[70px] md:w-[90px] md:h-[90px] shrink-0 rounded-2xl border-[3px] overflow-hidden shadow-lg transition-all ${
                  activeImage === photo ? "border-[#48CAE4] scale-105" : "border-white/50 hover:scale-105 opacity-60 hover:opacity-100"
                }`}
              >
                <img src={photo} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hero Image Section */}
      <div className="relative w-full h-[450px] md:h-[500px] mb-12">
        {/* The curved image container */}
        <div 
          className="absolute inset-0 rounded-b-[48px] overflow-hidden bg-gray-900 cursor-pointer"
          onClick={() => setIsFullscreen(true)}
        >
          <motion.img
            key={activeImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            src={activeImage}
            alt={itinerary.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/20 pointer-events-none" />
        </div>

        {/* Title & Location (bottom left) */}
        <div className="absolute bottom-10 left-6 right-[100px] z-20">
          <h1 className="text-3xl md:text-4xl font-semibold text-white mb-2 leading-tight">
            {itinerary.title}
          </h1>
          <div className="flex items-center gap-1.5 text-white/90">
            <MapPin className="w-4 h-4" />
            <span className="text-[13px] font-medium tracking-wide">
              {itinerary.agency_name ? `${itinerary.agency_name}` : "Uzbekistan"}
            </span>
          </div>
        </div>

        {/* Vertical Overlapping Photo Gallery */}
        <div className="absolute right-5 -bottom-10 z-30 flex flex-col gap-3">
          {displayPhotos.map((photo, i) => (
            <button 
              key={i}
              onClick={() => setActiveImage(photo)}
              className={`w-[68px] h-[68px] rounded-2xl border-[3px] overflow-hidden shadow-lg bg-gray-200 transition-all cursor-pointer ${
                activeImage === photo ? "border-[#48CAE4] scale-105" : "border-white hover:scale-105"
              }`}
            >
              <img src={photo} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 max-w-[900px] mx-auto">
        {/* Stats Chips */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="flex-1 flex flex-col items-center justify-center py-4 border border-gray-100 rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <span className="text-[11px] text-gray-800 font-medium mb-1">Days</span>
            <span className="text-xl font-bold text-[#48CAE4]">{durationDays}</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-4 border border-gray-100 rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <span className="text-[11px] text-gray-800 font-medium mb-1">Stops</span>
            <span className="text-xl font-bold text-[#48CAE4]">{itinerary.items.length || 5}</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-4 border border-gray-100 rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <span className="text-[11px] text-gray-800 font-medium mb-1">Rating</span>
            <span className="text-xl font-bold text-[#48CAE4]">{avgRating}</span>
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-8">
          <h2 className="text-[17px] font-bold text-[#0A2320] mb-3">Description</h2>
          <p className="text-gray-500 text-[13px] leading-[1.7]">
            {itinerary.description || "This is one of our most popular packages, combining beautiful nature, rich history, and authentic cultural experiences. Enjoy a carefully crafted itinerary that ensures you see the very best highlights while traveling in comfort."}
            <span className="text-[#48CAE4] ml-1 font-medium cursor-pointer">Read More</span>
          </p>
        </div>
        
        {/* Journey Timeline */}
        {itinerary.items.length > 0 && (
          <div className="mt-10 mb-8">
            <h2 className="text-[17px] font-bold text-[#0A2320] mb-5">Your Journey</h2>
            <div className="space-y-4">
              {itinerary.items.map((item, idx) => (
                <div key={item.id} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#0A2320] text-white flex items-center justify-center text-sm font-bold shrink-0 mt-1">
                    {idx + 1}
                  </div>
                  <div className="flex-1 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 p-4">
                      {item.service_image && (
                        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                          <img src={item.service_image} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[15px] font-semibold text-[#0A2320] truncate">
                          {item.service_title ?? item.title ?? "Custom Experience"}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="mt-10 mb-8">
          <h2 className="text-[17px] font-bold text-[#0A2320] mb-5">What's Included</h2>
          <div className="bg-[#F8F9FA] rounded-3xl p-6 border border-gray-100">
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-[14px] text-gray-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-[#48CAE4] shrink-0" />
                Accommodation in premium 4-star hotels
              </li>
              <li className="flex items-center gap-3 text-[14px] text-gray-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-[#48CAE4] shrink-0" />
                Daily breakfast and selected dinners
              </li>
              <li className="flex items-center gap-3 text-[14px] text-gray-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-[#48CAE4] shrink-0" />
                High-speed train tickets & transportation
              </li>
              <li className="flex items-center gap-3 text-[14px] text-gray-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-[#48CAE4] shrink-0" />
                Expert local guides and all entrance fees
              </li>
              <div className="h-px bg-gray-200 my-4"></div>
              <li className="flex items-center gap-3 text-[14px] text-gray-400 font-medium">
                <XCircle className="w-5 h-5 text-gray-300 shrink-0" />
                International flights and visa fees
              </li>
            </ul>
          </div>
        </div>

        {/* Tour Route Map */}
        <div className="mt-10 mb-12">
          <h2 className="text-[17px] font-bold text-[#0A2320] mb-5">Tour Route</h2>
          <div className="rounded-[32px] overflow-hidden border-4 border-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] bg-gray-100 relative h-[250px] md:h-[350px]">
            <img src="/images/map_placeholder.png" alt="Tour Map Route" className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center gap-2 shadow-sm border border-gray-100">
              <MapPin className="w-4 h-4 text-[#48CAE4]" />
              <span className="text-[11px] font-bold text-[#0A2320] uppercase tracking-wider">Uzbekistan</span>
            </div>
          </div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="mt-10 mb-8 -mx-6 px-6">
            <h2 className="text-[17px] font-bold text-[#0A2320] mb-5">Reviews ({reviews.length})</h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x">
              {reviews.slice(0, 5).map((review) => (
                <div key={review.id} className="bg-[#F8F9FA] p-6 rounded-3xl min-w-[280px] max-w-[320px] shrink-0 snap-start border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#0A2320] text-white flex items-center justify-center font-serif font-bold text-sm shadow-sm">
                      {(review.author_name || "A")[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[14px] text-[#0A2320] truncate">{review.author_name ?? "Anonymous"}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3.5 h-3.5 text-[#48CAE4] fill-[#48CAE4]" />
                        <span className="text-[11px] font-bold text-gray-500">{review.rating}</span>
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-500 text-[13px] leading-[1.7] line-clamp-3">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <PackageBookingModal packageId={itinerary.id} />
    </main>
  );
}
