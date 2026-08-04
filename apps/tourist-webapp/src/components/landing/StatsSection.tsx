"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Landmark, MapPinned, Users, Compass, ChevronRight } from "lucide-react";

const STATS = [
  { id: "s1", value: "4,000+", label: "Years of Silk Road History", icon: Landmark },
  { id: "s2", value: "9", label: "UNESCO World Heritage Sites", icon: MapPinned },
  { id: "s3", value: "12", label: "Regions Ready to Explore", icon: Compass },
  { id: "s4", value: "1,000+", label: "Verified Local Providers", icon: Users },
];

const TOP_STORIES = [
  "48 Hours in the Nuratau Mountains",
  "The Master Potters of Rishtan",
  "How to Eat the Siyob Bazaar",
  "Sleeping Inside Itchan Kala's Walls",
  "A First-Timer's Guide to Plov Etiquette",
];

export function StatsSection() {
  return (
    <section style={{ padding: "88px 56px 96px", background: "#F9F8F5" }}>
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
          By the Numbers
        </div>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 36,
            fontWeight: 600,
            color: "#0A2320",
          }}
        >
          Uzbekistan in Numbers
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 20 }}>
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="ribbon-card"
              style={{
                borderRadius: 14,
                background: "#FFFFFF",
                border: "1px solid #EFEDE7",
                padding: "22px 20px 22px 30px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                height: 168,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#F9F8F5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#006B70",
                }}
              >
                <Icon size={18} />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 30,
                    fontWeight: 700,
                    color: "#006B70",
                    lineHeight: 1.1,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "rgba(10,35,32,0.6)",
                    marginTop: 6,
                    lineHeight: 1.4,
                    fontFamily: "'Inter', sans-serif",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Larger "most visited stories" card, spanning the remaining column rhythm */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.32 }}
          className="ribbon-card"
          style={{
            gridColumn: "span 5",
            borderRadius: 14,
            background: "#FFFFFF",
            border: "1px solid #EFEDE7",
            padding: "26px 26px 26px 34px",
          }}
        >
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18,
              fontWeight: 600,
              color: "#0A2320",
              marginBottom: 16,
            }}
          >
            204+ Stories to Inspire You
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
            {TOP_STORIES.map((title, i) => (
              <Link
                key={title}
                href="/discover"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  textDecoration: "none",
                }}
              >
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    color: "#C5A880",
                    flexShrink: 0,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "#0A2320",
                    lineHeight: 1.4,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {title}
                </div>
                <ChevronRight size={12} color="rgba(10,35,32,0.4)" style={{ flexShrink: 0, marginLeft: "auto" }} />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
