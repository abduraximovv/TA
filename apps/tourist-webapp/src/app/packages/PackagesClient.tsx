"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { ItineraryWithMeta } from "@repo/database";
import { Package, Calendar, ArrowRight, Search, Check, SlidersHorizontal } from "lucide-react";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { PageHero } from "@/components/PageHero";
import { PackageFiltersModal, type AppliedPackageFilters } from "@/components/packages/PackageFiltersModal";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?q=80&w=900",
  "https://images.unsplash.com/photo-1596401057633-54ceb50f7e33?q=80&w=900",
  "https://images.unsplash.com/photo-1541364501234-7096e2ccb898?q=80&w=900",
  "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?q=80&w=900",
];

export function PackagesClient({ itineraries }: { itineraries: ItineraryWithMeta[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AppliedPackageFilters | null>(null);

  // Destinations covered, derived from the real itineraries' own services -- never hardcoded.
  const destinations = React.useMemo(
    () => Array.from(new Set(itineraries.flatMap((i) => i.cities))).sort(),
    [itineraries]
  );

  const activeAdvancedCount = advancedFilters
    ? (advancedFilters.agencies.length > 0 ? 1 : 0) + (advancedFilters.budgetActive ? 1 : 0)
    : 0;

  const filteredItineraries = React.useMemo(() => {
    return itineraries.filter((itin) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = itin.title.toLowerCase().includes(query);
        const matchesDescription = itin.description?.toLowerCase().includes(query) || false;
        const matchesAgency = itin.agency_name?.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesDescription && !matchesAgency) return false;
      }

      if (selectedDestination && !itin.cities.includes(selectedDestination)) return false;

      if (advancedFilters) {
        if (advancedFilters.agencies.length > 0 && (!itin.agency_name || !advancedFilters.agencies.includes(itin.agency_name))) {
          return false;
        }
        const price = Number(itin.total_price) || 0;
        if (price < advancedFilters.budget.min || price > advancedFilters.budget.max) return false;
      }

      return true;
    });
  }, [itineraries, searchQuery, selectedDestination, advancedFilters]);

  return (
    <main style={{ minHeight: "100vh", paddingBottom: 96, background: "#F9F8F5" }}>
      <div style={{ maxWidth: 1600, margin: "0 auto", padding: "0 24px" }}>
        <Breadcrumb items={[{ label: "Packages" }]} style={{ marginBottom: 20, paddingTop: 112 }} />

        <PageHero
          title="Packages"
          eyebrow="Curated by Verified Agencies"
          image="https://images.unsplash.com/photo-1733586092622-1b3201e802a5?q=80&w=2000"
          alt="Registan Square, Samarkand"
        />

        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 32 }}
        >
          <p style={{ fontSize: 17, color: "rgba(10,35,32,0.6)", maxWidth: 560 }}>
            Curated multi-day itineraries crafted by verified travel agencies.
          </p>
        </motion.header>

        {/* Search + Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={20} color="rgba(10,35,32,0.4)" className="absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search packages"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-none outline-none text-[15px] shadow-sm bg-white text-[#0A2320]"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-14 h-14 rounded-2xl bg-[#0A2320] flex items-center justify-center shrink-0 relative"
          >
            <SlidersHorizontal size={20} color="#FFFFFF" />
            {activeAdvancedCount > 0 && (
              <div className="absolute -top-1.5 -right-1.5 bg-[#C1592A] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {activeAdvancedCount}
              </div>
            )}
          </button>
        </div>

        {/* Agency chips */}
        <div className="flex items-center gap-3 mb-10 overflow-x-auto scrollbar-hide pb-2 [&>*]:shrink-0">
          <button
            onClick={() => setSelectedDestination(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "12px 20px",
              borderRadius: 12,
              border: selectedDestination === null ? "1px solid #0A2320" : "1px solid #EFEDE7",
              background: "#FFFFFF",
              color: selectedDestination === null ? "#0A2320" : "rgba(10,35,32,0.6)",
              fontSize: 14,
              fontWeight: selectedDestination === null ? 600 : 500,
              cursor: "pointer",
            }}
          >
            {selectedDestination === null && <Check size={14} />}
            All
          </button>
          {destinations.map((city) => {
            const isActive = selectedDestination === city;
            return (
              <button
                key={city}
                onClick={() => setSelectedDestination(isActive ? null : city)}
                style={{
                  padding: "12px 20px",
                  borderRadius: 12,
                  border: isActive ? "1px solid #0A2320" : "1px solid #EFEDE7",
                  background: "#FFFFFF",
                  color: isActive ? "#0A2320" : "rgba(10,35,32,0.6)",
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  cursor: "pointer",
                }}
              >
                {city}
              </button>
            );
          })}
        </div>

        {filteredItineraries.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: "16px",
            }}
          >
            {filteredItineraries.map((itin, i) => (
              <PackageCard key={itin.id} itinerary={itin} fallback={FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]} />
            ))}
          </motion.div>
        ) : itineraries.length > 0 ? (
          <div
            style={{
              width: "100%",
              padding: "80px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "1px dashed rgba(10,35,32,0.15)",
              borderRadius: 8,
              background: "#FFFFFF",
            }}
          >
            <Package style={{ width: 40, height: 40, color: "rgba(10,35,32,0.2)", marginBottom: 16 }} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: "#0A2320", marginBottom: 8 }}>
              No packages match your filters
            </h2>
            <p style={{ color: "rgba(10,35,32,0.5)", fontSize: 14, textAlign: "center" }}>
              Try clearing a filter or searching for something else.
            </p>
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              padding: "80px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "1px dashed rgba(10,35,32,0.15)",
              borderRadius: 8,
              background: "#FFFFFF",
            }}
          >
            <Package style={{ width: 40, height: 40, color: "rgba(10,35,32,0.2)", marginBottom: 16 }} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: "#0A2320", marginBottom: 8 }}>
              No packages available yet
            </h2>
            <p style={{ color: "rgba(10,35,32,0.5)", fontSize: 14, marginBottom: 24, maxWidth: 420, textAlign: "center" }}>
              Travel agencies are currently crafting exciting itineraries. Check back soon or explore individual experiences.
            </p>
            <Link href="/service" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              Explore Experiences <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
          </div>
        )}
      </div>

      <PackageFiltersModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={(filters) => setAdvancedFilters(filters)}
        itineraries={itineraries}
      />
    </main>
  );
}

function PackageCard({ itinerary, fallback }: { itinerary: ItineraryWithMeta; fallback: string }) {
  const priceStr = (Number(itinerary.total_price) || 0).toLocaleString("en-US").replace(/,/g, " ");

  return (
    <motion.div variants={fadeUp} whileHover={{ y: -4 }} style={{ height: "100%" }}>
      <Link href={`/packages/${itinerary.id}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
        <div
          className="package-card"
          style={{
            position: "relative",
            borderRadius: 20,
            overflow: "hidden",
            aspectRatio: "3/4",
            cursor: "pointer",
          }}
        >
          <Image
            src={itinerary.image_url || fallback}
            alt={itinerary.title}
            fill
            className="object-cover package-card-img transition-transform duration-700 hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(10,35,32,0.9) 0%, rgba(10,35,32,0.3) 45%, transparent 65%)",
            }}
          />
          {/* Price badge */}
          <div className="absolute top-3 left-3 bg-[#0A2320]/70 backdrop-blur-sm text-white text-[12px] font-bold px-3 py-1.5 rounded-full font-mono">
            {priceStr} <span className="text-[9px] text-white/60">{itinerary.currency}</span>
          </div>
          {/* Items count badge */}
          {itinerary.item_count > 0 && (
            <div className="absolute top-3 right-3 bg-[#0A2320]/70 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
              {itinerary.item_count} items
            </div>
          )}
          {/* Text overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-serif text-[16px] md:text-[20px] font-bold text-white leading-tight mb-1 line-clamp-2">
              {itinerary.title}
            </h3>
            <div className="font-mono text-[10px] text-white/60 uppercase tracking-widest">
              {itinerary.agency_name || "Tour Package"}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
