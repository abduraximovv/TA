"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import type { ItineraryWithMeta } from "@repo/database";

export interface AppliedPackageFilters {
  agencies: string[];
  budget: { min: number; max: number };
  budgetActive: boolean;
}

interface PackageFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: AppliedPackageFilters) => void;
  itineraries: ItineraryWithMeta[];
}

const HISTOGRAM_BUCKETS = 24;

export function PackageFiltersModal({ isOpen, onClose, onApply, itineraries }: PackageFiltersModalProps) {
  // Agencies and budget bounds are derived from the real itineraries passed in -- nothing hardcoded.
  const agencies = useMemo(
    () => Array.from(new Set(itineraries.map((i) => i.agency_name).filter((a): a is string => !!a))).sort(),
    [itineraries]
  );
  const prices = useMemo(() => itineraries.map((i) => Number(i.total_price) || 0), [itineraries]);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]);
  const [budgetMin, setBudgetMin] = useState(minPrice);
  const [budgetMax, setBudgetMax] = useState(maxPrice);

  useEffect(() => {
    if (isOpen) {
      setBudgetMin(minPrice);
      setBudgetMax(maxPrice);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const histogram = useMemo(() => {
    const span = Math.max(maxPrice - minPrice, 1);
    const buckets = new Array(HISTOGRAM_BUCKETS).fill(0);
    for (const p of prices) {
      const idx = Math.min(HISTOGRAM_BUCKETS - 1, Math.floor(((p - minPrice) / span) * HISTOGRAM_BUCKETS));
      buckets[idx]++;
    }
    const tallest = Math.max(...buckets, 1);
    return buckets.map((count) => ({ count, height: 8 + (count / tallest) * 52 }));
  }, [prices, minPrice, maxPrice]);

  const toggleAgency = (name: string) => {
    setSelectedAgencies((prev) => (prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]));
  };

  const budgetActive = budgetMin > minPrice || budgetMax < maxPrice;

  const matchCount = useMemo(() => {
    return itineraries.filter((itin) => {
      if (selectedAgencies.length > 0 && (!itin.agency_name || !selectedAgencies.includes(itin.agency_name))) return false;
      const price = Number(itin.total_price) || 0;
      if (price < budgetMin || price > budgetMax) return false;
      return true;
    }).length;
  }, [itineraries, selectedAgencies, budgetMin, budgetMax]);

  const handleClearAll = () => {
    setSelectedAgencies([]);
    setBudgetMin(minPrice);
    setBudgetMax(maxPrice);
  };

  const handleApply = () => {
    onApply({ agencies: selectedAgencies, budget: { min: budgetMin, max: budgetMax }, budgetActive });
    onClose();
  };

  if (!isOpen) return null;

  const chipStyle = (active: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 20px",
    borderRadius: 12,
    border: active ? "1.5px solid #0A2320" : "1px solid #EFEDE7",
    background: "#FFFFFF",
    color: "#0A2320",
    fontSize: 14,
    fontWeight: active ? 600 : 500,
    cursor: "pointer",
    transition: "all 0.2s",
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          style={{
            background: "#FFFFFF",
            borderRadius: 24,
            width: "100%",
            maxWidth: 720,
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 24px 48px rgba(0,0,0,0.1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 32px", borderBottom: "1px solid #EFEDE7" }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, fontFamily: "'Inter', sans-serif", color: "#0A2320" }}>Filters</h2>
            <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
              <X size={24} color="#0A2320" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "32px", display: "flex", flexDirection: "column", gap: 48, fontFamily: "'Inter', sans-serif" }}>

            {/* Agencies -- real verified agencies from the database */}
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#0A2320" }}>Agency</h3>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button onClick={() => setSelectedAgencies([])} style={chipStyle(selectedAgencies.length === 0)}>
                  {selectedAgencies.length === 0 && <Check size={14} color="#C1592A" />}
                  All
                </button>
                {agencies.map((name) => (
                  <button key={name} onClick={() => toggleAgency(name)} style={chipStyle(selectedAgencies.includes(name))}>
                    {name}
                  </button>
                ))}
                {agencies.length === 0 && (
                  <span style={{ fontSize: 14, color: "rgba(10,35,32,0.4)" }}>No agencies yet.</span>
                )}
              </div>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #EFEDE7" }} />

            {/* Budget -- real min/max total_price across published packages */}
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#0A2320" }}>Budget</h3>

              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 60 }}>
                  {histogram.map((bucket, i) => (
                    <div
                      key={i}
                      style={{ flex: 1, background: "#006B70", opacity: bucket.count > 0 ? 0.8 : 0.15, height: `${bucket.height}px`, borderRadius: "4px 4px 0 0" }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", gap: 24 }}>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 13, color: "rgba(10,35,32,0.6)", marginBottom: 8 }}>Minimum</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, border: "1px solid #EFEDE7", borderRadius: 12, padding: "10px 0" }}>
                    <span style={{ fontSize: 13, color: "rgba(10,35,32,0.5)" }}>UZS</span>
                    <input
                      type="number"
                      value={budgetMin}
                      min={minPrice}
                      max={budgetMax}
                      onChange={(e) => setBudgetMin(Math.min(Number(e.target.value), budgetMax))}
                      style={{ width: 100, border: "none", outline: "none", fontSize: 14, fontWeight: 600, color: "#0A2320", textAlign: "center" }}
                    />
                  </div>
                </div>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 13, color: "rgba(10,35,32,0.6)", marginBottom: 8 }}>Maximum</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, border: "1px solid #EFEDE7", borderRadius: 12, padding: "10px 0" }}>
                    <span style={{ fontSize: 13, color: "rgba(10,35,32,0.5)" }}>UZS</span>
                    <input
                      type="number"
                      value={budgetMax}
                      min={budgetMin}
                      max={maxPrice}
                      onChange={(e) => setBudgetMax(Math.max(Number(e.target.value), budgetMin))}
                      style={{ width: 100, border: "none", outline: "none", fontSize: 14, fontWeight: 600, color: "#0A2320", textAlign: "center" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Bar */}
          <div style={{ padding: "20px 32px", borderTop: "1px solid #EFEDE7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              onClick={handleClearAll}
              style={{ background: "transparent", border: "none", color: "#006B70", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
            >
              Clear All
            </button>
            <button
              onClick={handleApply}
              style={{ background: "#006B70", border: "none", color: "#FFF", padding: "14px 24px", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              Show {matchCount} Result{matchCount === 1 ? "" : "s"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
