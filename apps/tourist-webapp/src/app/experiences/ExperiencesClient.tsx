"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, MapPin, Check, ChevronDown, SlidersHorizontal } from "lucide-react";
import type { Service } from "@repo/database";
import { Footer } from "@/components/landing/Footer";

import { FiltersModal } from "@/components/experiences/FiltersModal";

interface ExperiencesClientProps {
  experiences: Service[];
}

const MOCK_EXPERIENCES: Partial<Service>[] = [
  {
    id: "mock-1",
    title: "Hiking Bani Quraydha Volcano Guided Experience",
    city: "Medina",
    category: "Experience",
    price: 350,
    currency: "UZS",
    image_url: "https://images.unsplash.com/photo-1541845157-a6d2d100c931?q=80&w=800",
  },
  {
    id: "mock-2",
    title: "Camel Farm and Desert Dinner Storytelling",
    city: "Riyadh",
    category: "Attraction",
    price: 600,
    currency: "UZS",
    image_url: "https://images.unsplash.com/photo-1548232979-6c557ee14752?q=80&w=800",
  },
  {
    id: "mock-3",
    title: "15-Day Ultimate Local Experience",
    city: "Jeddah",
    category: "Event",
    price: 5283,
    currency: "UZS",
    image_url: "https://images.unsplash.com/photo-1582558661609-02685764e565?q=80&w=800",
  },
  {
    id: "mock-4",
    title: "4-Day Tour: City & Coast Inclusive",
    city: "Jeddah",
    category: "Experience",
    price: 5434,
    currency: "UZS",
    image_url: "https://images.unsplash.com/photo-1582201942988-13e60cb6733f?q=80&w=800",
  },
  {
    id: "mock-5",
    title: "Traditional Samarkand Bread Making Class",
    city: "Samarkand",
    category: "Attraction",
    price: 150,
    currency: "UZS",
    image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800",
  },
];

export function ExperiencesClient({ experiences }: ExperiencesClientProps) {
  // Combine real database data with mock data so that category filters are never empty for testing
  const displayExperiences = [...experiences, ...(MOCK_EXPERIENCES as Service[])];

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<any>(null);

  const filters = ["All", "Destinations", "Attraction", "Experience", "Event", "Categories"];

  // Fast client-side filtering without lag
  const filteredExperiences = React.useMemo(() => {
    return displayExperiences.filter((exp) => {
      // 1. Search Query Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = exp.title.toLowerCase().includes(query);
        const matchesCity = exp.city?.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesCity) return false;
      }

      // 2. Category Filter (Simple Top Chips)
      if (activeFilter === "Destinations" && selectedDestination) {
        if (exp.city !== selectedDestination) return false;
      } else if (activeFilter !== "All" && activeFilter !== "Destinations" && activeFilter !== "Categories") {
        if (exp.category?.toLowerCase() !== activeFilter.toLowerCase()) {
          return false;
        }
      }

      // 3. Advanced Modal Filters
      if (advancedFilters) {
        if (advancedFilters.type !== "All" && exp.category?.toLowerCase() !== advancedFilters.type.toLowerCase()) {
          return false;
        }
        if (advancedFilters.destinations.length > 0 && (!exp.city || !advancedFilters.destinations.includes(exp.city))) {
          return false;
        }
        if (advancedFilters.categories.length > 0 && (!exp.category || !advancedFilters.categories.includes(exp.category))) {
          return false;
        }
      }

      return true;
    });
  }, [displayExperiences, searchQuery, activeFilter, selectedDestination, advancedFilters]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F9F8F5",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "120px 56px 96px" }}>
        
        {/* Page Title */}
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 64,
            fontWeight: 700,
            color: "#111111",
            margin: "0 0 40px 0",
            letterSpacing: "-0.02em",
          }}
        >
          Things to do
        </h1>

        {/* Filter Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 48 }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {/* Search Input */}
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                color="#888"
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
                  border: "1px solid transparent", // matching screenshot's flat look
                  background: "#FFFFFF",
                  fontSize: 14,
                  fontFamily: "'Inter', sans-serif",
                  width: 240,
                  outline: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                }}
              />
            </div>

            {/* Filters Button (Purple) */}
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
                background: "#82165b", // matching the purple in the screenshot
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <SlidersHorizontal size={16} /> Filters
              <div
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  background: "#e3007b", // bright pink badge
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
                1
              </div>
            </button>

            {/* Filter Chips */}
            {filters.map((filter) => {
              const hasDropdown = filter === "Destinations" || filter === "Categories";
              const isActive = activeFilter === filter;
              const isDropdownOpen = activeDropdown === filter;
              
              // Example dropdown options
              const dropdownOptions = 
                filter === "Destinations" ? ["All Destinations", "Tashkent", "Samarkand", "Bukhara", "Khiva", "Riyadh", "Medina", "Jeddah"] :
                filter === "Categories" ? ["All Categories", "Tour", "Workshop", "Culinary"] : [];

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
                      border: (isActive || isDropdownOpen) ? "1px solid #111" : "1px solid #EAEAEA",
                      background: "#FFFFFF",
                      color: (isActive || isDropdownOpen) ? "#111" : "#555",
                      fontSize: 14,
                      fontWeight: (isActive || isDropdownOpen) ? 600 : 500,
                      cursor: "pointer",
                      fontFamily: "'Inter', sans-serif",
                      transition: "all 0.2s",
                    }}
                  >
                    {isActive && !hasDropdown && filter === "All" && <Check size={14} />}
                    {filter === "Destinations" && selectedDestination ? selectedDestination : filter}
                    {hasDropdown && (
                      <ChevronDown 
                        size={14} 
                        color={(isActive || isDropdownOpen) ? "#111" : "#888"} 
                        style={{ transform: isDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                      />
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && hasDropdown && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        left: 0,
                        background: "#FFFFFF",
                        border: "1px solid #EAEAEA",
                        borderRadius: 12,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                        minWidth: 200,
                        zIndex: 50,
                        display: "flex",
                        flexDirection: "column",
                        padding: 8,
                      }}
                    >
                      {dropdownOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            if (filter === "Destinations") {
                              setSelectedDestination(option.startsWith("All") ? null : option);
                              setActiveFilter("Destinations");
                            }
                            setActiveDropdown(null);
                          }}
                          style={{
                            padding: "10px 16px",
                            textAlign: "left",
                            background: "transparent",
                            border: "none",
                            fontSize: 14,
                            fontWeight: 500,
                            color: "#333",
                            cursor: "pointer",
                            borderRadius: 8,
                            fontFamily: "'Inter', sans-serif",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#F5F5F5")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          {option}
                        </button>
                      ))}
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
              border: "1px solid #EAEAEA",
              background: "#FFFFFF",
              color: "#111",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
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
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, cursor: "pointer" }}>
                    
                    {/* Thumbnail */}
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "1/1",
                        borderRadius: 20,
                        overflow: "hidden",
                        backgroundColor: "#EAEAEA"
                      }}
                    >
                      <Image
                        src={exp.image_url || "https://images.unsplash.com/photo-1541845157-a6d2d100c931?q=80&w=800"}
                        alt={exp.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1440px) 25vw, 300px"
                      />
                    </div>

                    {/* Meta */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "0 4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#555", fontSize: 13, fontWeight: 500 }}>
                        <MapPin size={14} />
                        {exp.city || "Tashkent"}
                      </div>
                      
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#111", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {exp.title}
                      </div>
                      
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#111", marginTop: 4 }}>
                        From <span style={{ fontWeight: 700, color: "#82165b" }}>{exp.currency === "UZS" ? "UZS " : "$"} {exp.price?.toLocaleString() || "350,000"}</span>
                      </div>
                    </div>

                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div style={{ gridColumn: "1 / -1", padding: 64, textAlign: "center", color: "#888" }}>
              No experiences found.
            </div>
          )}
        </div>
      </div>
      
      <Footer />

      <FiltersModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={(filters) => {
          setAdvancedFilters(filters);
          // Optional: sync top chips with modal
        }}
      />
    </main>
  );
}
