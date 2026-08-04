"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Landmark, Stamp, BookOpen, Bus } from "lucide-react";

const GUIDES = [
  { id: "g1", title: "About Uzbekistan", href: "/about", icon: Landmark, color: "#006B70" },
  { id: "g2", title: "Visa Regulations", href: "/about", icon: Stamp, color: "#C1592A" },
  { id: "g3", title: "Travel Guide", href: "/discover", icon: BookOpen, color: "#C5A880" },
  { id: "g4", title: "Getting Around", href: "/map", icon: Bus, color: "#A63446" },
];

export function KnowBeforeYouGoSection() {
  return (
    <section style={{ position: "relative", padding: "88px 56px 96px", background: "#FFFFFF", overflow: "hidden" }}>
      {/* Faint arabesque watermark bleeding from the corner */}
      <div
        className="pattern-watermark"
        style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 340,
          height: 340,
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", marginBottom: 40 }}>
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
          Plan Ahead
        </div>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 36,
            fontWeight: 600,
            color: "#0A2320",
          }}
        >
          Know Before You Go
        </div>
      </div>

      <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32 }}>
        {GUIDES.map((g, i) => {
          const Icon = g.icon;
          return (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: `${g.color}14`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: g.color,
                  marginBottom: 18,
                }}
              >
                <Icon size={24} />
              </div>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 17,
                  fontWeight: 600,
                  color: "#0A2320",
                  marginBottom: 10,
                }}
              >
                {g.title}
              </div>
              <Link
                href={g.href}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#006B70",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                Learn More
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
