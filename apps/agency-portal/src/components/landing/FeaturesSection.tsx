"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PackagePlus, Layers, Inbox, Star, ShieldCheck, Gauge, Check } from "lucide-react";

const MAIN_FEATURES = [
  {
    icon: PackagePlus,
    eyebrow: "Your Inventory, Digitized",
    title: "Turn Every Service Into a Bookable Listing",
    body:
      "Build out your agency's own tours, stays, and experiences with photos, pricing in UZS or USD, and category tagging. Every listing is ready to sell the moment you publish it — no more re-explaining the same tour over email.",
    points: ["Photos, pricing & category in one form", "Live preview before publishing", "Full edit and archive control"],
    image: "https://images.unsplash.com/photo-1541364501234-7096e2ccb898?q=80&w=1400&auto=format&fit=crop",
    alt: "An agency team planning a multi-day Silk Road itinerary",
  },
  {
    icon: Layers,
    eyebrow: "Multi-Day Packages",
    title: "Bundle Full Itineraries in Minutes, Not Hours",
    body:
      "Combine your own services into dated, multi-day packages with a checkbox — set a date range, adjust per-item pricing, and watch the total calculate itself. Track each package as draft, active, or completed.",
    points: ["Auto-calculated total pricing", "Draft → Active → Completed tracking", "Built from services you already listed"],
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1400&auto=format&fit=crop",
    alt: "A finished multi-day Uzbekistan itinerary package",
  },
  {
    icon: Inbox,
    eyebrow: "One Booking Inbox",
    title: "Every Booking Request, in One Place, in Real Time",
    body:
      "New bookings land in your dashboard the instant a traveler requests them. Accept or decline with a reason in one click — the traveler is notified automatically, and the full status history is logged for your records.",
    points: ["Live updates — no refreshing", "Accept / decline with logged history", "Automatic traveler notification"],
    image: "https://images.unsplash.com/photo-1629649407271-2dac934c1f1b?q=80&w=1400&auto=format&fit=crop",
    alt: "A bazaar food tour experience, the kind of service an agency lists on Safron",
  },
];

const SUPPORTING_FEATURES = [
  {
    icon: Star,
    title: "Reply to Every Review",
    body: "Every rating left on your packages appears in one place — respond publicly and build a reputation that closes the next booking.",
  },
  {
    icon: ShieldCheck,
    title: "A Verified Agency Badge",
    body: "Register and track your approval status live, step by step, then carry a verified badge that signals trust to every traveler you work with.",
  },
  {
    icon: Gauge,
    title: "A Live Snapshot of Your Agency",
    body: "Your dashboard surfaces your package count, average rating, and pending bookings the moment you log in — no digging, no exports.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" style={{ background: "#F9F8F5", padding: "clamp(72px, 10vw, 120px) clamp(20px, 6vw, 56px)" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: 640, marginBottom: 80 }}
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
            Live Today, Already Working
          </div>
          <h2
            style={{
              fontFamily: "var(--font-serif), serif",
              fontWeight: 600,
              fontSize: "clamp(30px, 2.6vw + 14px, 46px)",
              lineHeight: 1.15,
              color: "#0A2320",
              margin: "0 0 20px",
            }}
          >
            One Dashboard, Instead of Five Different Tools.
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: "rgba(10,35,32,0.65)", margin: 0 }}>
            Not a prototype, not a promise — this is the platform already running in every agency&rsquo;s dashboard today.
          </p>
        </motion.div>

        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(56px, 8vw, 96px)" }}>
          {MAIN_FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            const reversed = i % 2 === 1;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 lg:grid-cols-2"
                style={{ gap: "clamp(32px, 5vw, 64px)", alignItems: "center" }}
              >
                <div style={{ order: reversed ? 2 : 1 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "#0A2320",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 22,
                    }}
                  >
                    <Icon size={21} color="#C5A880" />
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: 11.5,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#006B70",
                      marginBottom: 12,
                      fontWeight: 600,
                    }}
                  >
                    {feature.eyebrow}
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--font-serif), serif",
                      fontWeight: 600,
                      fontSize: "clamp(23px, 1.4vw + 14px, 32px)",
                      lineHeight: 1.25,
                      color: "#0A2320",
                      margin: "0 0 16px",
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p style={{ fontSize: 15.5, lineHeight: 1.7, color: "rgba(10,35,32,0.65)", margin: "0 0 22px" }}>
                    {feature.body}
                  </p>
                  <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                    {feature.points.map((point) => (
                      <li key={point} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Check size={16} color="#006B70" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: 14.5, color: "#0A2320", fontWeight: 500 }}>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  style={{
                    order: reversed ? 1 : 2,
                    position: "relative",
                    height: "clamp(280px, 32vw, 400px)",
                    borderRadius: 20,
                    overflow: "hidden",
                    boxShadow: "0 24px 48px -20px rgba(10,35,32,0.35)",
                  }}
                >
                  <Image src={feature.image} alt={feature.alt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 24, marginTop: "clamp(56px, 8vw, 96px)" }}>
          {SUPPORTING_FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                style={{
                  borderRadius: 16,
                  background: "#FFFFFF",
                  border: "1px solid #EFEDE7",
                  boxShadow: "0 8px 24px -16px rgba(10,35,32,0.2)",
                  padding: "28px 26px",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    background: "#F9F8F5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#006B70",
                    marginBottom: 18,
                  }}
                >
                  <Icon size={19} />
                </div>
                <h4 style={{ fontFamily: "var(--font-serif), serif", fontWeight: 600, fontSize: 18, color: "#0A2320", margin: "0 0 10px" }}>
                  {feature.title}
                </h4>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(10,35,32,0.6)", margin: 0 }}>{feature.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
