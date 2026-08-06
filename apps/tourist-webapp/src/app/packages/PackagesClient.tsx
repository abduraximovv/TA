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
      <div style={{ maxWidth: 1600, margin: "0 auto", padding: "0 56px" }}>
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
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 40 }}>
          <div style={{ position: "relative" }}>
            <Search size={16} color="rgba(10,35,32,0.4)" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search packages"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "12px 16px 12px 40px",
                borderRadius: 12,
                border: "1px solid transparent",
                background: "#FFFFFF",
                fontSize: 14,
                width: 240,
                outline: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              borderRadius: 12,
              border: "none",
              background: "#006B70",
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <SlidersHorizontal size={16} /> Filters
            {activeAdvancedCount > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  background: "#C1592A",
                  color: "#FFF",
                  fontSize: 10,
                  fontWeight: 700,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {activeAdvancedCount}
              </div>
            )}
          </button>

          {/* Destination chips -- real cities covered by published packages */}
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
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 28 }}
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
  const dateRange =
    itinerary.start_date && itinerary.end_date
      ? `${new Date(itinerary.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} — ${new Date(
          itinerary.end_date
        ).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
      : null;

  return (
    <motion.div variants={fadeUp} whileHover={{ y: -4 }} style={{ height: "100%" }}>
      <Link href={`/packages/${itinerary.id}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
        <div
          className="package-card"
          style={{
            background: "#FFFFFF",
            borderRadius: 22,
            border: "1px solid rgba(10,35,32,0.08)",
            boxShadow: "0 20px 40px -28px rgba(10,35,32,0.35)",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: 16,
          }}
        >
          {/* Inset photo, framed by card padding */}
          <div style={{ position: "relative", height: 230, borderRadius: 16, overflow: "hidden" }}>
            <Image
              src={itinerary.image_url || fallback}
              alt={itinerary.title}
              fill
              className="object-cover package-card-img"
              sizes="(max-width: 768px) 100vw, 360px"
            />
            {itinerary.item_count > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#F9F8F5",
                  background: "rgba(10,35,32,0.65)",
                  backdropFilter: "blur(8px)",
                  padding: "6px 12px",
                  borderRadius: 100,
                }}
              >
                {itinerary.item_count} item{itinerary.item_count !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div style={{ padding: "20px 8px 6px", display: "flex", flexDirection: "column", flex: 1 }}>
            {itinerary.agency_name && (
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10.5,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#006B70",
                  marginBottom: 8,
                }}
              >
                {itinerary.agency_name}
              </div>
            )}

            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 600,
                fontSize: 21,
                color: "#0A2320",
                lineHeight: 1.3,
                marginBottom: 8,
              }}
              className="line-clamp-2"
            >
              {itinerary.title}
            </h3>

            {itinerary.description && (
              <p style={{ color: "rgba(10,35,32,0.55)", fontSize: 13.5, lineHeight: 1.5, marginBottom: 16 }} className="line-clamp-2">
                {itinerary.description}
              </p>
            )}

            {dateRange && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12.5,
                  color: "rgba(10,35,32,0.55)",
                  marginBottom: 16,
                  marginTop: "auto",
                }}
              >
                <Calendar style={{ width: 14, height: 14 }} /> {dateRange}
              </div>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                paddingTop: 16,
                borderTop: "1px solid rgba(10,35,32,0.08)",
                marginTop: dateRange ? 0 : "auto",
              }}
            >
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: "#0A2320", fontWeight: 700 }}>
                {(Number(itinerary.total_price) || 0).toLocaleString("en-US").replace(/,/g, " ")}{" "}
                <span style={{ fontSize: 10, color: "rgba(10,35,32,0.4)", fontWeight: 600 }}>{itinerary.currency}</span>
              </span>
              <span style={{ color: "#006B70", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                View Details <ArrowRight style={{ width: 14, height: 14 }} />
              </span>
            </div>
          </div>
        </div>
      </Link>

      <style>{`
        .package-card-img { transition: transform 0.7s ease-out; }
        .package-card:hover .package-card-img { transform: scale(1.05); }
      `}</style>
    </motion.div>
  );
}
