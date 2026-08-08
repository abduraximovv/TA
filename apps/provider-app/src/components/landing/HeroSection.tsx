"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, ShieldCheck, Wifi } from "lucide-react";

const TRUST_ITEMS = [
  { icon: MapPin, label: "12 regions ready to list in" },
  { icon: ShieldCheck, label: "Free to join, verified by our team" },
  { icon: Wifi, label: "Works on low-end phones & weak signal" },
];

export function HeroSection() {
  return (
    <section style={{ position: "relative", width: "100%", minHeight: "100vh", overflow: "hidden" }}>
      <Image
        src="https://images.unsplash.com/photo-1621425022689-308a7b7691a3?q=80&w=2400&auto=format&fit=crop"
        alt="A yurt camp host in the Nuratau mountains, the kind of local provider this platform is built for"
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
            "linear-gradient(180deg, rgba(10,35,32,0.55) 0%, rgba(10,35,32,0.35) 35%, rgba(10,35,32,0.55) 65%, rgba(10,35,32,0.92) 100%)",
        }}
      />

      <div
        className="flex flex-col justify-center"
        style={{ position: "relative", zIndex: 2, minHeight: "100vh", padding: "140px clamp(20px, 6vw, 56px) 64px" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: 720 }}
        >
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
            Safron Uzbekistan · For Local Providers
          </div>

          <h1
            style={{
              fontFamily: "var(--font-serif), serif",
              fontWeight: 700,
              fontSize: "clamp(36px, 4.2vw + 16px, 68px)",
              lineHeight: 1.08,
              color: "#FFFFFF",
              margin: "0 0 24px",
            }}
          >
            The World Is Looking for You. Let&rsquo;s Make Sure They Find You.
          </h1>

          <p style={{ fontSize: "clamp(16px, 1.1vw + 10px, 19px)", lineHeight: 1.65, color: "rgba(255,255,255,0.88)", margin: "0 0 36px", maxWidth: 600 }}>
            Every day, travelers search for the real Uzbekistan — your yurt camp, your workshop, your kitchen,
            your trail. Right now, most of them never find you. Safron puts your business on the map, in their
            pocket, and in your hands — no office, no computer, no paperwork required.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, marginBottom: 48 }}>
            <Link href="/auth/register" className="btn-hero-gold" style={{ textDecoration: "none" }}>
              Become a Verified Provider <ArrowRight size={17} />
            </Link>
            <a href="#how-it-works" className="btn-hero-outline" style={{ textDecoration: "none" }}>
              See How It Works
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel-provider"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "18px 36px",
            borderRadius: 14,
            padding: "18px 24px",
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
      </div>
    </section>
  );
}
