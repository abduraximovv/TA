"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Send, Facebook, Phone } from "lucide-react";
import { subscribeToNewsletter } from "@/app/actions/newsletter";

// The /map page is a full-viewport, edge-to-edge experience -- a footer below it would only be
// reachable by scrolling past the map itself, which doesn't scroll. Hide it there.
const HIDE_FOOTER_ON = ["/map"];

const COLUMNS = [
  {
    title: "Discover Uzbekistan",
    links: [
      { label: "Destinations", href: "/discover" },
      { label: "Things To Do", href: "/service" },
      { label: "Packages", href: "/packages" },
      { label: "Events Calendar", href: "/events" },
    ],
  },
  {
    title: "Plan Your Trip",
    links: [
      { label: "Survival Map", href: "/map" },
      { label: "Hotels", href: "/hotels" },
      { label: "Flights", href: "/flights" },
    ],
  },
  {
    title: "Related Links",
    links: [
      { label: "About Uzbekistan", href: "/about" },
      { label: "Verified Providers", href: "/service" },
      { label: "Travel Agencies", href: "/packages" },
      { label: "Ministry of Tourism", href: "/about" },
    ],
  },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const pathname = usePathname();

  if (HIDE_FOOTER_ON.includes(pathname)) return null;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    const result = await subscribeToNewsletter(email);
    if (result.success) {
      setStatus("success");
      setStatusMessage(result.alreadySubscribed ? "You're already on the list." : "Subscribed — thank you!");
      setEmail("");
    } else {
      setStatus("error");
      setStatusMessage(result.error || "Something went wrong.");
    }
  };

  return (
    <footer className="bg-emerald-950">
      {/* Geometric pattern divider band */}
      <div className="pattern-band-muted" style={{ height: 18, width: "100%" }} />

      {/* App download + newsletter strip */}
      <div
        style={{
          maxWidth: 1600,
          margin: "0 auto",
          padding: "clamp(24px, 5vw, 40px) var(--section-padding-x)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#C5A880",
              marginBottom: 10,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Download Silk Road Uzbekistan App
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {["Google Play", "App Store", "AppGallery"].map((store) => (
              <div
                key={store}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.2)",
                  fontSize: 12,
                  color: "#FFFFFF",
                  fontFamily: "'Inter', sans-serif",
                  whiteSpace: "nowrap",
                }}
              >
                {store}
              </div>
            ))}
          </div>
        </div>

        <div>
          <form onSubmit={handleSubscribe} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status !== "idle") setStatus("idle");
              }}
              disabled={status === "submitting"}
              style={{
                padding: "11px 16px",
                borderRadius: 100,
                border: "1px solid rgba(255,255,255,0.25)",
                background: "rgba(255,255,255,0.06)",
                color: "#FFFFFF",
                fontSize: 13,
                fontFamily: "'Inter', sans-serif",
                outline: "none",
                width: 220,
              }}
            />
            <button type="submit" className="btn-pill-primary" disabled={status === "submitting"} style={{ opacity: status === "submitting" ? 0.7 : 1 }}>
              {status === "submitting" ? "Joining…" : "Join"}
            </button>
          </form>
          {statusMessage && (
            <div
              style={{
                marginTop: 8,
                fontSize: 12.5,
                fontFamily: "'Inter', sans-serif",
                color: status === "error" ? "#E38B6E" : "#8FD4C8",
              }}
            >
              {statusMessage}
            </div>
          )}
        </div>
      </div>

      {/* Main footer body */}
      <div
        className="footer-columns-grid"
        style={{
          maxWidth: 1600,
          margin: "0 auto",
          padding: "clamp(40px, 8vw, 56px) var(--section-padding-x)",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 600,
              fontSize: 23,
              background: "linear-gradient(135deg, #C5A880 0%, #006B70 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: 12,
            }}
          >
            Silk&nbsp;Road&nbsp;Uzbekistan
          </div>
          <p style={{ fontSize: 15, color: "rgba(249,248,245,0.6)", lineHeight: 1.65, marginBottom: 20, maxWidth: 340 }}>
            Your independent guide to Uzbekistan's Silk Road — discover real destinations, plan
            multi-day itineraries, and book directly with verified local guides, artisans, and
            travel agencies across the country.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            {[Instagram, Send, Facebook].map((Icon, i) => (
              <div
                key={i}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                }}
              >
                <Icon size={14} />
              </div>
            ))}
          </div>
          <Link
            href="/contact"
            className="btn-pill-outline"
            style={{ marginTop: 18, display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}
          >
            <Phone size={12} /> Contact Us
          </Link>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#FFFFFF",
                marginBottom: 20,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {col.title}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              {col.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="footer-link"
                  style={{
                    fontSize: 14.5,
                    color: "rgba(249,248,245,0.6)",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "20px var(--section-padding-x)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 11.5, color: "rgba(249,248,245,0.45)", fontFamily: "'JetBrains Mono', monospace" }}>
          © {new Date().getFullYear()} Silk Road Uzbekistan. All rights reserved.
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {["Terms", "Privacy", "Freedom of Information", "Sitemap"].map((label) => (
            <Link
              key={label}
              href="/about"
              className="footer-link"
              style={{ fontSize: 11.5, color: "rgba(249,248,245,0.45)", textDecoration: "none" }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .footer-link:hover { color: #C5A880 !important; }
      `}</style>
    </footer>
  );
}
