"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Destination } from "@repo/database";

interface Props {
  destinations: Destination[];
}

// Static hidden gems fallback data (matches design mockup)
const HIDDEN_GEMS = [
  {
    id: "gem-1",
    name: "Nurata Petroglyphs",
    desc: "Bronze-age rock carvings hidden in the Nuratau foothills.",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600",
  },
  {
    id: "gem-2",
    name: "Sentyab Village Bazaar",
    desc: "A dawn market where mountain honey meets Silk Road spice.",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=600",
  },
  {
    id: "gem-3",
    name: "Rabati Malik Caravanserai",
    desc: "Ruins of an 11th-century desert waystation near Navoi.",
    image:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=600",
  },
  {
    id: "gem-4",
    name: "Yangikazgan Salt Flats",
    desc: "A mirror-still stretch of the Kyzylkum at golden hour.",
    image:
      "https://images.unsplash.com/photo-1549558549-415fe4c37b60?q=80&w=600",
  },
];

export function DestinationsSection({ destinations }: Props) {
  // Use DB destinations if available, otherwise fallback to hidden gems
  const cards =
    destinations.length >= 4
      ? destinations.slice(0, 4).map((d, i) => ({
          id: d.id,
          name: d.name,
          desc: d.description || HIDDEN_GEMS[i % HIDDEN_GEMS.length].desc,
          image:
            d.image_url || HIDDEN_GEMS[i % HIDDEN_GEMS.length].image,
          slug: d.slug,
        }))
      : HIDDEN_GEMS.map((g) => ({ ...g, slug: undefined }));

  return (
    <section
      id="destinations"
      style={{ padding: "96px 56px 80px", background: "#F9F8F5" }}
    >
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
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
              color: "#006B70",
              marginBottom: 12,
            }}
          >
            Curated by Admins
          </div>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 36,
              fontWeight: 600,
              color: "#0A2320",
            }}
          >
            Hidden Uzbekistan
          </div>
        </div>
        <Link
          href="/discover"
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#006B70",
            cursor: "pointer",
            textDecoration: "none",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          View all hidden gems →
        </Link>
      </div>

      {/* 4-column grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 24,
        }}
      >
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.55, delay: i * 0.1 }}
          >
            <Link
              href={card.slug ? `/discover?destination=${card.slug}` : "/discover"}
              style={{ textDecoration: "none", display: "block" }}
            >
              <div
                style={{
                  borderRadius: 8,
                  overflow: "hidden",
                  position: "relative",
                  height: 380,
                  boxShadow: "0 16px 32px -12px rgba(10,35,32,0.2)",
                  cursor: "pointer",
                }}
                className="gem-card"
              >
                <Image
                  src={card.image}
                  alt={card.name}
                  fill
                  className="object-cover gem-card-img"
                  sizes="(max-width: 1280px) 25vw, 300px"
                />
                {/* Gradient overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(10,35,32,0) 45%, rgba(10,35,32,0.88) 100%)",
                    pointerEvents: "none",
                  }}
                />
                {/* Text content */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: 20,
                    pointerEvents: "none",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 20,
                      fontWeight: 600,
                      color: "#FFFFFF",
                    }}
                  >
                    {card.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: "rgba(249,248,245,0.75)",
                      marginTop: 4,
                      lineHeight: 1.5,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {card.desc}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <style>{`
        .gem-card-img { transition: transform 0.7s ease-out; }
        .gem-card:hover .gem-card-img { transform: scale(1.05); }
      `}</style>
    </section>
  );
}
