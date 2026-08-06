"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

// Static curated offers — no offers table in the schema yet, so this mirrors the
// FALLBACK_* pattern used by the other landing sections until one exists.
const OFFERS = [
  {
    id: "off-1",
    partner: "Uzbekistan Airways",
    title: "15% Off International Routes",
    dateRange: "Valid through 30 Sep 2026",
    badge: "15% OFF",
    badgeColor: "#006B70",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=700",
  },
  {
    id: "off-2",
    partner: "Silk Road Hotels Group",
    title: "20% Off Boutique Stays in Bukhara & Khiva",
    dateRange: "Book by 15 Oct 2026",
    badge: "20% OFF",
    badgeColor: "#C1592A",
    image:
      "https://images.unsplash.com/photo-1557841621-d9f6673405ed?q=80&w=700",
  },
  {
    id: "off-3",
    partner: "Registan Night Show",
    title: "2-for-1 Sound & Light Show Tickets",
    dateRange: "Every Friday, year-round",
    badge: "2-FOR-1",
    badgeColor: "#A63446",
    image:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=700",
  },
  {
    id: "off-4",
    partner: "Chimgan Cable Car",
    title: "Family Package: 2 Adults + 2 Kids Free",
    dateRange: "Weekends, Jun – Sep 2026",
    badge: "KIDS FREE",
    badgeColor: "#006B70",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=700",
  },
];

export function OffersSection() {
  return (
    <section style={{ padding: "clamp(56px, 10vw, 88px) var(--section-padding-x) clamp(56px, 10vw, 96px)", background: "#F9F8F5" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 40,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#C1592A",
              marginBottom: 12,
            }}
          >
            Partner Offers
          </div>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "var(--text-h2)",
              fontWeight: 600,
              color: "#0A2320",
            }}
          >
            Discover the Latest Offers
          </div>
        </div>
        <Link
          href="/discover"
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#006B70",
            textDecoration: "none",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          View All
        </Link>
      </div>

      <div className="responsive-grid-4">
        {OFFERS.map((offer, i) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <div
              style={{
                borderRadius: 14,
                overflow: "visible",
                background: "#FFFFFF",
                border: "1px solid #EFEDE7",
                boxShadow: "0 4px 16px rgba(10,35,32,0.05)",
              }}
            >
              {/* Two-stack image: brand lockup strip + lifestyle photo */}
              <div style={{ borderRadius: "14px 14px 0 0", overflow: "hidden" }}>
                <div
                  style={{
                    height: 56,
                    background: "#0A2320",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#F9F8F5",
                    letterSpacing: "0.02em",
                    textAlign: "center",
                    padding: "0 12px",
                    overflow: "hidden",
                    lineHeight: 1.3,
                  }}
                >
                  {offer.partner}
                </div>
                <div style={{ position: "relative", height: 140 }}>
                  <Image
                    src={offer.image}
                    alt={offer.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1280px) 25vw, 300px"
                  />
                </div>
              </div>

              {/* Overlapping starburst badge */}
              <div
                className="starburst-badge"
                style={{
                  position: "relative",
                  width: 66,
                  height: 66,
                  marginTop: -33,
                  marginLeft: 16,
                  background: offer.badgeColor,
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: "0 6px",
                }}
              >
                {offer.badge}
              </div>

              {/* Content */}
              <div style={{ padding: "8px 18px 20px" }}>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "rgba(10,35,32,0.5)",
                    marginBottom: 8,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {offer.dateRange}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#0A2320",
                    lineHeight: 1.35,
                    marginBottom: 14,
                    height: 40,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {offer.title}
                </div>
                <Link
                  href="/discover"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "#006B70",
                    textDecoration: "none",
                  }}
                >
                  View Offer <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
