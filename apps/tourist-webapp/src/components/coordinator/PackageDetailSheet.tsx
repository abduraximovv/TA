"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Package, CheckCircle2, ExternalLink } from "lucide-react";
import type { AIPackageSearchResult } from "@repo/types";

const FALLBACK = "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=800&q=80";

interface PackageDetailSheetProps {
  pkg: AIPackageSearchResult | null;
  onOpenChange: (open: boolean) => void;
  guestCount: number;
  isActive: boolean;
  onReplacePlan: (pkg: AIPackageSearchResult) => void;
  prefersReducedMotion: boolean;
}

export function PackageDetailSheet({
  pkg,
  onOpenChange,
  guestCount,
  isActive,
  onReplacePlan,
  prefersReducedMotion,
}: PackageDetailSheetProps) {
  const isOpen = pkg !== null;

  if (!isOpen) return null;

  const totalPrice = pkg.total_price * guestCount;
  const priceUsd = (totalPrice / 12600).toFixed(0);
  const cityLabel = pkg.cities.filter(Boolean).join(" · ");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(10,35,32,0.5)", backdropFilter: "blur(6px)" }}
          />

          {/* Centered popup -- click the padded backdrop area to close, clicks inside the card
              itself are stopped from bubbling up to that same handler. */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
            onClick={() => onOpenChange(false)}
          >
            <motion.div
              key="card"
              onClick={(e) => e.stopPropagation()}
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
              transition={prefersReducedMotion ? { duration: 0.15 } : { type: "spring", bounce: 0.15, duration: 0.4 }}
              className="relative w-full overflow-y-auto"
              style={{
                maxWidth: 720,
                maxHeight: "90vh",
                borderRadius: 28,
                background: "#F9F8F5",
                boxShadow: "0 28px 80px rgba(10,35,32,0.4)",
              }}
            >
              {/* Close button */}
              <button
                onClick={() => onOpenChange(false)}
                aria-label="Close"
                className="tap-active absolute top-5 right-5 z-10 flex items-center justify-center"
                style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(10,35,32,0.35)", backdropFilter: "blur(6px)", color: "#F9F8F5" }}
              >
                <X style={{ width: 18, height: 18 }} />
              </button>

              {/* Hero -- aspect-ratio (not a fixed pixel height) so the image is never stretched
                  or cropped to a wildly wide/short rectangle regardless of the card's width. */}
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16 / 9", borderRadius: "28px 28px 0 0" }}>
                <Image
                  src={pkg.image_url ?? FALLBACK}
                  alt={pkg.title}
                  fill
                  className="object-cover"
                  sizes="720px"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,35,32,0.8) 0%, rgba(10,35,32,0.05) 55%, transparent 100%)" }} />
                <div
                  className="absolute top-5 left-5 flex items-center gap-1.5"
                  style={{ padding: "5px 12px", background: "#006B70", borderRadius: 20 }}
                >
                  <Package style={{ width: 11, height: 11, color: "#FFFFFF" }} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#FFFFFF", letterSpacing: "0.05em" }}>AGENCY PACKAGE</span>
                </div>
                {cityLabel && (
                  <div className="absolute bottom-5 left-6 flex items-center gap-1.5">
                    <MapPin style={{ width: 14, height: 14, color: "#C5A880" }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#F9F8F5" }}>{cityLabel}</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="px-8 pt-7 pb-8">
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 30,
                    fontWeight: 700,
                    color: "#0A2320",
                    lineHeight: 1.25,
                    marginBottom: 6,
                  }}
                >
                  {pkg.title}
                </h3>
                {pkg.agency_name && (
                  <p style={{ fontSize: 14, color: "rgba(10,35,32,0.55)", fontWeight: 600, marginBottom: 16 }}>
                    Curated by {pkg.agency_name}
                  </p>
                )}
                {pkg.description && (
                  <p style={{ fontSize: 15.5, color: "rgba(10,35,32,0.75)", lineHeight: 1.65, marginBottom: 26, fontWeight: 400 }}>
                    {pkg.description}
                  </p>
                )}

                {/* Journey checklist */}
                <h4 style={{ fontSize: 13, fontWeight: 800, color: "#0A2320", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>
                  Your Journey
                </h4>
                <div className="flex flex-col gap-4 mb-8">
                  {pkg.items.map((item, i) => (
                    <div key={item.id} className="flex items-start gap-3.5">
                      <div
                        className="flex-shrink-0 flex items-center justify-center"
                        style={{ width: 28, height: 28, borderRadius: "50%", background: "#0A2320", marginTop: 1 }}
                      >
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#F9F8F5" }}>{i + 1}</span>
                      </div>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: "#0A2320", lineHeight: 1.35 }}>
                          {item.title ?? "Activity"}
                        </p>
                        {item.description && (
                          <p style={{ fontSize: 13, color: "rgba(10,35,32,0.55)", marginTop: 3, lineHeight: 1.45 }}>
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price block */}
                <div
                  className="flex items-end justify-between mb-6"
                  style={{ background: "#FFFFFF", borderRadius: 18, padding: "20px 24px", border: "1px solid rgba(10,35,32,0.08)" }}
                >
                  <div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: "#C5A880", fontFamily: "'JetBrains Mono', monospace" }}>
                      {totalPrice.toLocaleString("en-US").replace(/,/g, " ")} {pkg.currency}
                    </div>
                    <div style={{ fontSize: 13, color: "rgba(10,35,32,0.5)", marginTop: 4, fontWeight: 500 }}>
                      ≈ ${priceUsd} USD · {guestCount} guest{guestCount > 1 ? "s" : ""} · {pkg.item_count} activities
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col gap-3">
                  {isActive ? (
                    // Already snapped in -- there's no further action to take here, so this is
                    // a static status indicator, not a button that would just re-do the same thing.
                    <div
                      className="w-full flex items-center justify-center gap-2"
                      style={{
                        background: "rgba(0,107,112,0.08)",
                        color: "#006B70",
                        borderRadius: 18,
                        padding: "18px 24px",
                        fontSize: 15,
                        fontWeight: 800,
                        border: "1.5px solid rgba(0,107,112,0.25)",
                      }}
                    >
                      <CheckCircle2 style={{ width: 19, height: 19 }} />
                      This Package Is Active In Your Timeline
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { onReplacePlan(pkg); onOpenChange(false); }}
                      className="tap-active w-full flex items-center justify-center gap-2"
                      style={{
                        background: "#C5A880",
                        color: "#0A2320",
                        borderRadius: 18,
                        padding: "18px 24px",
                        fontSize: 16,
                        fontWeight: 800,
                      }}
                    >
                      Replace AI Plan with this Package
                    </button>
                  )}
                  <a
                    href={`/packages/${pkg.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tap-active w-full flex items-center justify-center gap-1.5"
                    style={{
                      background: "rgba(10,35,32,0.06)",
                      color: "#0A2320",
                      borderRadius: 18,
                      padding: "15px 24px",
                      fontSize: 15,
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    <ExternalLink style={{ width: 15, height: 15 }} />
                    View full details
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
