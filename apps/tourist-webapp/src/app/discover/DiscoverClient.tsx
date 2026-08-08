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
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={20} color="rgba(10,35,32,0.4)" className="absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search destinations"
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

        {/* Region chips -- real regions covered by published destinations */}
        <div className="flex items-center gap-3 mb-10 overflow-x-auto scrollbar-hide pb-2 [&>*]:shrink-0">
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
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: "16px",
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
                      position: "relative",
                      borderRadius: 20,
                      overflow: "hidden",
                      aspectRatio: "3/4",
                      cursor: "pointer",
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
                      className="object-cover discover-card-img transition-transform duration-700 hover:scale-105"
                      sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />
                    {/* Dark gradient overlay at bottom */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to top, rgba(10,35,32,0.85) 0%, rgba(10,35,32,0.3) 40%, transparent 60%)",
                      }}
                    />
                    {/* Service count badge */}
                    {(d.service_count ?? 0) > 0 && (
                      <div
                        className="absolute top-3 right-3 bg-[#0A2320]/70 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      >
                        {d.service_count} items
                      </div>
                    )}
                    {/* Text overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-serif text-[18px] md:text-[22px] font-bold text-white leading-tight mb-1">
                        {d.name}
                      </h3>
                      <div className="font-mono text-[10px] text-white/60 uppercase tracking-widest">
                        {d.region || "Uzbekistan"}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <DestinationFiltersModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={(filters) => setAdvancedFilters(filters)}
        destinations={destinations}
      />
    </main>
  );
}
