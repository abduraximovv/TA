"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Itinerary } from "@repo/types";

interface Props {
  itineraries: Itinerary[];
}

// Fallback package data matching the design, used only when fewer than 4 real packages exist yet
const FALLBACK_PACKAGES = [
  {
    id: "pkg-1",
    name: "Classic Silk Road, 7 Days",
    desc: "Tashkent, Samarkand, Bukhara, Khiva in one seamless route.",
    duration: "7 DAYS",
    price: "$890",
    image:
      "https://images.unsplash.com/photo-1556109153-a5e59e012b4a?q=80&w=640",
  },
  {
    id: "pkg-2",
    name: "Mountains & Monasteries, 5 Days",
    desc: "Chimgan trekking paired with Silk Road heritage stops.",
    duration: "5 DAYS",
    price: "$620",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=640",
  },
  {
    id: "pkg-3",
    name: "Culinary Uzbekistan, 4 Days",
    desc: "Plov masterclasses, bazaars, and family dining rooms.",
    duration: "4 DAYS",
    price: "$450",
    image:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=640",
  },
  {
    id: "pkg-4",
    name: "Desert & Caravanserais, 6 Days",
    desc: "Kyzylkum crossings and ancient trade-route stopovers.",
    duration: "6 DAYS",
    price: "$710",
    image:
      "https://images.unsplash.com/photo-1549558549-415fe4c37b60?q=80&w=640",
  },
];

// Manual thousands-separator instead of Intl.NumberFormat("uz-UZ"): Node's server-side ICU and
// the browser's ICU format that locale differently (space vs comma grouping), which caused a
// hydration text mismatch since this renders during SSR.
function formatPrice(amount: number): string {
  return Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function formatDuration(startDate: string | null, endDate: string | null): string {
  if (!startDate || !endDate) return "MULTI-DAY";
  const days = Math.round(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;
  return days > 0 ? `${days} DAYS` : "MULTI-DAY";
}

export function PackagesSection({ itineraries }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const cards =
    itineraries.length >= 4
      ? itineraries.slice(0, 8).map((it, i) => ({
          id: it.id,
          name: it.title,
          desc: it.description || FALLBACK_PACKAGES[i % FALLBACK_PACKAGES.length].desc,
          duration: formatDuration(it.start_date, it.end_date),
          price: `${formatPrice(it.total_price)} ${it.currency}`,
          image: FALLBACK_PACKAGES[i % FALLBACK_PACKAGES.length].image,
          href: `/packages/${it.id}`,
        }))
      : FALLBACK_PACKAGES.map((p) => ({ ...p, href: "/packages" }));

  return (
    <section
      style={{ padding: "0 0 88px", background: "#FFFFFF" }}
    >
      {/* Header */}
      <div style={{ padding: "88px 56px 40px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#006B70",
                marginBottom: 12,
              }}
            >
              By Verified Travel Agencies
            </div>
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 36,
                fontWeight: 600,
                color: "#0A2320",
              }}
            >
              Curated Packages
            </div>
          </div>
          <Link
            href="/packages"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#006B70",
              cursor: "pointer",
              textDecoration: "none",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Browse all packages →
          </Link>
        </div>
      </div>

      {/* Horizontal scroll carousel */}
      <div
        ref={scrollRef}
        style={{
          display: "flex",
          gap: 24,
          padding: "0 56px",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
        className="scrollbar-hide"
      >
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            style={{ flexShrink: 0 }}
          >
            <Link
              href={card.href}
              style={{ textDecoration: "none", display: "block" }}
            >
              <div
                style={{
                  width: 320,
                  borderRadius: 8,
                  overflow: "hidden",
                  border: "1px solid #EFEDE7",
                  boxShadow: "0 4px 16px rgba(10,35,32,0.05)",
                  background: "#FFFFFF",
                  cursor: "pointer",
                  transition: "box-shadow 0.3s",
                }}
                className="pkg-card"
              >
                {/* Image */}
                <div style={{ height: 200, position: "relative" }}>
                  <Image
                    src={card.image}
                    alt={card.name}
                    fill
                    className="object-cover pkg-card-img"
                    sizes="320px"
                  />
                  {/* Duration badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: 14,
                      left: 14,
                      padding: "6px 12px",
                      background: "rgba(10,35,32,0.7)",
                      backdropFilter: "blur(8px)",
                      borderRadius: 100,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                      color: "#F9F8F5",
                    }}
                  >
                    {card.duration}
                  </div>
                </div>

                {/* Card body */}
                <div style={{ padding: 20 }}>
                  <div
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 18,
                      fontWeight: 600,
                      color: "#0A2320",
                      marginBottom: 8,
                    }}
                  >
                    {card.name}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "rgba(10,35,32,0.55)",
                      lineHeight: 1.5,
                      marginBottom: 16,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {card.desc}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 14,
                        color: "#006B70",
                      }}
                    >
                      {card.price}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#0A2320",
                        border: "1px solid rgba(10,35,32,0.2)",
                        borderRadius: 100,
                        padding: "6px 14px",
                        cursor: "pointer",
                        fontFamily: "'Inter', sans-serif",
                        transition: "background 0.2s",
                      }}
                      className="pkg-details-btn"
                    >
                      Details
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <style>{`
        .pkg-card-img { transition: transform 0.7s ease-out; }
        .pkg-card:hover .pkg-card-img { transform: scale(1.05); }
        .pkg-card:hover { box-shadow: 0 12px 32px rgba(10,35,32,0.12) !important; }
        .pkg-details-btn:hover { background: #F9F8F5; }
      `}</style>
    </section>
  );
}
