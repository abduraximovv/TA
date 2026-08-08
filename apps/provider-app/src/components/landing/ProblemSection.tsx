"use client";

import React from "react";
import { motion } from "framer-motion";
import { PhoneMissed, EyeOff, Banknote, PhoneCall } from "lucide-react";

const PAINS = [
  {
    icon: EyeOff,
    title: "Invisible Online",
    body: "If a traveler can't search for you, you don't exist to them — no matter how good your yurt, your food, or your workshop is.",
  },
  {
    icon: PhoneMissed,
    title: "Missed Calls, Missed Income",
    body: "Every unanswered call while you're out at the camp or the field is a booking that just went to someone else.",
  },
  {
    icon: Banknote,
    title: "Cash Only, No Record",
    body: "No digital trail means no proof of income, no way to build a track record, and no way to grow beyond word of mouth.",
  },
  {
    icon: PhoneCall,
    title: "Waiting on Agencies",
    body: "You only get booked when an agency happens to remember your number — you have no direct line to travelers yourself.",
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
            Word of Mouth Only Travels So Far.
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: "rgba(255,255,255,0.7)", margin: 0 }}>
            Rural guides, yurt hosts, and artisans across Uzbekistan run world-class experiences with none of the
            tools to be found, booked, or paid reliably. This is the reality Safron was built to fix.
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
