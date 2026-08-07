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

        {/* Filter Bar */}
        <div className="flex items-center justify-between mb-12 flex-nowrap md:flex-wrap gap-4">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide flex-nowrap md:flex-wrap pb-4 md:pb-0 [&>*]:shrink-0 flex-1 w-full max-w-full">
            {/* Search Input */}
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                color="rgba(10,35,32,0.4)"
                style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                placeholder="Search"
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
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                }}
              />
            </div>

            {/* Filters Button */}
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
          </div>

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
            }}
          >
            Default
          </button>
        </div>

        {/* Experiences Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "40px 24px",
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
                  <div className="experience-card" style={{ display: "flex", flexDirection: "column", gap: 16, cursor: "pointer" }}>

                    {/* Thumbnail */}
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "3/2",
                        borderRadius: 20,
                        overflow: "hidden",
                        backgroundColor: "#EFEDE7"
                      }}
                    >
                      <Image
                        src={exp.image_url || "https://images.unsplash.com/photo-1541845157-a6d2d100c931?q=80&w=800"}
                        alt={exp.title}
                        fill
                        className="object-cover experience-card-img transition-transform duration-700 hover:scale-105"
                        sizes="(max-width: 1440px) 33vw, 400px"
                      />
                    </div>

                    {/* Meta */}
                    <div className="flex flex-col gap-2.5 px-1 py-1">
                      <div className="flex justify-between items-center">
                        <div className="font-mono text-[11px] text-teal-700 font-semibold uppercase tracking-widest">
                          {exp.city?.toUpperCase() || "TASHKENT"}
                        </div>
                      </div>

                      <h3 className="font-serif text-[24px] font-bold text-emerald-950 leading-tight line-clamp-2">
                        {exp.title}
                      </h3>

                      <div className="font-mono text-[15px] font-bold text-emerald-950 flex items-baseline gap-1">
                        {exp.price?.toLocaleString() || "350,000"} <span className="text-[10px] text-gray-400 font-semibold">{exp.currency === "UZS" ? "UZS" : "$"}</span>
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
