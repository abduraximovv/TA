"use client";

import React from "react";
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

export function PackagesClient({ itineraries }: { itineraries: ItineraryWithMeta[] }) {
  return (
    <main style={{ minHeight: "100vh", paddingTop: 112, paddingBottom: 96, background: "#F9F8F5" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 56px" }}>
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
            Tour <span style={{ color: "#C5A880" }}>Packages</span>
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
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}
          >
            {itineraries.map((itin) => (
              <PackageCard key={itin.id} itinerary={itin} />
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

function PackageCard({ itinerary }: { itinerary: ItineraryWithMeta }) {
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
          style={{
            background: "#FFFFFF",
            borderRadius: 8,
            border: "1px solid rgba(10,35,32,0.05)",
            boxShadow: "0 1px 3px rgba(10,35,32,0.06)",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: 22,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                background: "rgba(197,168,128,0.16)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#8A6D3B",
              }}
            >
              <Package style={{ width: 22, height: 22 }} />
            </div>
            {itinerary.item_count > 0 && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "rgba(10,35,32,0.5)",
                  background: "rgba(10,35,32,0.05)",
                  padding: "4px 10px",
                  borderRadius: 100,
                }}
              >
                {itinerary.item_count} item{itinerary.item_count !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {itinerary.agency_name && (
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10.5,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#006B70",
                marginBottom: 6,
              }}
            >
              {itinerary.agency_name}
            </div>
          )}

          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 600,
              fontSize: 19,
              color: "#0A2320",
              lineHeight: 1.3,
              marginBottom: 8,
            }}
            className="line-clamp-2"
          >
            {itinerary.title}
          </h3>

          {itinerary.description && (
            <p style={{ color: "rgba(10,35,32,0.55)", fontSize: 13.5, marginBottom: 16 }} className="line-clamp-2">
              {itinerary.description}
            </p>
          )}

          {dateRange && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
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
              borderTop: "1px solid rgba(10,35,32,0.05)",
              marginTop: dateRange ? 0 : "auto",
            }}
          >
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#0A2320", fontWeight: 700 }}>
              {new Intl.NumberFormat("uz-UZ").format(itinerary.total_price)}{" "}
              <span style={{ fontSize: 10, color: "rgba(10,35,32,0.4)", fontWeight: 600 }}>{itinerary.currency}</span>
            </span>
            <span style={{ color: "#006B70", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              View Details <ArrowRight style={{ width: 14, height: 14 }} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
