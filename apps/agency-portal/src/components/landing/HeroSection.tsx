"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Building2, Clock } from "lucide-react";

const TRUST_ITEMS = [
  { icon: Building2, label: "Free for agencies to register" },
  { icon: ShieldCheck, label: "Verified agency badge" },
  { icon: Clock, label: "Live in your dashboard today" },
];

export function HeroSection() {
  return (
    <section style={{ position: "relative", width: "100%", minHeight: "100vh", overflow: "hidden" }}>
      <Image
        src="https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?q=80&w=2400&auto=format&fit=crop"
        alt="Majestic Samarkand architecture in Uzbekistan"
        fill
        priority
        className="object-cover"
        sizes="100vw"
        quality={90}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(115deg, rgba(10,35,32,0.92) 0%, rgba(10,35,32,0.75) 40%, rgba(10,35,32,0.4) 70%, rgba(10,35,32,0.35) 100%)",
        }}
      />

      <div
        className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] items-center"
        style={{ position: "relative", zIndex: 2, minHeight: "100vh", padding: "140px clamp(20px, 6vw, 56px) 64px", gap: 40 }}
      >
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          <div
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#C5A880",
              marginBottom: 22,
            }}
          >
            Safron · For Travel Agencies &amp; DMCs
          </div>

          <h1
            style={{
              fontFamily: "var(--font-serif), serif",
              fontWeight: 700,
              fontSize: "clamp(34px, 3.6vw + 16px, 60px)",
              lineHeight: 1.1,
              color: "#FFFFFF",
              margin: "0 0 24px",
            }}
          >
            Less Time on the Phone. More Time Building Trips.
          </h1>

          <p style={{ fontSize: "clamp(16px, 1vw + 10px, 18.5px)", lineHeight: 1.65, color: "rgba(255,255,255,0.88)", margin: "0 0 36px", maxWidth: 560 }}>
            Agencies lose hours every week to phone calls, spreadsheets, and paperwork just to confirm what&rsquo;s
            available. Safron Agency Portal puts your listings, your packages, and every booking in one live
            dashboard — built for how DMCs actually work in Uzbekistan.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, marginBottom: 48 }}>
            <Link href="/auth/register" className="btn-hero-gold-a" style={{ textDecoration: "none" }}>
              Register Your Agency <ArrowRight size={17} />
            </Link>
            <a href="#how-it-works" className="btn-hero-outline-a" style={{ textDecoration: "none" }}>
              See How It Works
            </a>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel-agency"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px 32px",
              borderRadius: 14,
              padding: "16px 22px",
              width: "fit-content",
              maxWidth: "100%",
            }}
          >
            {TRUST_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Icon size={16} color="#C5A880" />
                  <span style={{ fontFamily: "var(--font-sans), sans-serif", fontSize: 13.5, color: "rgba(255,255,255,0.92)", whiteSpace: "nowrap" }}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Stylized dashboard preview -- an illustrative mock of the real booking inbox, not a literal screenshot */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: 1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:block"
          style={{
            background: "#FFFFFF",
            borderRadius: 18,
            padding: 22,
            boxShadow: "0 40px 80px -20px rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div style={{ fontFamily: "var(--font-serif), serif", fontWeight: 700, fontSize: 15, color: "#0A2320" }}>Bookings</div>
            <div
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 10,
                color: "#006B70",
                background: "rgba(0,107,112,0.1)",
                padding: "4px 10px",
                borderRadius: 999,
              }}
            >
              Live
            </div>
          </div>
          {[
            { name: "Registan Sunset Tour", meta: "4 guests · Sep 14", status: "Pending", color: "#D9972B" },
            { name: "Bukhara Heritage Package", meta: "2 guests · Sep 16", status: "Accepted", color: "#2D8A4E" },
            { name: "Nuratau Yurt Escape", meta: "6 guests · Sep 21", status: "Accepted", color: "#2D8A4E" },
          ].map((row) => (
            <div
              key={row.name}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 4px",
                borderTop: "1px solid #F2F1EC",
                gap: 12,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0A2320", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {row.name}
                </div>
                <div style={{ fontSize: 11.5, color: "rgba(10,35,32,0.5)", marginTop: 2 }}>{row.meta}</div>
              </div>
              <span
                style={{
                  flexShrink: 0,
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: row.color,
                  background: `${row.color}18`,
                  padding: "4px 10px",
                  borderRadius: 999,
                }}
              >
                {row.status}
              </span>
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 18, paddingTop: 16, borderTop: "1px solid #F2F1EC" }}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-serif), serif", fontWeight: 700, fontSize: 20, color: "#006B70" }}>12</div>
              <div style={{ fontSize: 10.5, color: "rgba(10,35,32,0.5)" }}>Packages</div>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-serif), serif", fontWeight: 700, fontSize: 20, color: "#006B70" }}>4.9</div>
              <div style={{ fontSize: 10.5, color: "rgba(10,35,32,0.5)" }}>Avg. rating</div>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-serif), serif", fontWeight: 700, fontSize: 20, color: "#006B70" }}>3</div>
              <div style={{ fontSize: 10.5, color: "rgba(10,35,32,0.5)" }}>Pending</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
