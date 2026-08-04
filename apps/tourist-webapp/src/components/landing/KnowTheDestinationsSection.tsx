"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sun, CloudSun } from "lucide-react";
import type { Destination } from "@repo/database";

interface Props {
  destinations: Destination[];
}

const FALLBACK_LIST = [
  { name: "Tashkent", tags: "Urban, Food", temp: "34°" },
  { name: "Samarkand", tags: "Culture & History", temp: "36°" },
  { name: "Bukhara", tags: "Culture, Bazaars", temp: "35°" },
  { name: "Khiva", tags: "Heritage, Desert", temp: "37°" },
  { name: "Chimgan", tags: "Nature, Adventure", temp: "24°" },
  { name: "Fergana Valley", tags: "Crafts, Food", temp: "33°" },
];

// Stylized, illustrative pin positions (percentage of the map frame) — not to geographic scale.
const PINS = [
  { name: "Tashkent", top: "20%", left: "68%", featured: true },
  { name: "Samarkand", top: "48%", left: "44%", featured: true },
  { name: "Bukhara", top: "55%", left: "24%", featured: true },
  { name: "Khiva", top: "38%", left: "8%", featured: false },
  { name: "Chimgan", top: "12%", left: "76%", featured: false },
  { name: "Fergana Valley", top: "26%", left: "88%", featured: false },
  { name: "Nurata", top: "38%", left: "52%", featured: false },
];

export function KnowTheDestinationsSection({ destinations }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  const list =
    destinations.length >= 4
      ? destinations.slice(0, 6).map((d, i) => ({
          name: d.name,
          tags: d.region || FALLBACK_LIST[i % FALLBACK_LIST.length].tags,
          temp: FALLBACK_LIST[i % FALLBACK_LIST.length].temp,
          image: d.image_url,
        }))
      : FALLBACK_LIST.map((f) => ({ ...f, image: null as string | null }));

  return (
    <section style={{ padding: "88px 56px 96px", background: "#FFFFFF" }}>
      <div style={{ marginBottom: 40 }}>
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
          Interactive Map
        </div>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 36,
            fontWeight: 600,
            color: "#0A2320",
          }}
        >
          Know the Destinations
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 32 }}>
        {/* Left: scrollable destination list */}
        <div
          className="scrollbar-hide"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            maxHeight: 480,
            overflowY: "auto",
            paddingRight: 4,
          }}
        >
          {list.map((item) => (
            <div
              key={item.name}
              onMouseEnter={() => setHovered(item.name)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 10,
                borderRadius: 10,
                border: "1px solid #EFEDE7",
                background: hovered === item.name ? "#F9F8F5" : "#FFFFFF",
                transition: "background 0.2s",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 8,
                  overflow: "hidden",
                  position: "relative",
                  flexShrink: 0,
                  background: "#EFEDE7",
                }}
              >
                {item.image && (
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="52px" />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 14.5,
                      fontWeight: 600,
                      color: "#0A2320",
                    }}
                  >
                    {item.name}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      fontSize: 12,
                      color: "#C1592A",
                      flexShrink: 0,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    <Sun size={12} /> {item.temp}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "rgba(10,35,32,0.5)",
                    marginTop: 2,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {item.tags}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: stylized illustrated map */}
        <div
          style={{
            position: "relative",
            borderRadius: 20,
            overflow: "hidden",
            background: "#F3F1EA",
            minHeight: 480,
            border: "1px solid #EFEDE7",
          }}
        >
          {/* Illustrative landmass blob */}
          <svg
            viewBox="0 0 400 300"
            preserveAspectRatio="none"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          >
            <path
              d="M20,120 C40,70 110,40 170,55 C230,20 320,35 360,90 C390,120 380,170 340,190 C360,220 320,260 260,250 C220,275 140,270 110,235 C60,240 15,200 25,160 C0,150 5,130 20,120 Z"
              fill="#EAE6DA"
              stroke="#006B70"
              strokeOpacity="0.35"
              strokeWidth="1.5"
            />
          </svg>

          {/* Pins */}
          {PINS.map((pin) => (
            <div
              key={pin.name}
              onMouseEnter={() => setHovered(pin.name)}
              onMouseLeave={() => setHovered(null)}
              style={{
                position: "absolute",
                top: pin.top,
                left: pin.left,
                transform: "translate(-50%, -50%)",
                zIndex: hovered === pin.name ? 3 : 2,
              }}
            >
              <div
                style={{
                  width: pin.featured ? 16 : 11,
                  height: pin.featured ? 16 : 11,
                  borderRadius: "50%",
                  background: pin.featured ? "#006B70" : "#C1592A",
                  border: "2.5px solid #FFFFFF",
                  boxShadow: "0 2px 8px rgba(10,35,32,0.3)",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  transform: hovered === pin.name ? "scale(1.25)" : "scale(1)",
                }}
              />
              {hovered === pin.name && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    position: "absolute",
                    bottom: "calc(100% + 8px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#FFFFFF",
                    borderRadius: 8,
                    padding: "8px 12px",
                    boxShadow: "0 8px 24px rgba(10,35,32,0.2)",
                    whiteSpace: "nowrap",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0A2320" }}>{pin.name}</div>
                </motion.div>
              )}
            </div>
          ))}

          {/* CTA overlay */}
          <div style={{ position: "absolute", bottom: 20, right: 20, zIndex: 4 }}>
            <Link href="/map" className="btn-teal" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <CloudSun size={14} /> Open Full Survival Map
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
