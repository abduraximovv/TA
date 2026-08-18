"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  Star,
  Shuffle,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Zap,
  X,
} from "lucide-react";
import type { AIServiceSearchResult } from "@repo/types";

const FALLBACK = "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=800&q=80";

// ─── ActivityCard ─────────────────────────────────────────────────────────────

export interface ActivityCardProps {
  service: AIServiceSearchResult;
  time: string;
  /** The tourist's confirmed slot pick, or null if this service has real bookable slots
   *  (service.available_slots.length > 0) and none has been chosen yet. Always equal to `time`
   *  for unmanaged services (no chips to pick from -- current, unchanged behavior). */
  chosenTime: string | null;
  onChooseSlot: (startTime: string) => void;
  isSwapping: boolean;
  onSwap: () => void;
  session: any;
  prefersReducedMotion: boolean;
  selected: boolean;
  onToggleSelect: () => void;
}

export function ActivityCard({
  service,
  time,
  chosenTime,
  onChooseSlot,
  isSwapping,
  onSwap,
  session,
  prefersReducedMotion,
  selected,
  onToggleSelect,
}: ActivityCardProps) {
  const priceUzs = Number(service.price) || 0;
  const priceUsd = (priceUzs / 12600).toFixed(0);
  const location = service.city ?? service.region;
  const slots = service.available_slots ?? [];
  const needsSlotChoice = slots.length > 0 && !chosenTime;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={needsSlotChoice ? "relative overflow-hidden" : "relative overflow-hidden cursor-pointer"}
      onClick={needsSlotChoice ? undefined : onToggleSelect}
      style={{
        borderRadius: 20,
        background: selected ? "rgba(197,168,128,0.08)" : "#FFFFFF",
        border: selected ? "2px solid #C5A880" : "1px solid rgba(10,35,32,0.08)",
        boxShadow: selected ? "0 8px 30px rgba(197,168,128,0.15)" : "0 8px 30px rgba(10,35,32,0.03)",
        opacity: needsSlotChoice ? 0.92 : 1,
        transition: "all 0.2s ease",
      }}
    >
      {/* Image */}
      <div className="relative w-full overflow-hidden" style={{ height: 160 }}>
        <Image
          src={service.image_url ?? FALLBACK}
          alt={service.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 640px"
        />
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(10,35,32,0.8) 0%, rgba(10,35,32,0.1) 40%, transparent 100%)",
          }}
        />

        {/* Selection Checkbox */}
        <div
          className="absolute top-3 left-3 z-20 flex items-center justify-center"
          style={{
            width: 28, height: 28,
            borderRadius: "50%",
            background: selected ? "#C5A880" : "rgba(255,255,255,0.7)",
            border: selected ? "none" : "2px solid rgba(10,35,32,0.3)",
            backdropFilter: "blur(4px)",
            opacity: needsSlotChoice ? 0.4 : 1,
            transition: "all 0.2s ease",
          }}
        >
          {selected && <CheckCircle2 style={{ width: 18, height: 18, color: "#0A2320" }} />}
        </div>

        {/* Time badge -- prompts for a chip pick when this service has real timed slots and none
            is chosen yet, otherwise shows the fixed/chosen time as before. */}
        <div
          className="absolute top-3 left-12 flex items-center gap-1.5"
          style={{
            padding: "5px 10px",
            background: needsSlotChoice ? "rgba(201,59,59,0.85)" : "rgba(10,35,32,0.75)",
            backdropFilter: "blur(8px)",
            borderRadius: 20,
            border: "1px solid rgba(249,248,245,0.1)",
          }}
        >
          <Clock style={{ width: 11, height: 11, color: "#C5A880" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#F9F8F5", letterSpacing: "0.04em" }}>
            {needsSlotChoice ? "Pick a time" : chosenTime ?? time}
          </span>
        </div>

        {/* Swap button */}
        <button
          onClick={(e) => { e.stopPropagation(); onSwap(); }}
          disabled={isSwapping}
          aria-label="Find alternatives"
          title="Select & Alter — 3 alternatives"
          className="tap-active absolute top-3 right-3 flex items-center justify-center disabled:opacity-50 z-20"
          style={{
            width: 34, height: 34,
            borderRadius: 12,
            background: "#FFFFFF",
            boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
            color: "#0A2320",
          }}
        >
          {isSwapping ? (
            <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />
          ) : (
            <Shuffle style={{ width: 14, height: 14 }} />
          )}
        </button>

        {/* Category Label */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          {service.category && (
            <span style={{ fontSize: 10, fontWeight: 800, color: "#F9F8F5", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {service.category}
            </span>
          )}
          {service.is_rural_provider && (
            <div
              className="flex items-center gap-1"
              style={{ padding: "3px 8px", background: "#0A2320", borderRadius: 20, border: "1px solid rgba(197,168,128,0.3)" }}
            >
              <Zap style={{ width: 9, height: 9, color: "#C5A880" }} />
              <span style={{ fontSize: 9, fontWeight: 800, color: "#F9F8F5", letterSpacing: "0.05em" }}>
                HIDDEN GEM
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pt-4 pb-5">
        <h4
          className="mb-1.5 line-clamp-2"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 18,
            fontWeight: 700,
            color: "#0A2320",
            lineHeight: 1.3,
          }}
        >
          {service.title}
        </h4>

        <div className="flex items-center gap-4 mb-4 flex-wrap mt-2">
          {location && (
            <span className="flex items-center gap-1.5">
              <MapPin style={{ width: 13, height: 13, color: "#006B70" }} />
              <span style={{ fontSize: 12.5, color: "rgba(10,35,32,0.6)", fontWeight: 500 }}>{location}</span>
            </span>
          )}
          {service.duration_minutes && (
            <span className="flex items-center gap-1.5">
              <Clock style={{ width: 13, height: 13, color: "#006B70" }} />
              <span style={{ fontSize: 12.5, color: "rgba(10,35,32,0.6)", fontWeight: 500 }}>
                {service.duration_minutes >= 60 ? `${Math.round(service.duration_minutes / 60)}h` : `${service.duration_minutes}m`}
              </span>
            </span>
          )}
          {service.rating_avg > 0 && (
            <span className="flex items-center gap-1.5">
              <Star style={{ width: 13, height: 13, fill: "#C5A880", color: "#C5A880" }} />
              <span style={{ fontSize: 12.5, color: "rgba(10,35,32,0.6)", fontWeight: 700 }}>{service.rating_avg.toFixed(1)}</span>
            </span>
          )}
        </div>

        {/* Time slot chips -- only rendered when this service has real, remaining-capacity
            timed slots for the searched date. Selecting the card requires picking one first
            (see needsSlotChoice above); clicking a chip must not also toggle selection. */}
        {slots.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {slots.map((slot) => {
              const isChosen = chosenTime === slot.start_time;
              return (
                <button
                  key={slot.start_time}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onChooseSlot(slot.start_time); }}
                  className="tap-active"
                  style={{
                    padding: "6px 12px",
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    background: isChosen ? "#C5A880" : "rgba(10,35,32,0.04)",
                    color: isChosen ? "#0A2320" : "rgba(10,35,32,0.65)",
                    border: isChosen ? "1px solid #C5A880" : "1px solid rgba(10,35,32,0.1)",
                  }}
                >
                  {slot.start_time.slice(0, 5)}
                </button>
              );
            })}
          </div>
        )}

        {/* Price */}
        <div
          className="flex items-end justify-between gap-3"
          style={{ borderTop: "1px solid rgba(10,35,32,0.06)", paddingTop: 14 }}
        >
          <div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 18,
                fontWeight: 800,
                color: "#C5A880",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              {priceUzs.toLocaleString("en-US").replace(/,/g, " ")}
              <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(10,35,32,0.5)", marginLeft: 4 }}>
                {service.currency}
              </span>
            </div>
            <div style={{ fontSize: 11, color: "rgba(10,35,32,0.5)", marginTop: 2, fontWeight: 500 }}>
              ≈ ${priceUsd} USD / person
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── SwapPanel ────────────────────────────────────────────────────────────────

export interface SwapPanelProps {
  original: AIServiceSearchResult;
  alts: AIServiceSearchResult[];
  time: string;
  onConfirm: (svc: AIServiceSearchResult) => void;
  onCancel: () => void;
  prefersReducedMotion: boolean;
}

export function SwapPanel({ original, alts, time, onConfirm, onCancel, prefersReducedMotion }: SwapPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: -8 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      style={{
        borderRadius: 20,
        overflow: "hidden",
        border: "1.5px solid rgba(0,107,112,0.2)",
        background: "#F9F8F5",
        boxShadow: "0 8px 30px rgba(10,35,32,0.06)",
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ background: "rgba(0,107,112,0.05)", borderBottom: "1px solid rgba(0,107,112,0.1)" }}
      >
        <div className="flex items-center gap-2.5">
          <Shuffle style={{ width: 14, height: 14, color: "#006B70" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0A2320" }}>
            Select &amp; Alter
          </span>
          <span style={{ fontSize: 12, color: "rgba(10,35,32,0.5)", fontWeight: 500 }}>
            — {alts.length} alternative{alts.length !== 1 ? "s" : ""} found
          </span>
        </div>
        <button onClick={onCancel} aria-label="Keep original" className="tap-active">
          <X style={{ width: 16, height: 16, color: "rgba(10,35,32,0.4)" }} />
        </button>
      </div>

      <div className="px-5 py-3.5" style={{ borderBottom: "1px dashed rgba(10,35,32,0.1)" }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: "rgba(10,35,32,0.4)", letterSpacing: "0.08em", marginBottom: 8 }}>
          REPLACING
        </p>
        <div className="flex items-center gap-3 opacity-60">
          <div className="relative rounded-xl overflow-hidden flex-shrink-0" style={{ width: 44, height: 44 }}>
            <Image src={original.image_url ?? FALLBACK} alt={original.title} fill className="object-cover" sizes="44px" />
          </div>
          <span style={{ fontSize: 13, color: "#0A2320", fontWeight: 700 }}>{original.title}</span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {alts.length === 0 ? (
          <p style={{ fontSize: 13, color: "rgba(10,35,32,0.5)", textAlign: "center", padding: "16px 0", fontWeight: 500 }}>
            No alternatives found for this category near this location.
          </p>
        ) : (
          alts.map((alt, i) => {
            const altUsd = (Number(alt.price) / 12600).toFixed(0);
            return (
              <motion.button
                key={alt.id}
                type="button"
                onClick={() => onConfirm(alt)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={prefersReducedMotion ? {} : { delay: i * 0.07, duration: 0.22 }}
                className="tap-active flex items-center gap-3.5 text-left w-full"
                style={{
                  padding: "12px 14px",
                  background: "#FFFFFF",
                  border: "1px solid rgba(10,35,32,0.06)",
                  boxShadow: "0 2px 10px rgba(10,35,32,0.02)",
                  borderRadius: 16,
                }}
              >
                <div className="relative rounded-xl overflow-hidden flex-shrink-0" style={{ width: 52, height: 52 }}>
                  <Image src={alt.image_url ?? FALLBACK} alt={alt.title} fill className="object-cover" sizes="52px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="line-clamp-2" style={{ fontSize: 13.5, fontWeight: 700, color: "#0A2320", lineHeight: 1.3, marginBottom: 4 }}>
                    {alt.title}
                  </p>
                  <div className="flex items-center gap-2">
                    {alt.rating_avg > 0 && (
                      <span className="flex items-center gap-1">
                        <Star style={{ width: 10, height: 10, fill: "#C5A880", color: "#C5A880" }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(10,35,32,0.7)" }}>
                          {alt.rating_avg.toFixed(1)}
                        </span>
                      </span>
                    )}
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: "#C5A880", fontFamily: "'JetBrains Mono', monospace" }}>
                      ${altUsd}
                    </span>
                  </div>
                </div>
                <div
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(0,107,112,0.08)" }}
                >
                  <ChevronRight style={{ width: 14, height: 14, color: "#006B70" }} />
                </div>
              </motion.button>
            );
          })
        )}
        <button
          onClick={onCancel}
          className="tap-active w-full mt-2"
          style={{
            padding: "12px 0",
            background: "#FFFFFF",
            borderRadius: 14,
            fontSize: 13,
            fontWeight: 700,
            color: "rgba(10,35,32,0.5)",
            border: "1px solid rgba(10,35,32,0.08)",
          }}
        >
          Keep original
        </button>
      </div>
    </motion.div>
  );
}
