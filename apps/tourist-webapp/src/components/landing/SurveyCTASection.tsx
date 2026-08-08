"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export function SurveyCTASection() {
  return (
    <section style={{ padding: "0 var(--section-padding-x) 96px", background: "#FFFFFF" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        style={{
          position: "relative",
          borderRadius: 20,
          background: "#F9F8F5",
          border: "1px solid #EFEDE7",
          padding: "clamp(28px, 5vw, 48px) clamp(24px, 5vw, 56px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 32,
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: 480, minWidth: 240 }}>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 26,
              fontWeight: 600,
              color: "#0A2320",
              marginBottom: 12,
            }}
          >
            Help Us Improve Your Journey
          </div>
          <p
            style={{
              fontSize: 14.5,
              color: "rgba(10,35,32,0.6)",
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            Tell us what worked, what didn&rsquo;t, and what you wish existed — your feedback shapes
            the next version of this platform.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link
              href="/contact"
              className="btn-teal"
              style={{ textDecoration: "none", display: "inline-flex", padding: "13px 26px" }}
            >
              Start Survey
            </Link>
            <div
              className="w-12 h-12 md:w-14 md:h-14"
              style={{
                flexShrink: 0,
                borderRadius: "50%",
                background: "#EFEDE7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#006B70",
              }}
            >
              <MessageCircle className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.4} />
            </div>
          </div>
        </div>


      </motion.div>
    </section>
  );
}
