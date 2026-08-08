"use client";

import React from "react";
import { motion } from "framer-motion";
import { PhoneCall, FileSpreadsheet, ClipboardList, EyeOff } from "lucide-react";

const PAINS = [
  {
    icon: PhoneCall,
    title: "Hours on the Phone",
    body: "Checking provider availability one call at a time, over and over, for every single itinerary you build.",
  },
  {
    icon: FileSpreadsheet,
    title: "Itineraries in Word & Excel",
    body: "Rebuilding the same multi-day trip from scratch in a spreadsheet, with no shared source of truth for your team.",
  },
  {
    icon: ClipboardList,
    title: "Paper-Trail Compliance",
    body: "Guest registration and compliance forms filled out by hand for every single tourist, every single trip.",
  },
  {
    icon: EyeOff,
    title: "No Real-Time Visibility",
    body: "No way to know who's actually available today without picking up the phone and asking, one provider at a time.",
  },
];

export function ProblemSection() {
  return (
    <section id="problem" style={{ background: "#0A2320", padding: "clamp(72px, 10vw, 120px) clamp(20px, 6vw, 56px)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: 640, marginBottom: 64 }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#C5A880",
              marginBottom: 16,
            }}
          >
            The Old Way
          </div>
          <h2
            style={{
              fontFamily: "var(--font-serif), serif",
              fontWeight: 600,
              fontSize: "clamp(30px, 2.6vw + 14px, 46px)",
              lineHeight: 1.15,
              color: "#FFFFFF",
              margin: "0 0 20px",
            }}
          >
            Spreadsheets Weren&rsquo;t Built for Silk Road Logistics.
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: "rgba(255,255,255,0.7)", margin: 0 }}>
            Uzbekistan&rsquo;s travel agencies run world-class itineraries through phone calls, paper forms, and
            manual spreadsheets. This is the operational reality Safron exists to replace.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 20 }}>
          {PAINS.map((pain, i) => {
            const Icon = pain.icon;
            return (
              <motion.div
                key={pain.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                style={{
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  padding: "28px 24px",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "rgba(201,59,59,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <Icon size={20} color="#E08484" />
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-serif), serif",
                    fontWeight: 600,
                    fontSize: 19,
                    color: "#FFFFFF",
                    margin: "0 0 10px",
                  }}
                >
                  {pain.title}
                </h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "rgba(255,255,255,0.6)", margin: 0 }}>
                  {pain.body}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
