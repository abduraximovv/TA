"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { ItineraryWithMeta } from "@repo/database";
import { Package, Calendar, ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?q=80&w=900",
  "https://images.unsplash.com/photo-1596401057633-54ceb50f7e33?q=80&w=900",
  "https://images.unsplash.com/photo-1541364501234-7096e2ccb898?q=80&w=900",
  "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?q=80&w=900",
];

export function PackagesClient({ itineraries }: { itineraries: ItineraryWithMeta[] }) {
  return (
    <main style={{ minHeight: "100vh", paddingTop: 112, paddingBottom: 96, background: "#F9F8F5" }}>
      <div style={{ maxWidth: 1600, margin: "0 auto", padding: "0 56px" }}>
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 48 }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#006B70",
              marginBottom: 14,
            }}
          >
            Curated by Verified Agencies
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 48,
              fontWeight: 600,
              color: "#0A2320",
              lineHeight: 1.1,
              marginBottom: 12,
            }}
          >
            Tour <span className="text-gold-400">Packages</span>
          </h1>
          <p style={{ fontSize: 17, color: "rgba(10,35,32,0.6)", maxWidth: 560 }}>
            Curated multi-day itineraries crafted by verified travel agencies.
          </p>
        </motion.header>

        {itineraries.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 28 }}
          >
            {itineraries.map((itin, i) => (
              <PackageCard key={itin.id} itinerary={itin} fallback={FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]} />
            ))}
          </motion.div>
        ) : (
          <div
            style={{
              width: "100%",
              padding: "80px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "1px dashed rgba(10,35,32,0.15)",
              borderRadius: 8,
              background: "#FFFFFF",
            }}
          >
            <Package style={{ width: 40, height: 40, color: "rgba(10,35,32,0.2)", marginBottom: 16 }} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: "#0A2320", marginBottom: 8 }}>
              No packages available yet
            </h2>
            <p style={{ color: "rgba(10,35,32,0.5)", fontSize: 14, marginBottom: 24, maxWidth: 420, textAlign: "center" }}>
              Travel agencies are currently crafting exciting itineraries. Check back soon or explore individual experiences.
            </p>
            <Link href="/service" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              Explore Experiences <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

function PackageCard({ itinerary, fallback }: { itinerary: ItineraryWithMeta; fallback: string }) {
  const dateRange =
    itinerary.start_date && itinerary.end_date
      ? `${new Date(itinerary.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} — ${new Date(
          itinerary.end_date
        ).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
      : null;

  return (
    <motion.div variants={fadeUp} whileHover={{ y: -4 }} style={{ height: "100%" }}>
      <Link href={`/packages/${itinerary.id}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
        <div
          className="package-card"
          style={{
            background: "#FFFFFF",
            borderRadius: 22,
            border: "1px solid rgba(10,35,32,0.08)",
            boxShadow: "0 20px 40px -28px rgba(10,35,32,0.35)",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: 16,
          }}
        >
          {/* Inset photo, framed by card padding */}
          <div style={{ position: "relative", height: 230, borderRadius: 16, overflow: "hidden" }}>
            <Image
              src={itinerary.image_url || fallback}
              alt={itinerary.title}
              fill
              className="object-cover package-card-img"
              sizes="(max-width: 768px) 100vw, 360px"
            />
            {itinerary.item_count > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#F9F8F5",
                  background: "rgba(10,35,32,0.65)",
                  backdropFilter: "blur(8px)",
                  padding: "6px 12px",
                  borderRadius: 100,
                }}
              >
                {itinerary.item_count} item{itinerary.item_count !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div style={{ padding: "20px 8px 6px", display: "flex", flexDirection: "column", flex: 1 }}>
            {itinerary.agency_name && (
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10.5,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#006B70",
                  marginBottom: 8,
                }}
              >
                {itinerary.agency_name}
              </div>
            )}

            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 600,
                fontSize: 21,
                color: "#0A2320",
                lineHeight: 1.3,
                marginBottom: 8,
              }}
              className="line-clamp-2"
            >
              {itinerary.title}
            </h3>

            {itinerary.description && (
              <p style={{ color: "rgba(10,35,32,0.55)", fontSize: 13.5, lineHeight: 1.5, marginBottom: 16 }} className="line-clamp-2">
                {itinerary.description}
              </p>
            )}

            {dateRange && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12.5,
                  color: "rgba(10,35,32,0.55)",
                  marginBottom: 16,
                  marginTop: "auto",
                }}
              >
                <Calendar style={{ width: 14, height: 14 }} /> {dateRange}
              </div>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                paddingTop: 16,
                borderTop: "1px solid rgba(10,35,32,0.08)",
                marginTop: dateRange ? 0 : "auto",
              }}
            >
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: "#0A2320", fontWeight: 700 }}>
                {(Number(itinerary.total_price) || 0).toLocaleString("en-US").replace(/,/g, " ")}{" "}
                <span style={{ fontSize: 10, color: "rgba(10,35,32,0.4)", fontWeight: 600 }}>{itinerary.currency}</span>
              </span>
              <span style={{ color: "#006B70", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                View Details <ArrowRight style={{ width: 14, height: 14 }} />
              </span>
            </div>
          </div>
        </div>
      </Link>

      <style>{`
        .package-card-img { transition: transform 0.7s ease-out; }
        .package-card:hover .package-card-img { transform: scale(1.05); }
      `}</style>
    </motion.div>
  );
}
