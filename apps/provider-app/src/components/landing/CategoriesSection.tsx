"use client";

import React from "react";
import { motion } from "framer-motion";
import { Tent, Palette, UtensilsCrossed, Mountain, Car, ShoppingBag, Landmark, Compass } from "lucide-react";

const CATEGORIES = [
  { icon: Tent, label: "Yurt & Homestay Hosts" },
  { icon: Palette, label: "Artisans & Craftspeople" },
  { icon: UtensilsCrossed, label: "Food & Culinary Hosts" },
  { icon: Mountain, label: "Trekking & Adventure Guides" },
  { icon: Car, label: "Drivers & Transport" },
  { icon: ShoppingBag, label: "Bazaar Vendors" },
  { icon: Landmark, label: "Cultural Experiences" },
  { icon: Compass, label: "Tours & Everything Else" },
];

export function CategoriesSection() {
  return (
    <section style={{ background: "#FFFFFF", padding: "clamp(64px, 8vw, 100px) clamp(20px, 6vw, 56px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#006B70",
              marginBottom: 16,
            }}
          >
            Built for Every Kind of Provider
          </div>
          <h2
            style={{
              fontFamily: "var(--font-serif), serif",
              fontWeight: 600,
              fontSize: "clamp(28px, 2.2vw + 14px, 40px)",
              lineHeight: 1.2,
              color: "#0A2320",
              margin: "0 auto 56px",
              maxWidth: 620,
            }}
          >
            Whatever You Offer, There&rsquo;s a Home for It Here.
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" style={{ gap: 16 }}>
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: (i % 4) * 0.06 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 14,
                  padding: "28px 16px",
                  borderRadius: 16,
                  border: "1px solid #EFEDE7",
                  background: "#F9F8F5",
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "#FFFFFF",
                    border: "1px solid #EFEDE7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#006B70",
                  }}
                >
                  <Icon size={22} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#0A2320", lineHeight: 1.35 }}>{cat.label}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
