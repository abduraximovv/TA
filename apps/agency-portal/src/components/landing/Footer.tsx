"use client";

import React from "react";
import Link from "next/link";
import { Instagram, Send, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer style={{ background: "#0A2320", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "48px clamp(20px, 6vw, 56px) 32px" }}>
      <div
        className="flex flex-col md:flex-row md:items-center md:justify-between"
        style={{ maxWidth: 1200, margin: "0 auto", gap: 24 }}
      >
        <div>
          <div style={{ marginBottom: 8 }}>
            <span className="safron-wordmark" style={{ fontSize: 20 }}>Safron</span>
          </div>
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.5)", margin: 0, maxWidth: 360 }}>
            The operating system for Uzbekistan&rsquo;s travel agencies and DMCs.
          </p>
        </div>

        <nav className="flex flex-wrap items-center" style={{ gap: 24 }}>
          <a href="#features" style={{ fontSize: 13.5, color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>Platform</a>
          <a href="#how-it-works" style={{ fontSize: 13.5, color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>How It Works</a>
          <Link href="/auth/login" style={{ fontSize: 13.5, color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>Sign In</Link>
          <Link href="/auth/register" style={{ fontSize: 13.5, color: "#C5A880", textDecoration: "none", fontWeight: 600 }}>Register Your Agency</Link>
        </nav>

        <div style={{ display: "flex", gap: 12 }}>
          {[Instagram, Send, Facebook].map((Icon, i) => (
            <div
              key={i}
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              <Icon size={14} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "32px auto 0", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>
          &copy; {new Date().getFullYear()} Safron. Built for the people who make travel here unforgettable.
        </p>
      </div>

      <style>{`
        .safron-wordmark {
          font-family: var(--font-serif), serif;
          font-weight: 700;
          background: linear-gradient(135deg, #C5A880 0%, #E0935C 55%, #C1592A 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.01em;
        }
      `}</style>
    </footer>
  );
}
