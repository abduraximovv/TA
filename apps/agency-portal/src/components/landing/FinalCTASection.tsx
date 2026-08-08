"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function FinalCTASection() {
  return (
    <section style={{ background: "#F9F8F5", padding: "clamp(80px, 11vw, 130px) clamp(20px, 6vw, 56px)" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        style={{
          maxWidth: 900,
          margin: "0 auto",
          textAlign: "center",
          background: "#0A2320",
          borderRadius: 28,
          padding: "clamp(48px, 7vw, 80px) clamp(24px, 6vw, 64px)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: "-30%",
            left: "-10%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,107,112,0.25) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <h2
          style={{
            fontFamily: "var(--font-serif), serif",
            fontWeight: 600,
            fontSize: "clamp(28px, 3vw + 12px, 46px)",
            lineHeight: 1.15,
            color: "#FFFFFF",
            margin: "0 0 20px",
            position: "relative",
          }}
        >
          Ready to Stop Rebuilding the Same Itinerary Twice?
        </h2>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: "rgba(255,255,255,0.75)", margin: "0 0 40px", position: "relative", maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
          Registration takes minutes and costs nothing. Get verified, list your first package, and start managing
          bookings from one dashboard today.
        </p>
        <div style={{ position: "relative", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 }}>
          <Link href="/auth/register" className="btn-hero-gold-a" style={{ textDecoration: "none" }}>
            Register Your Agency <ArrowRight size={17} />
          </Link>
          <Link href="/auth/login" className="btn-hero-outline-a" style={{ textDecoration: "none" }}>
            I Already Have an Account
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
