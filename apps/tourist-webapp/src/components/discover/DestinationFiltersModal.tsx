"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import type { Destination } from "@repo/database";

export interface AppliedDestinationFilters {
  regions: string[];
  featuredOnly: boolean;
  serviceCount: { min: number; max: number };
  serviceCountActive: boolean;
}

interface DestinationFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: AppliedDestinationFilters) => void;
  destinations: Destination[];
}

const HISTOGRAM_BUCKETS = 24;

export function DestinationFiltersModal({ isOpen, onClose, onApply, destinations }: DestinationFiltersModalProps) {
  // Regions and the "things to do" range are derived from the real destinations passed in.
  const regions = useMemo(
    () => Array.from(new Set(destinations.map((d) => d.region).filter((r): r is string => !!r))).sort(),
    [destinations]
  );
  const counts = useMemo(() => destinations.map((d) => d.service_count ?? 0), [destinations]);
  const minCount = counts.length ? Math.min(...counts) : 0;
  const maxCount = counts.length ? Math.max(...counts) : 0;

  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [countMin, setCountMin] = useState(minCount);
  const [countMax, setCountMax] = useState(maxCount);

  useEffect(() => {
    if (isOpen) {
      setCountMin(minCount);
      setCountMax(maxCount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const histogram = useMemo(() => {
    const span = Math.max(maxCount - minCount, 1);
    const buckets = new Array(HISTOGRAM_BUCKETS).fill(0);
    for (const c of counts) {
      const idx = Math.min(HISTOGRAM_BUCKETS - 1, Math.floor(((c - minCount) / span) * HISTOGRAM_BUCKETS));
      buckets[idx]++;
    }
    const tallest = Math.max(...buckets, 1);
    return buckets.map((count) => ({ count, height: 8 + (count / tallest) * 52 }));
  }, [counts, minCount, maxCount]);

  const toggleRegion = (name: string) => {
    setSelectedRegions((prev) => (prev.includes(name) ? prev.filter((r) => r !== name) : [...prev, name]));
  };

  const serviceCountActive = countMin > minCount || countMax < maxCount;

  const matchCount = useMemo(() => {
    return destinations.filter((d) => {
      if (selectedRegions.length > 0 && (!d.region || !selectedRegions.includes(d.region))) return false;
      if (featuredOnly && !d.is_featured) return false;
      const c = d.service_count ?? 0;
      if (c < countMin || c > countMax) return false;
      return true;
    }).length;
  }, [destinations, selectedRegions, featuredOnly, countMin, countMax]);

  const handleClearAll = () => {
    setSelectedRegions([]);
    setFeaturedOnly(false);
    setCountMin(minCount);
    setCountMax(maxCount);
  };

  const handleApply = () => {
    onApply({
      regions: selectedRegions,
      featuredOnly,
      serviceCount: { min: countMin, max: countMax },
      serviceCountActive,
    });
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

            {/* Regions -- real regions from the destinations table */}
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#0A2320" }}>Region</h3>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button onClick={() => setSelectedRegions([])} style={chipStyle(selectedRegions.length === 0)}>
                  {selectedRegions.length === 0 && <Check size={14} color="#C1592A" />}
                  All
                </button>
                {regions.map((name) => (
                  <button key={name} onClick={() => toggleRegion(name)} style={chipStyle(selectedRegions.includes(name))}>
                    {name}
                  </button>
                ))}
                {regions.length === 0 && (
                  <span style={{ fontSize: 14, color: "rgba(10,35,32,0.4)" }}>No regions yet.</span>
                )}
              </div>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #EFEDE7" }} />

            {/* Things To Do -- real distribution of service_count across published destinations */}
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#0A2320" }}>Things To Do</h3>

              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 32 }}>
                <input
                  type="checkbox"
                  checked={featuredOnly}
                  onChange={(e) => setFeaturedOnly(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: "#006B70" }}
                />
                <span style={{ fontSize: 14, color: "#0A2320" }}>Featured destinations only</span>
              </label>

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
                  <div style={{ fontSize: 13, color: "rgba(10,35,32,0.6)", marginBottom: 8 }}>Min activities</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #EFEDE7", borderRadius: 12, padding: "10px 0" }}>
                    <input
                      type="number"
                      value={countMin}
                      min={minCount}
                      max={countMax}
                      onChange={(e) => setCountMin(Math.min(Number(e.target.value), countMax))}
                      style={{ width: 90, border: "none", outline: "none", fontSize: 14, fontWeight: 600, color: "#0A2320", textAlign: "center" }}
                    />
                  </div>
                </div>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 13, color: "rgba(10,35,32,0.6)", marginBottom: 8 }}>Max activities</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #EFEDE7", borderRadius: 12, padding: "10px 0" }}>
                    <input
                      type="number"
                      value={countMax}
                      min={countMin}
                      max={maxCount}
                      onChange={(e) => setCountMax(Math.max(Number(e.target.value), countMin))}
                      style={{ width: 90, border: "none", outline: "none", fontSize: 14, fontWeight: 600, color: "#0A2320", textAlign: "center" }}
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
