"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, Package, CheckCircle2, X, Plus, Loader2 } from "lucide-react";
import type { AIPackageSearchResult } from "@repo/types";

const FALLBACK = "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=800&q=80";

// ─── Package Carousel ─────────────────────────────────────────────────────────

interface PackageCarouselProps {
  packages: AIPackageSearchResult[];
  guestCount: number;
  onSelectPackage: (pkg: AIPackageSearchResult) => void;
  prefersReducedMotion: boolean;
  /** id of the package currently snapped into the timeline, if any -- gives that card a
   *  distinct border/badge so the user can tell which one (if any) they've already committed
   *  to versus which are still just options. */
  activePackageId?: string | null;
  /** Omit to hide the "Find another option" card entirely (e.g. before any search has run). */
  onFindMore?: () => void;
  isFindingMore?: boolean;
  findMoreError?: string | null;
}

export function PackageCarousel({
  packages,
  guestCount,
  onSelectPackage,
  prefersReducedMotion,
  activePackageId,
  onFindMore,
  isFindingMore,
  findMoreError,
}: PackageCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (packages.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    if (!trackRef.current) return;
    const card = trackRef.current.querySelector("[data-pkg-card]") as HTMLElement | null;
    const cardWidth = card ? card.offsetWidth + 16 : 280;
    trackRef.current.scrollBy({ left: dir === "right" ? cardWidth : -cardWidth, behavior: prefersReducedMotion ? "auto" : "smooth" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mb-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pl-6 pr-2">
        <div>
          <div className="flex items-center gap-2">
            <Package style={{ width: 16, height: 16, color: "#006B70" }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: "#0A2320", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Ready-to-Book Packages
            </span>
          </div>
          <p style={{ fontSize: 12, color: "rgba(10,35,32,0.5)", marginTop: 3, fontWeight: 500 }}>
            Curated by local agencies · click to explore
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="tap-active flex items-center justify-center"
            style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(10,35,32,0.06)", color: "#0A2320" }}
          >
            <ChevronLeft style={{ width: 16, height: 16 }} />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="tap-active flex items-center justify-center"
            style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(10,35,32,0.06)", color: "#0A2320" }}
          >
            <ChevronRight style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>

      {/* Scrollable Track */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto pl-6 pr-4 scrollbar-hide snap-x snap-mandatory pb-2"
      >
        {packages.map((pkg, i) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            guestCount={guestCount}
            onClick={() => onSelectPackage(pkg)}
            isActive={pkg.id === activePackageId}
            isRecommended={i === 0}
          />
        ))}
        {onFindMore && (
          <FindMoreCard onClick={onFindMore} isLoading={!!isFindingMore} error={findMoreError} />
        )}
      </div>
    </motion.div>
  );
}

function FindMoreCard({
  onClick,
  isLoading,
  error,
}: {
  onClick: () => void;
  isLoading: boolean;
  error?: string | null;
}) {
  return (
    <button
      data-pkg-card
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="tap-active flex-shrink-0 snap-start flex flex-col items-center justify-center text-center disabled:opacity-70"
      style={{
        width: 256,
        height: 258, // matches a PackageCard's total rendered height (130 image + ~128 body) so the row stays level
        borderRadius: 18,
        background: "rgba(10,35,32,0.03)",
        border: "1.5px dashed rgba(10,35,32,0.18)",
      }}
    >
      {isLoading ? (
        <Loader2 style={{ width: 22, height: 22, color: "#006B70" }} className="animate-spin" />
      ) : (
        <div
          className="flex items-center justify-center mb-2"
          style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(0,107,112,0.1)" }}
        >
          <Plus style={{ width: 18, height: 18, color: "#006B70" }} />
        </div>
      )}
      <span style={{ fontSize: 13, fontWeight: 700, color: "#0A2320", marginTop: isLoading ? 10 : 0 }}>
        {isLoading ? "Searching..." : "Find another option"}
      </span>
      {error && !isLoading && (
        <span style={{ fontSize: 11, color: "#C93B3B", marginTop: 6, paddingLeft: 16, paddingRight: 16, lineHeight: 1.4 }}>
          {error}
        </span>
      )}
    </button>
  );
}

function PackageCard({
  pkg,
  guestCount,
  onClick,
  isActive,
  isRecommended,
}: {
  pkg: AIPackageSearchResult;
  guestCount: number;
  onClick: () => void;
  isActive: boolean;
  isRecommended: boolean;
}) {
  const totalPrice = pkg.total_price * guestCount;
  const priceUsd = (totalPrice / 12600).toFixed(0);
  const cityLabel = pkg.cities.filter(Boolean).slice(0, 2).join(" · ");

  return (
    <button
      data-pkg-card
      type="button"
      onClick={onClick}
      className="tap-active flex-shrink-0 snap-start text-left overflow-hidden"
      style={{
        width: 256,
        borderRadius: 18,
        background: isActive ? "rgba(0,107,112,0.05)" : "#FFFFFF",
        border: isActive ? "2px solid #006B70" : "1px solid rgba(10,35,32,0.08)",
        boxShadow: isActive ? "0 10px 34px rgba(0,107,112,0.14)" : "0 8px 30px rgba(10,35,32,0.04)",
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: 130 }}>
        <Image
          src={pkg.image_url ?? FALLBACK}
          alt={pkg.title}
          fill
          className="object-cover"
          sizes="256px"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(10,35,32,0.75) 0%, transparent 60%)" }}
        />
        {/* Badge -- active (already snapped into the timeline) takes priority over the
            recommended hint, since it's the stronger, more relevant signal to the user. */}
        {isActive ? (
          <div
            className="absolute top-2 left-2 flex items-center gap-1"
            style={{ padding: "3px 8px", background: "#006B70", borderRadius: 20 }}
          >
            <CheckCircle2 style={{ width: 10, height: 10, color: "#FFFFFF" }} />
            <span style={{ fontSize: 9, fontWeight: 800, color: "#FFFFFF", letterSpacing: "0.05em" }}>
              ACTIVE
            </span>
          </div>
        ) : isRecommended ? (
          <div
            className="absolute top-2 left-2 flex items-center gap-1"
            style={{ padding: "3px 8px", background: "#C5A880", borderRadius: 20 }}
          >
            <span style={{ fontSize: 9, fontWeight: 800, color: "#0A2320", letterSpacing: "0.05em" }}>
              RECOMMENDED
            </span>
          </div>
        ) : (
          <div
            className="absolute top-2 left-2 flex items-center gap-1"
            style={{ padding: "3px 8px", background: "#006B70", borderRadius: 20 }}
          >
            <Package style={{ width: 9, height: 9, color: "#FFFFFF" }} />
            <span style={{ fontSize: 9, fontWeight: 800, color: "#FFFFFF", letterSpacing: "0.05em" }}>
              AGENCY PACKAGE
            </span>
          </div>
        )}
        {/* City */}
        {cityLabel && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1">
            <MapPin style={{ width: 10, height: 10, color: "#C5A880" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#F9F8F5" }}>{cityLabel}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-4 pt-3 pb-4">
        <p
          className="line-clamp-2 mb-2"
          style={{ fontSize: 14, fontWeight: 700, color: "#0A2320", lineHeight: 1.3, fontFamily: "'Playfair Display', serif" }}
        >
          {pkg.title}
        </p>
        {pkg.agency_name && (
          <p style={{ fontSize: 11, color: "rgba(10,35,32,0.5)", marginBottom: 10, fontWeight: 500 }}>
            by {pkg.agency_name}
          </p>
        )}
        <div style={{ borderTop: "1px solid rgba(10,35,32,0.06)", paddingTop: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#C5A880", fontFamily: "'JetBrains Mono', monospace" }}>
            {totalPrice.toLocaleString("en-US").replace(/,/g, " ")} {pkg.currency}
          </div>
          <div style={{ fontSize: 10, color: "rgba(10,35,32,0.4)", marginTop: 2, fontWeight: 500 }}>
            ≈ ${priceUsd} USD · {pkg.item_count} activities · {guestCount} guest{guestCount > 1 ? "s" : ""}
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Snapped Package Timeline ─────────────────────────────────────────────────

interface SnappedPackageTimelineProps {
  pkg: AIPackageSearchResult;
  guestCount: number;
  onRemove: () => void;
  onViewDetail: () => void;
}

export function SnappedPackageTimeline({
  pkg,
  guestCount,
  onRemove,
  onViewDetail,
}: SnappedPackageTimelineProps) {
  const totalPrice = pkg.total_price * guestCount;
  const priceUsd = (totalPrice / 12600).toFixed(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10 pl-14 relative"
    >
      {/* Timeline node */}
      <div
        className="absolute left-[24px] w-3.5 h-3.5 -ml-[6px] top-3 rounded-full z-10"
        style={{ background: "#006B70", boxShadow: "0 0 0 4px #FFFFFF" }}
      />

      {/* Card */}
      <div
        className="overflow-hidden"
        style={{
          borderRadius: 20,
          border: "2px solid #006B70",
          background: "rgba(0,107,112,0.04)",
          boxShadow: "0 8px 30px rgba(0,107,112,0.08)",
        }}
      >
        {/* Hero */}
        <div className="relative overflow-hidden" style={{ height: 140 }}>
          <Image
            src={pkg.image_url ?? FALLBACK}
            alt={pkg.title}
            fill
            className="object-cover"
            sizes="600px"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,35,32,0.8) 0%, transparent 60%)" }} />
          <div className="absolute top-3 left-3 flex items-center gap-1" style={{ padding: "3px 8px", background: "#006B70", borderRadius: 20 }}>
            <Package style={{ width: 9, height: 9, color: "#FFFFFF" }} />
            <span style={{ fontSize: 9, fontWeight: 800, color: "#FFFFFF", letterSpacing: "0.05em" }}>ACTIVE PACKAGE</span>
          </div>
          <button
            onClick={onRemove}
            aria-label="Remove package"
            className="tap-active absolute top-3 right-3 flex items-center justify-center"
            style={{ width: 28, height: 28, borderRadius: 10, background: "rgba(255,255,255,0.9)", color: "#0A2320" }}
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
          <div className="absolute bottom-3 left-3">
            <p style={{ fontSize: 16, fontWeight: 700, color: "#F9F8F5", fontFamily: "'Playfair Display', serif", lineHeight: 1.3 }}>{pkg.title}</p>
            {pkg.agency_name && <p style={{ fontSize: 11, color: "rgba(249,248,245,0.7)", fontWeight: 500 }}>by {pkg.agency_name}</p>}
          </div>
        </div>

        {/* Items checklist */}
        <div className="px-5 py-4">
          <div className="flex flex-col gap-2 mb-4">
            {pkg.items.slice(0, 6).map((item, i) => (
              <div key={item.id} className="flex items-start gap-2.5">
                <div
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{ width: 20, height: 20, borderRadius: "50%", background: "#006B70", marginTop: 1 }}
                >
                  <span style={{ fontSize: 9, fontWeight: 800, color: "#FFFFFF" }}>{i + 1}</span>
                </div>
                <span style={{ fontSize: 12.5, color: "#0A2320", fontWeight: 500, lineHeight: 1.4 }}>
                  {item.title ?? "Activity"}
                </span>
              </div>
            ))}
            {pkg.items.length > 6 && (
              <p style={{ fontSize: 11.5, color: "rgba(10,35,32,0.5)", paddingLeft: 28, fontWeight: 500 }}>
                +{pkg.items.length - 6} more activities
              </p>
            )}
          </div>

          <div className="flex items-end justify-between" style={{ borderTop: "1px solid rgba(10,35,32,0.06)", paddingTop: 14 }}>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 800, color: "#C5A880" }}>
                {totalPrice.toLocaleString("en-US").replace(/,/g, " ")} {pkg.currency}
              </div>
              <div style={{ fontSize: 11, color: "rgba(10,35,32,0.5)", marginTop: 2, fontWeight: 500 }}>
                ≈ ${priceUsd} USD · {guestCount} guest{guestCount > 1 ? "s" : ""}
              </div>
            </div>
            <button
              onClick={onViewDetail}
              className="tap-active"
              style={{ fontSize: 12, fontWeight: 700, color: "#006B70", textDecoration: "underline" }}
            >
              View full details →
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
