"use client";

import React from "react";
import { Search, Activity, Info } from "lucide-react";
import { KIND_COLOR, KIND_LABEL, LEVEL_COLOR, LEVEL_LABEL, type MapPinKind } from "./mapConstants";

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  layers: Record<MapPinKind, boolean>;
  onToggleLayer: (kind: MapPinKind) => void;
  categories: string[];
  activeCategories: Set<string>;
  onToggleCategory: (category: string) => void;
  densityMode: boolean;
  onToggleDensity: () => void;
  resultCount: number;
  totalCount: number;
}

function capitalize(s: string) {
  return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export function MapFilters({
  query,
  onQueryChange,
  layers,
  onToggleLayer,
  categories,
  activeCategories,
  onToggleCategory,
  densityMode,
  onToggleDensity,
  resultCount,
  totalCount,
}: Props) {
  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        left: 20,
        zIndex: 20,
        width: 340,
        maxWidth: "calc(100vw - 40px)",
        background: "#FFFFFF",
        borderRadius: 20,
        boxShadow: "0 12px 32px rgba(10,35,32,0.16)",
        border: "1px solid #EFEDE7",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        maxHeight: "calc(100vh - 120px)",
        overflowY: "auto",
      }}
      className="scrollbar-hide"
    >
      <div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 22, color: "#0A2320", marginBottom: 2 }}>
          Explore the Map
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "rgba(10,35,32,0.55)" }}>
          {resultCount} of {totalCount} locations shown
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative" }}>
        <Search size={15} color="rgba(10,35,32,0.4)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
        <input
          type="text"
          placeholder="Search destinations, experiences, events…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          style={{
            width: "100%",
            padding: "11px 14px 11px 38px",
            borderRadius: 12,
            border: "1px solid #EFEDE7",
            background: "#F9F8F5",
            fontSize: 13.5,
            fontFamily: "'Inter', sans-serif",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Layer toggles */}
      <div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(10,35,32,0.45)", marginBottom: 8 }}>
          Show on Map
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {(Object.keys(KIND_LABEL) as MapPinKind[]).map((kind) => {
            const active = layers[kind];
            return (
              <button
                key={kind}
                onClick={() => onToggleLayer(kind)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  borderRadius: 10,
                  border: `1px solid ${active ? KIND_COLOR[kind] : "#EFEDE7"}`,
                  background: active ? `${KIND_COLOR[kind]}14` : "#FFFFFF",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: KIND_COLOR[kind], flexShrink: 0, opacity: active ? 1 : 0.35 }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: active ? "#0A2320" : "rgba(10,35,32,0.45)" }}>
                  {KIND_LABEL[kind]}s
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Experience categories -- only relevant while the Experience layer is visible */}
      {layers.experience && categories.length > 0 && (
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(10,35,32,0.45)", marginBottom: 8 }}>
            Experience Type
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {categories.map((c) => {
              const active = activeCategories.has(c);
              return (
                <button
                  key={c}
                  onClick={() => onToggleCategory(c)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: `1px solid ${active ? "#C5A880" : "#EFEDE7"}`,
                    background: active ? "#C5A880" : "#F9F8F5",
                    color: active ? "#FFFFFF" : "#0A2320",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {capitalize(c)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Live activity feature switch */}
      <div style={{ borderTop: "1px solid #EFEDE7", paddingTop: 16 }}>
        <button
          onClick={onToggleDensity}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 14px",
            borderRadius: 12,
            border: "none",
            background: densityMode ? "#0A2320" : "#F9F8F5",
            cursor: "pointer",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Activity size={15} color={densityMode ? "#C5A880" : "#0A2320"} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, color: densityMode ? "#FFFFFF" : "#0A2320" }}>
              Live Activity
            </span>
          </span>
          <span
            style={{
              width: 34,
              height: 20,
              borderRadius: 999,
              background: densityMode ? "#C5A880" : "#E5E3DD",
              position: "relative",
              transition: "background 0.2s",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 2,
                left: densityMode ? 16 : 2,
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#FFFFFF",
                transition: "left 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              }}
            />
          </span>
        </button>

        {densityMode && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", gap: 14 }}>
              {(["quiet", "moderate", "busy"] as const).map((level) => (
                <div key={level} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: LEVEL_COLOR[level] }} />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "rgba(10,35,32,0.6)" }}>{LEVEL_LABEL[level]}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
              <Info size={12} color="rgba(10,35,32,0.4)" style={{ marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, lineHeight: 1.4, color: "rgba(10,35,32,0.45)" }}>
                Estimated from real listings, ratings & time of day — not GPS-tracked.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
