"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const STATS = [
  { value: "12", label: "Regions of provider inventory to draw from" },
  { value: "9", label: "UNESCO World Heritage sites in your packages" },
  { value: "3", label: "Steps from registration to a verified badge" },
  { value: "0", label: "Cost to register as a founding agency" },
];

export function VisionSection() {
  return (
    <section style={{ position: "relative", padding: "clamp(88px, 12vw, 140px) clamp(20px, 6vw, 56px)", overflow: "hidden" }}>
      <Image
        src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2400&auto=format&fit=crop"
        alt="Grand Silk Road architecture across Uzbekistan"
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div style={{ position: "absolute", inset: 0, background: "rgba(10,35,32,0.88)" }} />

      <div style={{ position: "relative", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#C5A880",
              marginBottom: 24,
            }}
          >
            The Bigger Picture
          </div>
          <blockquote
            style={{
              fontFamily: "var(--font-serif), serif",
              fontWeight: 600,
              fontSize: "clamp(24px, 2.4vw + 12px, 38px)",
              lineHeight: 1.35,
              color: "#FFFFFF",
              margin: "0 0 28px",
            }}
          >
            &ldquo;Automate compliance with government systems to reduce friction for agencies, and connect every
            travel agency into a single, seamless ecosystem.&rdquo;
          </blockquote>
          <p style={{ fontFamily: "var(--font-sans), sans-serif", fontSize: 14.5, color: "rgba(255,255,255,0.55)", margin: "0 0 64px" }}>
            — Safron, platform mission
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 28 }}>
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <div style={{ fontFamily: "var(--font-serif), serif", fontWeight: 700, fontSize: "clamp(30px, 2.4vw + 14px, 44px)", color: "#C5A880", lineHeight: 1.1, marginBottom: 8 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
