"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { LayoutGrid, BellRing, Star, ShieldCheck, Gauge, Smartphone, Check } from "lucide-react";

const MAIN_FEATURES = [
  {
    icon: LayoutGrid,
    eyebrow: "Your Digital Shopfront",
    title: "A Listing Worth Booking, Built in Minutes",
    body:
      "Upload photos, set your price in UZS or USD, and describe what makes your experience worth traveling for. Choose from ten real categories — tours, stays, food, gastronomy, artisan crafts, adventure, transport, nature, bazaars and more — so travelers searching for exactly what you offer can find you.",
    points: ["Up to 5 photos per listing", "Your own pricing & currency", "Live preview before you publish"],
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=1400&auto=format&fit=crop",
    alt: "A Rishtan ceramic artisan's workshop — the kind of listing providers build on Safron",
  },
  {
    icon: BellRing,
    eyebrow: "Real-Time Booking Inbox",
    title: "Bookings Land in Your Pocket — Not a Missed Call",
    body:
      "The moment a traveler requests your service, it appears in your bookings list in real time. One tap to Accept, one tap to Decline — the traveler is notified automatically either way. No more losing income to a call you didn't hear in the desert.",
    points: ["Live updates — no refreshing", "One-tap Accept / Decline", "Automatic traveler notification"],
    image: "https://images.unsplash.com/photo-1621425022689-308a7b7691a3?q=80&w=1400&auto=format&fit=crop",
    alt: "A phone showing an incoming booking request, used at a yurt camp",
  },
  {
    icon: Star,
    eyebrow: "Reputation That Compounds",
    title: "Every Five-Star Review Builds Your Business",
    body:
      "Travelers rate and review your experience after their visit — and you can reply publicly to every single one. A strong review history is the difference between being a hidden gem and being the first result a traveler sees.",
    points: ["Public star ratings & comments", "Reply to every review", "Reviews shown right on your profile"],
    image: "https://images.unsplash.com/photo-1671048116858-e8ef69175b2d?q=80&w=1400&auto=format&fit=crop",
    alt: "A plov masterclass host serving travelers, the kind of experience that earns reviews",
  },
];

const SUPPORTING_FEATURES = [
  {
    icon: ShieldCheck,
    title: "Wear the Verified Badge",
    body: "Our team reviews every new provider. Once approved, a verified badge follows your profile everywhere on Safron — a signal of trust travelers and agencies look for first.",
  },
  {
    icon: Gauge,
    title: "Your Business, At a Glance",
    body: "Your dashboard shows your active listings, your average rating, and your total reviews the moment you log in — no digging required.",
  },
  {
    icon: Smartphone,
    title: "No App Store. No Setup.",
    body: "Add Safron to your home screen in one tap. It opens instantly, works on modest hardware, and needs almost nothing from your data plan.",
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
            Everything You Need to Turn Visits Into Income.
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: "rgba(10,35,32,0.65)", margin: 0 }}>
            Not a prototype, not a promise — these are the tools already running in every provider&rsquo;s dashboard today.
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
