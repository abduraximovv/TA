"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HeroSection } from "./HeroSection";
import { DestinationsSection } from "./DestinationsSection";
import { EventsSection } from "./EventsSection";
import { OffersSection } from "./OffersSection";
import { ThingsToDoSection } from "./ThingsToDoSection";
import { KnowTheDestinationsSection } from "./KnowTheDestinationsSection";
import { PackagesSection } from "./PackagesSection";
import { StatsSection } from "./StatsSection";
import { KnowBeforeYouGoSection } from "./KnowBeforeYouGoSection";
import { SurveyCTASection } from "./SurveyCTASection";
import { Search, SlidersHorizontal, Heart, MapPin, Bell } from "lucide-react";
import type { Destination, Service, Event } from "@repo/database";
import type { Itinerary } from "@repo/types";

interface LandingClientProps {
  destinations: Destination[];
  experiences: Service[];
  packages: Itinerary[];
  events: Event[];
}

export function LandingClient({
  destinations,
  experiences,
  packages,
  events,
}: LandingClientProps) {
  const [activeCategory, setActiveCategory] = useState("Tours");
  const categories = ["Tours", "Events", "Hotels"];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#F9F8F5", color: "#0A2320" }}>
      
      {/* Mobile Top Header (replaces standard nav on mobile home page if needed, but we'll just float it over hero if they want it. The user said "где фото должен снизу быть как на фото не трогай фото". So Hero stays as is.) */}
      
      {/* Hero — full viewport slider, navbar overlays as transparent header */}
      <HeroSection />

      {/* --- NEW MOBILE UI (Only visible on small screens) --- */}
      <div className="md:hidden bg-[#F8F9FA] px-6 pt-8 pb-32 rounded-t-3xl -mt-6 relative z-20">
        
        {/* Mobile Header / Greeting */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#0A2320] leading-tight">
              Discover<br />your next journey!
            </h2>
          </div>
        </div>

        {/* Search Bar & Filter */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 flex items-center bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input 
              type="text" 
              placeholder="Search Places" 
              className="bg-transparent border-none outline-none w-full text-[15px] font-medium placeholder-gray-400"
            />
          </div>
          <button className="w-14 h-14 bg-[#0A2320] rounded-2xl flex items-center justify-center text-white shadow-md shrink-0">
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-3 mb-8 overflow-x-auto scrollbar-hide pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-3 rounded-xl text-[14px] font-semibold whitespace-nowrap transition-all shadow-sm ${
                activeCategory === cat 
                  ? "bg-[#0A2320] text-white" 
                  : "bg-white text-gray-500 border border-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Vertical Cards Grid (Tours/Packages) */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          {packages.slice(0, 2).map((pkg) => {
            const image = (pkg as any).items?.[0]?.service_image || "/images/registan_4k.png";
            return (
              <Link href={`/packages/${pkg.id}`} key={pkg.id} className="block relative h-[240px] rounded-[28px] overflow-hidden shadow-md">
                <img src={image} alt={pkg.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Price Tag */}
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[10px] font-bold">
                  {(Number(pkg.total_price) || 0).toLocaleString()} {pkg.currency}
                </div>

                {/* Content */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  {/* Rating placeholder */}
                  <div className="flex items-center gap-1 text-[#F4C430] mb-1">
                    <span className="text-[12px]">★</span>
                    <span className="text-[11px] font-bold text-white">4.8</span>
                  </div>
                  <h3 className="text-[15px] font-bold leading-tight mb-1 truncate">{pkg.title}</h3>
                  <div className="flex items-center gap-1 text-white/70 text-[10px]">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{(pkg as any).agency_name || "Uzbekistan"}</span>
                  </div>
                </div>

                {/* Heart */}
                <button className="absolute bottom-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <Heart className="w-3.5 h-3.5 text-white" />
                </button>
              </Link>
            );
          })}
        </div>

        {/* Property Nearby (Popular Experiences) */}
        <h3 className="text-[18px] font-bold text-[#0A2320] mb-5 tracking-tight">Popular Experiences</h3>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
          {experiences.slice(0, 4).map((exp) => (
            <Link href={`/service/${exp.id}`} key={exp.id} className="flex bg-white rounded-[20px] p-3 shadow-sm border border-gray-100 min-w-[200px] shrink-0 gap-3 items-center">
              <div className="w-16 h-16 rounded-[14px] overflow-hidden shrink-0">
                <img src={exp.image_url || "/images/registan_4k.png"} alt={exp.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <h4 className="text-[13px] font-bold text-[#0A2320] truncate">{exp.title}</h4>
                <div className="text-[14px] font-bold text-[#0A2320] mt-0.5">
                  {(Number(exp.price) || 0).toLocaleString()} {exp.currency}
                </div>
              </div>
              <Heart className="w-4 h-4 text-gray-300 mr-2 shrink-0" fill="currentColor" />
            </Link>
          ))}
        </div>
      </div>

      {/* --- DESKTOP SECTIONS (Hidden on mobile) --- */}
      <div className="hidden md:block">
        {/* Explore Silk Road Cities — curated destination carousel */}
        <DestinationsSection destinations={destinations} />

        {/* What's On — upcoming events & festivals */}
        <EventsSection events={events} />

        {/* Discover the Latest Offers — partner discounts */}
        <OffersSection />

        {/* Things To Do — filterable category carousel */}
        <ThingsToDoSection experiences={experiences} />

        {/* Know the Destinations — mini interactive map */}
        <KnowTheDestinationsSection destinations={destinations} />

        {/* Book Your Next Adventure — curated packages by travel agencies */}
        <PackagesSection itineraries={packages} />

        {/* Uzbekistan in Numbers */}
        <StatsSection />

        {/* Know Before You Go */}
        <KnowBeforeYouGoSection />

        {/* Survey CTA */}
        <SurveyCTASection />
      </div>
    </div>
  );
}
