"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

// Editorial content — generated in the spirit of the site's travel-magazine voice.
const STORIES = [
  {
    id: "story-1",
    category: "Adventure, Families",
    title: "48 Hours in the Nuratau Mountains, By Yurt and On Foot",
    image:
      "https://images.unsplash.com/photo-1595496358672-2d175fcdd01a?q=80&w=1200",
  },
  {
    id: "story-2",
    category: "Culture & History",
    title: "The Master Potters Keeping Rishtan's Blue Ceramics Alive",
    image:
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=1200",
  },
  {
    id: "story-3",
    category: "Food & Drink",
    title: "How to Eat Your Way Through the Siyob Bazaar",
    image:
      "https://images.unsplash.com/photo-1629649407271-2dac934c1f1b?q=80&w=1200",
  },
];

export function StoriesSection() {
  return (
    <section style={{ padding: "88px 0 96px", background: "#F9F8F5" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 32,
          padding: "0 56px",
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
            Editorial
          </div>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 36,
              fontWeight: 600,
              color: "#0A2320",
            }}
          >
            Stories and Insights
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
          Read all stories →
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 3,
        }}
      >
        {STORIES.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Link href="/discover" style={{ textDecoration: "none", display: "block" }}>
              <div className="discover-card" style={{ position: "relative", height: 420, overflow: "hidden" }}>
                <Image
                  src={s.image}
                  alt={s.title}
                  fill
                  className="object-cover discover-card-img"
                  sizes="(max-width: 1280px) 33vw, 420px"
                />
                <div className="overlay-gradient-bottom" style={{ position: "absolute", inset: 0 }} />
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 24 }}>
                  <div
                    style={{
                      fontSize: 10.5,
                      fontWeight: 500,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#C5A880",
                      marginBottom: 8,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {s.category}
                  </div>
                  <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.5)", marginBottom: 10 }} />
                  <div
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 19,
                      fontWeight: 600,
                      color: "#FFFFFF",
                      lineHeight: 1.35,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {s.title}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
