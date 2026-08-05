"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Instagram, Send, Facebook, Phone } from "lucide-react";

const COLUMNS = [
  {
    title: "Discover Uzbekistan",
    links: [
      { label: "Destinations", href: "/discover" },
      { label: "Things To Do", href: "/service" },
      { label: "Packages", href: "/packages" },
      { label: "Events Calendar", href: "/discover" },
    ],
  },
  {
    title: "Plan Your Trip",
    links: [
      { label: "Survival Map", href: "/map" },
      { label: "Contextual Translator", href: "/translator" },
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

  return (
    <footer className="bg-emerald-950">
      {/* Geometric pattern divider band */}
      <div className="pattern-band-muted" style={{ height: 18, width: "100%" }} />

      {/* App download + newsletter strip */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "40px 56px",
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

        <form
          onSubmit={(e) => e.preventDefault()}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <input
            type="email"
            required
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          <button type="submit" className="btn-pill-primary">
            Join
          </button>
        </form>
      </div>

      {/* Main footer body */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "48px 56px",
          display: "grid",
          gridTemplateColumns: "1.2fr repeat(3, 1fr)",
          gap: 32,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 600,
              fontSize: 20,
              background: "linear-gradient(135deg, #C5A880 0%, #006B70 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: 12,
            }}
          >
            Silk&nbsp;Road&nbsp;Uzbekistan
          </div>
          <p style={{ fontSize: 12.5, color: "rgba(249,248,245,0.55)", lineHeight: 1.6, marginBottom: 18, maxWidth: 260 }}>
            The official tourism platform of the Republic of Uzbekistan — plan, translate, and
            book with verified local providers.
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
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#FFFFFF",
                marginBottom: 16,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {col.title}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {col.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="footer-link"
                  style={{
                    fontSize: 13,
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
          padding: "20px 56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 11.5, color: "rgba(249,248,245,0.45)", fontFamily: "'JetBrains Mono', monospace" }}>
          © {new Date().getFullYear()} Republic of Uzbekistan · Ministry of Tourism and Sport
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
