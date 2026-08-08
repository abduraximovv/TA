"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Footprints } from "lucide-react";
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
    city: "Tashkent → Khiva",
    activities: 240,
    image:
      "https://images.unsplash.com/photo-1733586092622-1b3201e802a5?q=80&w=640",
  },
  {
    id: "pkg-2",
    name: "Mountains & Monasteries, 5 Days",
    desc: "Chimgan trekking paired with Silk Road heritage stops.",
    duration: "5 DAYS",
    price: "$620",
    city: "Chimgan Highlands",
    activities: 95,
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=640",
  },
  {
    id: "pkg-3",
    name: "Culinary Uzbekistan, 4 Days",
    desc: "Plov masterclasses, bazaars, and family dining rooms.",
    duration: "4 DAYS",
    price: "$450",
    city: "Fergana Valley",
    activities: 60,
    image:
      "https://images.unsplash.com/photo-1671048116858-e8ef69175b2d?q=80&w=640",
  },
  {
    id: "pkg-4",
    name: "Desert & Caravanserais, 6 Days",
    desc: "Kyzylkum crossings and ancient trade-route stopovers.",
    duration: "6 DAYS",
    price: "$710",
    city: "Kyzylkum Desert",
    activities: 130,
    image:
      "https://images.unsplash.com/photo-1750859876385-c7c9acd92233?q=80&w=640",
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
          city: FALLBACK_PACKAGES[i % FALLBACK_PACKAGES.length].city,
          activities: FALLBACK_PACKAGES[i % FALLBACK_PACKAGES.length].activities,
          href: `/packages/${it.id}`,
        }))
      : FALLBACK_PACKAGES.map((p) => ({ ...p, href: "/packages" }));

  return (
    <section
      style={{ padding: "0 0 88px", background: "#FFFFFF" }}
    >
      {/* Header */}
      <div style={{ padding: "clamp(56px, 10vw, 88px) var(--section-padding-x) 40px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
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
                fontSize: "var(--text-h2)",
                fontWeight: 600,
                color: "#0A2320",
              }}
            >
              Book Your Next Adventure
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
          padding: "16px var(--section-padding-x) 28px",
          overflowX: "auto",
          overflowY: "hidden",
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
                  width: "clamp(220px, 66vw, 320px)",
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
                <div style={{ height: "clamp(140px, 41vw, 200px)", position: "relative" }}>
                  <Image
                    src={card.image}
                    alt={card.name}
                    fill
                    className="object-cover pkg-card-img"
                    sizes="320px"
                  />
                  {/* Location, top-left */}
                  <div
                    style={{
                      position: "absolute",
                      top: 14,
                      left: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "6px 12px",
                      background: "rgba(10,35,32,0.7)",
                      backdropFilter: "blur(8px)",
                      borderRadius: 100,
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#F9F8F5",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <MapPin size={11} /> {card.city}
                  </div>

                  {/* Activity count, top-right */}
                  <div
                    style={{
                      position: "absolute",
                      top: 14,
                      right: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "6px 10px",
                      background: "rgba(249,248,245,0.9)",
                      backdropFilter: "blur(8px)",
                      borderRadius: 100,
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#0A2320",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    <Footprints size={11} /> {card.activities}
                  </div>

                  {/* Duration badge */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 14,
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

                {/* Card body — fixed height name/desc so every card in the row lines up */}
                <div style={{ padding: 20 }}>
                  <div
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 18,
                      lineHeight: 1.25,
                      fontWeight: 600,
                      color: "#0A2320",
                      marginBottom: 8,
                      height: 45,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
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
                      height: 39,
                      fontFamily: "'Inter', sans-serif",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
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
