"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { Destination } from "@repo/database";

interface Props {
  destinations: Destination[];
}

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1733586092622-1b3201e802a5?q=80&w=700",
  "https://images.unsplash.com/photo-1557841621-d9f6673405ed?q=80&w=700",
  "https://images.unsplash.com/photo-1705077016015-031da0aa8fa4?q=80&w=700",
  "https://images.unsplash.com/photo-1744873332054-d982edc655dd?q=80&w=700",
];

// Falls back to a curated Silk Road photo if a destination's own image_url 404s —
// some seeded DB records point at dead links, and a broken-image icon looks worse
// than a generic (but real) Uzbekistan photo.
function CardPhoto({ src, fallback, alt }: { src: string; fallback: string; alt: string }) {
  const [errored, setErrored] = useState(false);
  return (
    <Image
      src={errored ? fallback : src}
      alt={alt}
      fill
      className="object-cover discover-card-img"
      sizes="300px"
      onError={() => setErrored(true)}
    />
  );
}

export function DestinationsSection({ destinations }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const cards = destinations.slice(0, 16).map((d, i) => ({
    id: d.id,
    name: d.name,
    desc: d.description,
    image: d.image_url || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length],
    fallback: FALLBACK_IMAGES[i % FALLBACK_IMAGES.length],
    slug: d.slug,
  }));

  if (cards.length === 0) {
    return null;
  }

  const scrollBy = (delta: number) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section id="destinations" style={{ padding: "96px 0 80px", background: "#F9F8F5" }}>
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 40,
          paddingLeft: 56,
          paddingRight: 56,
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
            Verified & Supported by the Government of Uzbekistan
          </div>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 36,
              fontWeight: 600,
              color: "#0A2320",
            }}
          >
            Explore Silk Road Cities
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
          View all hidden gems →
        </Link>
      </div>

      {/* Horizontal swipeable card carousel */}
      <div style={{ position: "relative" }}>
        <div
          ref={scrollRef}
          className="scrollbar-hide snap-x-cards"
          style={{
            display: "flex",
            gap: 24,
            paddingTop: 16,
            paddingBottom: 28,
            paddingLeft: 56,
            paddingRight: 56,
            scrollPaddingLeft: 56,
            overflowX: "auto",
            overflowY: "hidden",
          }}
        >
          {cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              style={{ flexShrink: 0, width: 400 }}
            >
              <Link href={`/discover/${card.slug}`} style={{ textDecoration: "none", display: "block" }}>
                <div
                  className="silk-feature-card"
                  style={{
                    position: "relative",
                    borderRadius: 24,
                    background: "#0A2320",
                    boxShadow: "0 24px 48px -20px rgba(10,35,32,0.35)",
                    cursor: "pointer",
                    height: 520,
                    overflow: "hidden",
                  }}
                >
                  {/* Full-bleed photo */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                    }}
                    className="discover-card"
                  >
                    <CardPhoto src={card.image} fallback={card.fallback} alt={card.name} />
                  </div>

                  {/* Gradient scrim so text stays legible over any photo */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(180deg, rgba(10,35,32,0) 40%, rgba(10,35,32,0.55) 72%, rgba(10,35,32,0.92) 100%)",
                    }}
                  />

                  {/* Text overlay */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      padding: "28px 28px 30px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 28,
                        lineHeight: 1.2,
                        fontWeight: 600,
                        color: "#FFFFFF",
                        marginBottom: 10,
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
                        fontSize: 14,
                        color: "rgba(255,255,255,0.78)",
                        lineHeight: 1.5,
                        marginBottom: 18,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {card.desc || ""}
                    </div>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#FFFFFF",
                        fontFamily: "'Inter', sans-serif",
                        letterSpacing: "0.02em",
                        textTransform: "uppercase",
                        borderBottom: "1px solid rgba(255,255,255,0.5)",
                        paddingBottom: 4,
                      }}
                    >
                      Discover More
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Floating advance arrow */}
        <button
          onClick={() => scrollBy(424)}
          aria-label="Next destinations"
          className="carousel-arrow"
          style={{ position: "absolute", right: 24, top: "38%" }}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
