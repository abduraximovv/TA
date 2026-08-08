"use client";

import React from "react";
import { motion } from "framer-motion";

const STEPS = [
  {
    number: "01",
    title: "Register in Under 2 Minutes",
    body: "Just your name, phone number, and the kind of service you offer. No paperwork, no office visit.",
  },
  {
    number: "02",
    title: "Build Your Profile",
    body: "Add photos, set your price, and describe your experience. Preview it exactly as travelers will see it.",
  },
  {
    number: "03",
    title: "Get Verified",
    body: "Our team reviews your listing for quality and authenticity, then your verified badge goes live.",
  },
  {
    number: "04",
    title: "Start Getting Booked",
    body: "Your profile is discoverable by travelers and agencies alike — booking requests land straight in your dashboard.",
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
            From Sign-Up to Your First Booking, Faster Than You Think.
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
