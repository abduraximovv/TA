"use client";

import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(10,35,32,0.1)",
        padding: "48px 56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#F9F8F5",
      }}
    >
      <div
        style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 600,
          fontSize: 16,
          color: "#0A2320",
        }}
      >
        Silk&nbsp;Road&nbsp;Uzbekistan
      </div>

      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        {[
          { label: "Destinations", href: "/discover" },
          { label: "Packages", href: "/packages" },
          { label: "Experiences", href: "/service" },
          { label: "About", href: "/about" },
          { label: "Contact", href: "/contact" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: "rgba(10,35,32,0.55)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            className="footer-link"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          color: "rgba(10,35,32,0.45)",
        }}
      >
        © {new Date().getFullYear()} Republic of Uzbekistan · Ministry of Tourism and Sport
      </div>

      <style>{`
        .footer-link:hover { color: #006B70 !important; }
      `}</style>
    </footer>
  );
}
