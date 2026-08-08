"use client";

import React from "react";
import { motion } from "framer-motion";
import { Radar, CalendarRange, Kanban, Users, FileCheck2 } from "lucide-react";

const UPCOMING = [
  {
    icon: Radar,
    title: "Live Provider Marketplace",
    body: "Browse every verified local provider's real-time availability across Uzbekistan — no more calling around to check who's free.",
  },
  {
    icon: CalendarRange,
    title: "Drag-and-Drop Itinerary Canvas",
    body: "Visually build a trip by dragging services onto a calendar. Pricing updates automatically; export as a polished PDF for your client.",
  },
  {
    icon: Kanban,
    title: "Booking CRM Kanban Board",
    body: "Pending, Accepted, Confirmed, Completed — drag bookings between stages and see your entire pipeline at a glance.",
  },
  {
    icon: Users,
    title: "Team Accounts",
    body: "Invite colleagues with role-based access, so your whole team works from the same live inventory and bookings.",
  },
  {
    icon: FileCheck2,
    title: "E-Mehmon Compliance Automation",
    body: "Government guest-registration paperwork filed automatically for every tourist — no more manual forms per trip.",
  },
];

export function RoadmapSection() {
  return (
    <section id="roadmap" style={{ background: "#0A2320", padding: "clamp(72px, 10vw, 120px) clamp(20px, 6vw, 56px)", position: "relative", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(197,168,128,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: 56, maxWidth: 640 }}
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
            What's Next
          </div>
          <h2
            style={{
              fontFamily: "var(--font-serif), serif",
              fontWeight: 600,
              fontSize: "clamp(28px, 2.2vw + 14px, 40px)",
              lineHeight: 1.2,
              color: "#FFFFFF",
              margin: "0 0 18px",
            }}
          >
            We&rsquo;re Building Fast — and You&rsquo;ll Get It First.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: "rgba(255,255,255,0.65)", margin: 0 }}>
            Everything below is actively in development, straight from the roadmap agencies helped us prioritize.
            Register now and shape what gets built next.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 20 }}>
          {UPCOMING.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                style={{
                  borderRadius: 14,
                  border: "1px dashed rgba(197,168,128,0.35)",
                  padding: "24px 22px",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: 9.5,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#C5A880",
                    background: "rgba(197,168,128,0.12)",
                    padding: "4px 8px",
                    borderRadius: 999,
                  }}
                >
                  Soon
                </span>
                <Icon size={22} color="#C5A880" style={{ marginBottom: 18 }} />
                <h3 style={{ fontFamily: "var(--font-serif), serif", fontWeight: 600, fontSize: 17, color: "#FFFFFF", margin: "0 0 10px", paddingRight: 30 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "rgba(255,255,255,0.55)", margin: 0 }}>{item.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
