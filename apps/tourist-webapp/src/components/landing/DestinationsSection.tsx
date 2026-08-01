"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Destination } from "@repo/database";

interface Props {
  destinations: Destination[];
}

export function DestinationsSection({ destinations }: Props) {
  const cards = destinations.slice(0, 4).map((d) => ({
    id: d.id,
    name: d.name,
    desc: d.description,
    image: d.image_url || "https://images.unsplash.com/photo-1591901206811-cb341f9e6da8?q=80&w=600",
    slug: d.slug,
  }));

  if (cards.length === 0) {
    return null;
  }

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
              href={`/discover/${card.slug}`}
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
                className="discover-card"
              >
                <Image
                  src={card.image}
                  alt={card.name}
                  fill
                  className="object-cover discover-card-img"
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
                  {card.desc && (
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
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
