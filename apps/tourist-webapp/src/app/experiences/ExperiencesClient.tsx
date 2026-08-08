"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Check, ChevronDown, SlidersHorizontal } from "lucide-react";
import type { Service } from "@repo/database";
import { Footer } from "@/components/landing/Footer";

import { FiltersModal, type AppliedFilters } from "@/components/experiences/FiltersModal";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { PageHero } from "@/components/PageHero";

interface ExperiencesClientProps {
  experiences: Service[];
}

function capitalize(s: string) {
  return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export function ExperiencesClient({ experiences }: ExperiencesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AppliedFilters | null>(null);

  // Real cities/categories from the services table -- the quick-filter chips are never hardcoded.
  const destinations = React.useMemo(
    () => Array.from(new Set(experiences.map((e) => e.city).filter((c): c is string => !!c))).sort(),
    [experiences]
  );
  const categories = React.useMemo(
    () => Array.from(new Set(experiences.map((e) => e.category).filter((c): c is string => !!c))).sort(),
    [experiences]
  );
  const filters = ["All", "Destinations", ...categories];

  const activeAdvancedCount = advancedFilters
    ? (advancedFilters.destinations.length > 0 ? 1 : 0) +
      (advancedFilters.categories.length > 0 ? 1 : 0) +
      (advancedFilters.showFreeEntryOnly ? 1 : 0) +
      (advancedFilters.budgetActive ? 1 : 0)
    : 0;

  // Fast client-side filtering, entirely against the real experiences passed in from the database.
  const filteredExperiences = React.useMemo(() => {
    return experiences.filter((exp) => {
      // 1. Search Query Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = exp.title.toLowerCase().includes(query);
        const matchesCity = exp.city?.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesCity) return false;
      }

      // 2. Quick Filter Chips (destination or category, both sourced from real data)
      if (activeFilter === "Destinations") {
        if (selectedDestination && exp.city !== selectedDestination) return false;
      } else if (activeFilter !== "All") {
        if (exp.category !== activeFilter) return false;
      }

      // 3. Advanced Modal Filters
      if (advancedFilters) {
        if (advancedFilters.destinations.length > 0 && (!exp.city || !advancedFilters.destinations.includes(exp.city))) {
          return false;
        }
        if (advancedFilters.categories.length > 0 && !advancedFilters.categories.includes(exp.category)) {
          return false;
        }
        if (advancedFilters.showFreeEntryOnly && exp.price > 0) {
          return false;
        }
        if (exp.price < advancedFilters.budget.min || exp.price > advancedFilters.budget.max) {
          return false;
        }
      }

      return true;
    });
  }, [experiences, searchQuery, activeFilter, selectedDestination, advancedFilters]);

  return (
    <main className="min-h-screen bg-sand-50 font-sans">
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "120px 24px 96px" }}>
        <Breadcrumb items={[{ label: "Experiences" }]} style={{ marginBottom: 20 }} />

        <PageHero
          title="Things To Do"
          eyebrow="Browse by Interest"
          image="https://images.unsplash.com/photo-1757005550139-e05b63ec88d9?q=80&w=2000"
          alt="Things to do in Uzbekistan"
          style={{ marginBottom: 40 }}
        />

        {/* Search + Filters */}
        <div className="flex flex-col mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search size={20} color="rgba(10,35,32,0.4)" className="absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search experiences"
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

          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2 [&>*]:shrink-0 w-full max-w-full">

            {/* Filter Chips -- "All", a "Destinations" dropdown, then one chip per real category */}
            {filters.map((filter) => {
              const hasDropdown = filter === "Destinations";
              const isActive = activeFilter === filter;
              const isDropdownOpen = activeDropdown === filter;
              const label = filter === "All" || filter === "Destinations" ? filter : capitalize(filter);

              return (
                <div key={filter} style={{ position: "relative" }}>
                  <button
                    onClick={() => {
                      if (hasDropdown) {
                        setActiveDropdown(isDropdownOpen ? null : filter);
                        // We do not immediately set it as activeFilter until an option is picked
                      } else {
                        setActiveFilter(filter);
                        setActiveDropdown(null);
                        if (filter === "All") {
                          setSelectedDestination(null);
                        }
                      }
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "12px 20px",
                      borderRadius: 12,
                      border: (isActive || isDropdownOpen) ? "1px solid #0A2320" : "1px solid #EFEDE7",
                      background: "#FFFFFF",
                      color: (isActive || isDropdownOpen) ? "#0A2320" : "rgba(10,35,32,0.6)",
                      fontSize: 14,
                      fontWeight: (isActive || isDropdownOpen) ? 600 : 500,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {isActive && !hasDropdown && filter === "All" && <Check size={14} />}
                    {filter === "Destinations" && selectedDestination ? selectedDestination : label}
                    {hasDropdown && (
                      <ChevronDown
                        size={14}
                        color={(isActive || isDropdownOpen) ? "#0A2320" : "rgba(10,35,32,0.4)"}
                        style={{ transform: isDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                      />
                    )}
                  </button>

                  {/* Dropdown Menu -- real cities from the services table */}
                  {isDropdownOpen && hasDropdown && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        left: 0,
                        background: "#FFFFFF",
                        border: "1px solid #EFEDE7",
                        borderRadius: 12,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                        minWidth: 200,
                        zIndex: 50,
                        display: "flex",
                        flexDirection: "column",
                        padding: 8,
                      }}
                    >
                      <button
                        onClick={() => {
                          setSelectedDestination(null);
                          setActiveFilter("Destinations");
                          setActiveDropdown(null);
                        }}
                        style={{
                          padding: "10px 16px",
                          textAlign: "left",
                          background: "transparent",
                          border: "none",
                          fontSize: 14,
                          fontWeight: 500,
                          color: "#0A2320",
                          cursor: "pointer",
                          borderRadius: 8,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#EFEDE7")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        All Destinations
                      </button>
                      {destinations.map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSelectedDestination(option);
                            setActiveFilter("Destinations");
                            setActiveDropdown(null);
                          }}
                          style={{
                            padding: "10px 16px",
                            textAlign: "left",
                            background: "transparent",
                            border: "none",
                            fontSize: 14,
                            fontWeight: 500,
                            color: "#0A2320",
                            cursor: "pointer",
                            borderRadius: 8,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#EFEDE7")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          {option}
                        </button>
                      ))}
                      {destinations.length === 0 && (
                        <span style={{ padding: "10px 16px", fontSize: 13, color: "rgba(10,35,32,0.4)" }}>No destinations yet.</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Sort Dropdown */}
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                borderRadius: 12,
                border: "1px solid #EFEDE7",
                background: "#FFFFFF",
                color: "#0A2320",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                flexShrink: 0
              }}
            >
              Default
            </button>
          </div>
        </div>

        {/* Experiences Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "16px",
          }}
        >
          {filteredExperiences.length > 0 ? (
            filteredExperiences.map((exp, i) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (i % 8) * 0.05 }}
              >
                <Link href={`/service/${exp.id}`} style={{ textDecoration: "none" }}>
                  <div
                    className="experience-card"
                    style={{
                      position: "relative",
                      borderRadius: 20,
                      overflow: "hidden",
                      aspectRatio: "3/4",
                      cursor: "pointer",
                    }}
                  >
                    <Image
                      src={exp.image_url || "https://images.unsplash.com/photo-1541845157-a6d2d100c931?q=80&w=800"}
                      alt={exp.title}
                      fill
                      className="object-cover experience-card-img transition-transform duration-700 hover:scale-105"
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
                      {exp.price?.toLocaleString() || "350,000"} <span className="text-[9px] text-white/60">{exp.currency === "UZS" ? "UZS" : "$"}</span>
                    </div>
                    {/* Text overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-serif text-[16px] md:text-[20px] font-bold text-white leading-tight mb-1 line-clamp-2">
                        {exp.title}
                      </h3>
                      <div className="font-mono text-[10px] text-white/60 uppercase tracking-widest">
                        {exp.city || "Tashkent"}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div style={{ gridColumn: "1 / -1", padding: 64, textAlign: "center", color: "rgba(10,35,32,0.4)" }}>
              No experiences found.
            </div>
          )}
        </div>
      </div>

      <Footer />

      <FiltersModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={(filters) => setAdvancedFilters(filters)}
        experiences={experiences}
      />
    </main>
  );
}
