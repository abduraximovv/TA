"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

const DESTINATIONS = [
  "Tashkent", "Samarkand", "Bukhara", "Khiva", "Nukus", 
  "Termez", "Fergana", "Andijan", "Namangan", "Navoi", 
  "Kashkadarya", "Syrdarya", "Jizzakh"
];

const CATEGORIES = [
  "Culture & History", "Food & Beverages", "Nature", 
  "Entertainment", "Accommodations", "Shopping", 
  "Adventure", "Sports", "Classes and Training"
];

const SEASONS = [
  "Silk Road Moments", "Samarkand Season", "Experience Tashkent Season"
];

// Simple Custom Histogram for Budgets
const HISTOGRAM_BARS = Array.from({ length: 30 }).map((_, i) => Math.pow(i, 1.2) + 10);

export function FiltersModal({ isOpen, onClose, onApply }: FiltersModalProps) {
  const [selectedType, setSelectedType] = useState("All");
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [showFreeEntryOnly, setShowFreeEntryOnly] = useState(false);
  const [budgetMin, setBudgetMin] = useState(0);
  const [budgetMax, setBudgetMax] = useState(46404);

  const toggleSelection = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleClearAll = () => {
    setSelectedType("All");
    setSelectedDestinations([]);
    setSelectedCategories([]);
    setSelectedSeasons([]);
    setShowFreeEntryOnly(false);
    setBudgetMin(0);
    setBudgetMax(46404);
  };

  const handleApply = () => {
    onApply({
      type: selectedType,
      destinations: selectedDestinations,
      categories: selectedCategories,
      seasons: selectedSeasons,
      showFreeEntryOnly,
      budget: { min: budgetMin, max: budgetMax }
    });
    onClose();
  };

  if (!isOpen) return null;

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
            maxWidth: 900,
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 24px 48px rgba(0,0,0,0.1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 32px", borderBottom: "1px solid #EAEAEA" }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>Filters</h2>
            <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
              <X size={24} color="#111" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "32px", display: "flex", flexDirection: "column", gap: 48, fontFamily: "'Inter', sans-serif" }}>
            
            {/* Type */}
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Type</h3>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {["All", "Attraction", "Experience", "Event"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "10px 20px",
                      borderRadius: 12,
                      border: selectedType === type ? "1.5px solid #111" : "1px solid #EAEAEA",
                      background: "#FFFFFF",
                      color: "#111",
                      fontSize: 14,
                      fontWeight: selectedType === type ? 600 : 500,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    {selectedType === type && type === "All" && <Check size={14} color="#e3007b" />}
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #EAEAEA" }} />

            {/* Destinations */}
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Destinations</h3>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  onClick={() => setSelectedDestinations([])}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 20px",
                    borderRadius: 12,
                    border: selectedDestinations.length === 0 ? "1.5px solid #111" : "1px solid #EAEAEA",
                    background: "#FFFFFF",
                    color: "#111",
                    fontSize: 14,
                    fontWeight: selectedDestinations.length === 0 ? 600 : 500,
                    cursor: "pointer"
                  }}
                >
                  {selectedDestinations.length === 0 && <Check size={14} color="#e3007b" />}
                  All
                </button>
                {DESTINATIONS.map((dest) => (
                  <button
                    key={dest}
                    onClick={() => toggleSelection(dest, selectedDestinations, setSelectedDestinations)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "10px 20px",
                      borderRadius: 12,
                      border: selectedDestinations.includes(dest) ? "1.5px solid #111" : "1px solid #EAEAEA",
                      background: "#FFFFFF",
                      color: "#111",
                      fontSize: 14,
                      fontWeight: selectedDestinations.includes(dest) ? 600 : 500,
                      cursor: "pointer"
                    }}
                  >
                    {dest}
                  </button>
                ))}
              </div>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #EAEAEA" }} />

            {/* Categories */}
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Categories</h3>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  onClick={() => setSelectedCategories([])}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 20px",
                    borderRadius: 12,
                    border: selectedCategories.length === 0 ? "1.5px solid #111" : "1px solid #EAEAEA",
                    background: "#FFFFFF",
                    color: "#111",
                    fontSize: 14,
                    fontWeight: selectedCategories.length === 0 ? 600 : 500,
                    cursor: "pointer"
                  }}
                >
                  {selectedCategories.length === 0 && <Check size={14} color="#e3007b" />}
                  All
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleSelection(cat, selectedCategories, setSelectedCategories)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "10px 20px",
                      borderRadius: 12,
                      border: selectedCategories.includes(cat) ? "1.5px solid #111" : "1px solid #EAEAEA",
                      background: "#FFFFFF",
                      color: "#111",
                      fontSize: 14,
                      fontWeight: selectedCategories.includes(cat) ? 600 : 500,
                      cursor: "pointer"
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #EAEAEA" }} />

            {/* Seasons */}
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Seasons</h3>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {SEASONS.map((season) => (
                  <button
                    key={season}
                    onClick={() => toggleSelection(season, selectedSeasons, setSelectedSeasons)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "12px 24px",
                      borderRadius: 12,
                      border: selectedSeasons.includes(season) ? "1.5px solid #111" : "1px solid transparent",
                      background: "#FFFFFF",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      color: "#111",
                      fontSize: 14,
                      fontWeight: selectedSeasons.includes(season) ? 600 : 500,
                      cursor: "pointer"
                    }}
                  >
                    {season}
                  </button>
                ))}
              </div>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #EAEAEA" }} />

            {/* Dates (Simplified Mock) */}
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Dates</h3>
              <div style={{ border: "1px solid #EAEAEA", borderRadius: 20, padding: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 40 }}>
                {/* Mock Calendar Left */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontWeight: 600 }}>
                    <span>&lt;</span>
                    <span>August 2026</span>
                    <span style={{opacity: 0}}>&gt;</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 12, textAlign: "center", fontSize: 14 }}>
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} style={{ color: "#888", marginBottom: 8 }}>{d}</div>)}
                    {/* Empty slots */}
                    <div /> <div /> <div /> <div /> <div />
                    {Array.from({length: 31}).map((_, i) => (
                      <div key={i} style={{ padding: "8px 0", cursor: "pointer", borderRadius: "50%", background: i === 15 ? "#82165b" : "transparent", color: i === 15 ? "#FFF" : "#111" }}>
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mock Calendar Right */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontWeight: 600 }}>
                    <span style={{opacity: 0}}>&lt;</span>
                    <span>September 2026</span>
                    <span>&gt;</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 12, textAlign: "center", fontSize: 14 }}>
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} style={{ color: "#888", marginBottom: 8 }}>{d}</div>)}
                    {/* Empty slots */}
                    <div />
                    {Array.from({length: 30}).map((_, i) => (
                      <div key={i} style={{ padding: "8px 0", cursor: "pointer", borderRadius: "50%" }}>
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #EAEAEA" }} />

            {/* Budgets */}
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Budgets</h3>
              
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 32 }}>
                <input 
                  type="checkbox" 
                  checked={showFreeEntryOnly}
                  onChange={(e) => setShowFreeEntryOnly(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: "#82165b" }} 
                />
                <span style={{ fontSize: 14, color: "#111" }}>Show free entry only</span>
              </label>

              {/* Histogram Slider Mock */}
              <div style={{ marginBottom: 40, position: "relative" }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 60, marginBottom: 16 }}>
                  {HISTOGRAM_BARS.map((height, i) => (
                    <div key={i} style={{ flex: 1, background: "#c2185b", height: `${height}px`, borderRadius: "4px 4px 0 0" }} />
                  ))}
                </div>
                {/* Fake Slider line and thumbs */}
                <div style={{ position: "absolute", bottom: -8, left: 0, right: 0, height: 2, background: "#c2185b" }} />
                <div style={{ position: "absolute", bottom: -16, left: 0, width: 32, height: 32, borderRadius: "50%", background: "#FFF", border: "1px solid #EAEAEA", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
                <div style={{ position: "absolute", bottom: -16, right: 0, width: 32, height: 32, borderRadius: "50%", background: "#FFF", border: "1px solid #EAEAEA", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
              </div>

              {/* Min/Max Inputs */}
              <div style={{ display: "flex", justifyContent: "space-between", gap: 24 }}>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 13, color: "#555", marginBottom: 8 }}>Minimum</div>
                  <div style={{ border: "1px solid #EAEAEA", borderRadius: 12, padding: "12px 0", fontSize: 14, fontWeight: 600 }}>
                    UZS 0
                  </div>
                </div>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 13, color: "#555", marginBottom: 8 }}>Maximum</div>
                  <div style={{ border: "1px solid #EAEAEA", borderRadius: 12, padding: "12px 0", fontSize: 14, fontWeight: 600 }}>
                    UZS 46,404
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Sticky Bottom Bar */}
          <div style={{ padding: "20px 32px", borderTop: "1px solid #EAEAEA", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button 
              onClick={handleClearAll}
              style={{ background: "transparent", border: "none", color: "#82165b", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
            >
              Clear All
            </button>
            <button 
              onClick={handleApply}
              style={{ background: "#82165b", border: "none", color: "#FFF", padding: "14px 24px", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              Show 342 Results
            </button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
