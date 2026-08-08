"use client";

import React from "react";
import { motion } from "framer-motion";

const STEPS = [
  {
    number: "01",
    title: "Register Your Agency",
    body: "Company name, business email, phone, and a password — that's the whole form. No license upload required to get started.",
  },
  {
    number: "02",
    title: "Get Verified, Live",
    body: "Track your approval in real time on a 3-step status page — Submitted, In Review, Approved — no waiting in the dark.",
  },
  {
    number: "03",
    title: "Build Your Inventory & Packages",
    body: "List your services, then bundle them into priced, dated, multi-day packages ready for travelers to discover.",
  },
  {
    number: "04",
    title: "Manage Every Booking in One Inbox",
    body: "Requests arrive in real time. Accept, decline, and track your whole pipeline from a single dashboard.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" style={{ background: "#F9F8F5", padding: "clamp(72px, 10vw, 120px) clamp(20px, 6vw, 56px)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: 64, maxWidth: 620 }}
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
            How It Works
          </div>
          <h2
            style={{
              fontFamily: "var(--font-serif), serif",
              fontWeight: 600,
              fontSize: "clamp(28px, 2.2vw + 14px, 40px)",
              lineHeight: 1.2,
              color: "#0A2320",
              margin: 0,
            }}
          >
            From Registration to Your First Booking, in One Sitting.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 4 }}>
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{ position: "relative", padding: "0 20px 0 0" }}
            >
              <div
                style={{
                  fontFamily: "var(--font-serif), serif",
                  fontWeight: 700,
                  fontSize: 44,
                  color: "rgba(10,35,32,0.12)",
                  lineHeight: 1,
                  marginBottom: 16,
                }}
              >
                {step.number}
              </div>
              <h3 style={{ fontFamily: "var(--font-serif), serif", fontWeight: 600, fontSize: 19, color: "#0A2320", margin: "0 0 10px" }}>
                {step.title}
              </h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "rgba(10,35,32,0.6)", margin: 0 }}>{step.body}</p>
              {i < STEPS.length - 1 && (
                <div
                  className="hidden lg:block"
                  style={{ position: "absolute", top: 22, right: 0, width: 1, height: 40, background: "rgba(10,35,32,0.15)" }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
