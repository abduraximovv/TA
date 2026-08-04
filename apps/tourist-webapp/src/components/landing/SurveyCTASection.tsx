"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export function SurveyCTASection() {
  return (
    <section style={{ padding: "0 56px 96px", background: "#FFFFFF" }}>
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
          padding: "48px 56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 32,
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: 480 }}>
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
          <Link
            href="/contact"
            className="btn-teal"
            style={{ textDecoration: "none", display: "inline-flex", padding: "13px 26px" }}
          >
            Start Survey
          </Link>
        </div>

        <div
          style={{
            flexShrink: 0,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "#EFEDE7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#006B70",
          }}
        >
          <MessageCircle size={44} strokeWidth={1.4} />
        </div>
      </motion.div>
    </section>
  );
}
