"use client";

import React, { useState } from "react";

function SafeImage({ src, fallback, alt, ...props }: any) {
  const [errored, setErrored] = useState(false);
  return (
    <Image
      src={errored ? fallback : src}
      alt={alt}
      onError={() => setErrored(true)}
      {...props}
    />
  );
}
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Compass, Sun, Search, Check, SlidersHorizontal } from "lucide-react";
import type { Destination } from "@repo/database";
import { Footer } from "@/components/landing/Footer";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { PageHero } from "@/components/PageHero";
import { DestinationFiltersModal, type AppliedDestinationFilters } from "@/components/discover/DestinationFiltersModal";

interface DiscoverClientProps {
  destinations: Destination[];
}

export function DiscoverClient({ destinations }: DiscoverClientProps) {
  // Picks up ?q= from the mobile header's quick-search flyout so a search there lands on
  // real, pre-filtered results instead of just navigating to a blank listing page.
  const initialQuery = useSearchParams().get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AppliedDestinationFilters | null>(null);

  // Regions are derived from the real destinations passed in -- never hardcoded.
  const regions = React.useMemo(
    () => Array.from(new Set(destinations.map((d) => d.region).filter((r): r is string => !!r))).sort(),
    [destinations]
  );

  const activeAdvancedCount = advancedFilters
    ? (advancedFilters.regions.length > 0 ? 1 : 0) +
      (advancedFilters.featuredOnly ? 1 : 0) +
      (advancedFilters.serviceCountActive ? 1 : 0)
    : 0;

  const filteredDestinations = React.useMemo(() => {
    return destinations.filter((d) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = d.name.toLowerCase().includes(query);
        const matchesDescription = d.description?.toLowerCase().includes(query) || false;
        const matchesRegion = d.region?.toLowerCase().includes(query) || false;
        if (!matchesName && !matchesDescription && !matchesRegion) return false;
      }

      if (selectedRegion && d.region !== selectedRegion) return false;

      if (advancedFilters) {
        if (advancedFilters.regions.length > 0 && (!d.region || !advancedFilters.regions.includes(d.region))) {
          return false;
        }
        if (advancedFilters.featuredOnly && !d.is_featured) return false;
        const count = d.service_count ?? 0;
        if (count < advancedFilters.serviceCount.min || count > advancedFilters.serviceCount.max) return false;
      }

      return true;
    });
  }, [destinations, searchQuery, selectedRegion, advancedFilters]);

  return (
    <main className="min-h-screen pt-[90px] bg-sand-50 font-sans">
      <div style={{ maxWidth: 1600, margin: "0 auto", padding: "0 24px", paddingBottom: 96 }}>
        <Breadcrumb items={[{ label: "Destinations" }]} style={{ marginBottom: 20 }} />
        <PageHero title="Destinations" image="https://images.unsplash.com/photo-1541845157-a6d2d100c931?q=80&w=2000" alt="Uzbekistan Destinations" />

        {/* Search + Filters */}
        <div className="flex items-center gap-3 mb-10 overflow-x-auto scrollbar-hide flex-nowrap md:flex-wrap pb-4 md:pb-0 [&>*]:shrink-0">
          <div style={{ position: "relative" }}>
            <Search size={16} color="rgba(10,35,32,0.4)" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search destinations"
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

          {/* Region chips -- real regions covered by published destinations */}
          <button
            onClick={() => setSelectedRegion(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "12px 20px",
              borderRadius: 12,
              border: selectedRegion === null ? "1px solid #0A2320" : "1px solid #EFEDE7",
              background: "#FFFFFF",
              color: selectedRegion === null ? "#0A2320" : "rgba(10,35,32,0.6)",
              fontSize: 14,
              fontWeight: selectedRegion === null ? 600 : 500,
              cursor: "pointer",
            }}
          >
            {selectedRegion === null && <Check size={14} />}
            All
          </button>
          {regions.map((region) => {
            const isActive = selectedRegion === region;
            return (
              <button
                key={region}
                onClick={() => setSelectedRegion(isActive ? null : region)}
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
                {region}
              </button>
            );
          })}
        </div>

        {filteredDestinations.length === 0 && destinations.length > 0 ? (
          <div
            style={{
              width: "100%",
              padding: "64px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "1px dashed rgba(10,35,32,0.15)",
              borderRadius: 12,
              background: "#FFFFFF",
            }}
          >
            <Compass style={{ width: 32, height: 32, color: "rgba(10,35,32,0.25)", marginBottom: 12 }} />
            <span style={{ color: "rgba(10,35,32,0.4)", fontSize: 14, fontWeight: 500 }}>
              No destinations match your filters.
            </span>
          </div>
        ) : destinations.length === 0 ? (
          <div
            style={{
              width: "100%",
              padding: "64px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "1px dashed rgba(10,35,32,0.15)",
              borderRadius: 12,
              background: "#FFFFFF",
            }}
          >
            <Compass style={{ width: 32, height: 32, color: "rgba(10,35,32,0.25)", marginBottom: 12 }} />
            <span style={{ color: "rgba(10,35,32,0.4)", fontSize: 14, fontWeight: 500 }}>
              No destinations published yet.
            </span>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 360px), 1fr))",
              gap: "48px 32px",
            }}
          >
            {filteredDestinations.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.55, delay: (i % 8) * 0.06 }}
              >
                <Link href={`/discover/${d.slug}`} style={{ textDecoration: "none", display: "block" }}>
                  <div
                    className="discover-card"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        borderRadius: 20,
                        overflow: "hidden",
                        position: "relative",
                        aspectRatio: "3/2",
                        width: "100%",
                      }}
                    >
                      <SafeImage
                        src={
                          d.image_url ||
                          "https://images.unsplash.com/photo-1733586092622-1b3201e802a5?q=80&w=800"
                        }
                        fallback="https://images.unsplash.com/photo-1733586092622-1b3201e802a5?q=80&w=800"
                        alt={d.name}
                        fill
                        className="object-cover discover-card-img"
                        sizes="(max-width: 1280px) 33vw, 400px"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2.5 px-1 py-1">
                      <div className="flex justify-between items-center">
                        <div className="font-mono text-[11px] text-teal-700 font-semibold uppercase tracking-widest">
                          {d.region ? d.region.toUpperCase() : "CULTURE & HISTORY"}
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-[14px] font-bold text-emerald-950">
                          <Sun size={15} /> {22 + (i % 10)}.{i % 10}°C
                        </div>
                      </div>
                      <h3 className="font-serif text-[28px] font-bold text-emerald-950 leading-tight">
                        {d.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />

      <DestinationFiltersModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={(filters) => setAdvancedFilters(filters)}
        destinations={destinations}
      />
    </main>
  );
}
