"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Send, Facebook, Phone, ChevronDown } from "lucide-react";
import { subscribeToNewsletter } from "@/app/actions/newsletter";

// /map and /ai-chat are full-viewport, edge-to-edge experiences -- a footer below either would
// only be reachable by scrolling past content that doesn't scroll. Hide it there.
const HIDE_FOOTER_ON = ["/map", "/ai-chat"];

/** True once launched from a home-screen icon (installed PWA) rather than a normal browser tab --
 * a footer (legal links, newsletter, app-download CTA) is a web-page convention that doesn't
 * belong inside what's now presenting itself as a native app shell. */
function useIsStandalone() {
  const [isStandalone, setIsStandalone] = useState(false);
  useEffect(() => {
    const isIosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches || isIosStandalone);
  }, []);
  return isStandalone;
}

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
  // Accordion on mobile (see .footer-accordion-content in globals.css for the md: override that
  // forces it permanently open on desktop, where all 3 columns fit comfortably side by side).
  const [openColumn, setOpenColumn] = useState<string | null>(null);
  const pathname = usePathname();
  const isStandalone = useIsStandalone();

  if (HIDE_FOOTER_ON.includes(pathname) || isStandalone) return null;

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
    // clears-bottom-nav: BottomNav is fixed + md:hidden, and nothing else reserves space for its
    // height, so without this the last ~64px of the page (this footer's bottom bar) sits under it.
    <footer className="bg-emerald-950 clears-bottom-nav">
      {/* Geometric pattern divider band */}
      <div className="pattern-band-muted" style={{ height: 18, width: "100%" }} />

      {/* App download + newsletter strip */}
      <div
        style={{
          maxWidth: 1600,
          margin: "0 auto",
          padding: "clamp(16px, 4vw, 40px) var(--section-padding-x)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "clamp(9.5px, 2vw, 11px)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#C5A880",
              marginBottom: 8,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Download the App
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Google Play", "App Store", "AppGallery"].map((store) => (
              <div
                key={store}
                style={{
                  padding: "6px 11px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.2)",
                  fontSize: "clamp(10px, 2.2vw, 12px)",
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

        <div style={{ minWidth: 0, width: "100%", maxWidth: 320 }} className="sm:w-auto">
          <form onSubmit={handleSubscribe} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="email"
              required
              placeholder="Your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status !== "idle") setStatus("idle");
              }}
              disabled={status === "submitting"}
              style={{
                padding: "9px 14px",
                borderRadius: 100,
                border: "1px solid rgba(255,255,255,0.25)",
                background: "rgba(255,255,255,0.06)",
                color: "#FFFFFF",
                fontSize: 13,
                fontFamily: "'Inter', sans-serif",
                outline: "none",
                flex: 1,
                minWidth: 0,
              }}
            />
            <button type="submit" className="btn-pill-primary" disabled={status === "submitting"} style={{ opacity: status === "submitting" ? 0.7 : 1, flexShrink: 0 }}>
              {status === "submitting" ? "Joining…" : "Join"}
            </button>
          </form>
          {statusMessage && (
            <div
              style={{
                marginTop: 6,
                fontSize: 11.5,
                fontFamily: "'Inter', sans-serif",
                color: status === "error" ? "#E38B6E" : "#8FD4C8",
              }}
            >
              {statusMessage}
            </div>
          )}
        </div>
      </div>

      {/* Brand */}
      <div style={{ maxWidth: 1600, margin: "0 auto", padding: "clamp(20px, 5vw, 32px) var(--section-padding-x) 0" }}>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontSize: "clamp(18px, 3.5vw, 23px)",
            background: "linear-gradient(135deg, #C5A880 0%, #E0935C 55%, #C1592A 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: 8,
            letterSpacing: "0.01em",
          }}
        >
          Safron
        </div>
        <p style={{ fontSize: "clamp(12.5px, 2.5vw, 15px)", color: "rgba(249,248,245,0.6)", lineHeight: 1.55, margin: 0, maxWidth: 480 }}>
          Your independent guide to Uzbekistan's Silk Road — discover real destinations, plan
          multi-day itineraries, and book directly with verified local guides, artisans, and
          travel agencies across the country.
        </p>
      </div>

      {/* Link columns -- collapsible accordion on mobile, always-open columns from md: up */}
      <div
        style={{
          maxWidth: 1600,
          margin: "0 auto",
          padding: "clamp(12px, 3vw, 20px) var(--section-padding-x) 0",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          marginTop: 20,
        }}
        className="md:grid md:grid-cols-3 md:gap-8"
      >
        {COLUMNS.map((col) => {
          const isOpen = openColumn === col.title;
          return (
            <div key={col.title} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }} className="md:border-none">
              <button
                type="button"
                onClick={() => setOpenColumn(isOpen ? null : col.title)}
                className="md:pointer-events-none"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "none",
                  border: "none",
                  padding: "14px 2px",
                  cursor: "pointer",
                  fontSize: "clamp(11px, 2.2vw, 13px)",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#FFFFFF",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {col.title}
                <ChevronDown
                  size={16}
                  className="md:hidden"
                  style={{ transition: "transform 0.25s", transform: isOpen ? "rotate(180deg)" : "none", color: "rgba(255,255,255,0.5)" }}
                />
              </button>
              <div className={`footer-accordion-content ${isOpen ? "open" : ""}`}>
                <div style={{ display: "flex", flexDirection: "column", gap: 9, paddingBottom: 16 }}>
                  {col.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="footer-link"
                      style={{
                        fontSize: "clamp(12.5px, 2.4vw, 14.5px)",
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
            </div>
          );
        })}
      </div>

      {/* Social + contact */}
      <div
        style={{
          maxWidth: 1600,
          margin: "0 auto",
          padding: "20px var(--section-padding-x) clamp(20px, 5vw, 32px)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
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
              flexShrink: 0,
            }}
          >
            <Icon size={14} />
          </div>
        ))}
        <Link
          href="/contact"
          className="btn-pill-outline"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}
        >
          <Phone size={12} /> Contact Us
        </Link>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "14px var(--section-padding-x)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ fontSize: "clamp(10px, 2vw, 11.5px)", color: "rgba(249,248,245,0.45)", fontFamily: "'JetBrains Mono', monospace" }}>
          © {new Date().getFullYear()} Safron. All rights reserved.
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {["Terms", "Privacy", "Freedom of Information", "Sitemap"].map((label) => (
            <Link
              key={label}
              href="/about"
              className="footer-link"
              style={{ fontSize: "clamp(10px, 2vw, 11.5px)", color: "rgba(249,248,245,0.45)", textDecoration: "none" }}
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
