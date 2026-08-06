"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Package, Calendar, Star } from "lucide-react";
import { PackageBookingModal } from "@/components/booking/PackageBookingModal";
import type { ItineraryDetail, ReviewWithAuthor } from "@repo/database";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

interface PackageDetailClientProps {
  itinerary: ItineraryDetail;
  reviews: ReviewWithAuthor[];
  isLoggedIn: boolean;
}

export function PackageDetailClient({ itinerary, reviews, isLoggedIn }: PackageDetailClientProps) {
  const dateRange =
    itinerary.start_date && itinerary.end_date
      ? `${new Date(itinerary.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} — ${new Date(
          itinerary.end_date
        ).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
      : null;

  return (
    <main style={{ minHeight: "100vh", background: "#F9F8F5", paddingBottom: 120 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ background: "#0A2320", color: "#FFFFFF", paddingTop: 112, paddingBottom: 48 }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 56px" }}>
          <Breadcrumb light items={[{ label: "Packages", href: "/packages" }, { label: itinerary.title }]} style={{ padding: 0, marginBottom: 16 }} />
          <Link
            href="/packages"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "rgba(249,248,245,0.7)",
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
              marginBottom: 24,
            }}
          >
            <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Packages
          </Link>

          {itinerary.agency_name && (
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#C5A880",
                marginBottom: 10,
              }}
            >
              by {itinerary.agency_name}
            </div>
          )}

          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 34,
              fontWeight: 600,
              lineHeight: 1.15,
              marginBottom: 16,
            }}
          >
            {itinerary.title}
          </h1>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 18, fontSize: 14, color: "rgba(249,248,245,0.75)" }}>
            {dateRange && (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Calendar style={{ width: 15, height: 15 }} /> {dateRange}
              </span>
            )}
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Package style={{ width: 15, height: 15 }} /> {itinerary.items.length} item{itinerary.items.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        style={{ maxWidth: 900, margin: "0 auto", padding: "28px 56px 0" }}
      >
        {itinerary.description && (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 8,
              padding: 24,
              boxShadow: "0 1px 3px rgba(10,35,32,0.06)",
              border: "1px solid rgba(10,35,32,0.05)",
              marginBottom: 20,
            }}
          >
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: "#0A2320", marginBottom: 10 }}>
              Overview
            </h2>
            <p style={{ color: "rgba(10,35,32,0.7)", lineHeight: 1.7 }}>{itinerary.description}</p>
          </div>
        )}

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 8,
            padding: 24,
            boxShadow: "0 1px 3px rgba(10,35,32,0.06)",
            border: "1px solid rgba(10,35,32,0.05)",
            marginBottom: 20,
          }}
        >
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: "#0A2320", marginBottom: 14 }}>
            Included in this package
          </h2>

          {itinerary.items.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {itinerary.items.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: 14,
                    background: "#F9F8F5",
                    borderRadius: 6,
                    border: "1px solid rgba(10,35,32,0.05)",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 6,
                      background: "rgba(197,168,128,0.16)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#8A6D3B",
                      fontWeight: 700,
                      fontSize: 13,
                      marginRight: 14,
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontWeight: 600, color: "#0A2320", fontSize: 14 }} className="truncate">
                      {item.service_title ?? item.title ?? "Custom Item"}
                    </h3>
                  </div>
                  {item.price != null && (
                    <span style={{ color: "#0A2320", fontWeight: 700, fontSize: 13, marginLeft: 14, flexShrink: 0 }}>
                      {(Number(item.price) || 0).toLocaleString("en-US").replace(/,/g, " ")}{" "}
                      <span style={{ fontSize: 10, color: "rgba(10,35,32,0.4)", fontWeight: 600 }}>UZS</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 14, color: "rgba(10,35,32,0.5)" }}>No items in this package yet.</p>
          )}
        </div>

        {reviews.length > 0 && (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 8,
              padding: 24,
              boxShadow: "0 1px 3px rgba(10,35,32,0.06)",
              border: "1px solid rgba(10,35,32,0.05)",
              marginBottom: 20,
            }}
          >
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: "#0A2320", marginBottom: 14 }}>
              Reviews ({reviews.length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {reviews.slice(0, 5).map((review) => (
                <div key={review.id} style={{ padding: 16, background: "#F9F8F5", borderRadius: 6, border: "1px solid rgba(10,35,32,0.05)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, color: "#0A2320", fontSize: 14 }}>{review.author_name ?? "Anonymous"}</span>
                    <div style={{ display: "flex", gap: 2 }}>
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} style={{ width: 14, height: 14, color: "#C5A880", fill: "#C5A880" }} />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p style={{ fontSize: 14, color: "rgba(10,35,32,0.7)" }}>{review.comment}</p>}
                  {review.response && (
                    <div style={{ marginTop: 12, paddingLeft: 14, borderLeft: "2px solid rgba(197,168,128,0.4)" }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#006B70", marginBottom: 3 }}>Agency Reply</p>
                      <p style={{ fontSize: 14, color: "rgba(10,35,32,0.7)" }}>{review.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Fixed bottom action bar */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#FFFFFF",
          borderTop: "1px solid rgba(10,35,32,0.08)",
          padding: "16px 24px calc(16px + env(safe-area-inset-bottom))",
          boxShadow: "0 -4px 20px rgba(10,35,32,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 50,
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: "rgba(10,35,32,0.5)", fontWeight: 500 }}>Total price</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: "#0A2320" }}>
            {(Number(itinerary.total_price) || 0).toLocaleString("en-US").replace(/,/g, " ")}{" "}
            <span style={{ fontSize: 14, fontWeight: 400, color: "rgba(10,35,32,0.5)" }}>{itinerary.currency}</span>
          </div>
        </div>
        <PackageBookingModal itineraryId={itinerary.id} price={itinerary.total_price} currency={itinerary.currency} isLoggedIn={isLoggedIn} />
      </div>
    </main>
  );
}
