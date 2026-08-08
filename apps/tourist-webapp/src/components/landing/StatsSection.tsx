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



export function StatsSection() {
  return (
    <section style={{ padding: "clamp(56px, 10vw, 88px) var(--section-padding-x) clamp(56px, 10vw, 96px)", background: "#F9F8F5" }}>
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
            fontSize: "var(--text-h2)",
            fontWeight: 600,
            color: "#0A2320",
          }}
        >
          Uzbekistan in Numbers
        </div>
      </div>

      <div className="stats-grid">
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
                padding: "16px 14px 16px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                minHeight: 118,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#F9F8F5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#006B70",
                }}
              >
                <Icon size={15} />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "clamp(22px, 5vw, 30px)",
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
      </div>

    </section>
  );
}
