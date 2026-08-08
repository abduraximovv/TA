"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const LINKS = [
  { label: "The Problem", href: "#problem" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "What's Next", href: "#roadmap" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = isScrolled || isMenuOpen;

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: solid ? "rgba(10, 35, 32, 0.96)" : "transparent",
          backdropFilter: solid ? "blur(12px)" : "none",
        }}
      >
        <div className="flex items-center justify-between" style={{ padding: "18px clamp(20px, 5vw, 56px)" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: 10 }}>
            <span className="safron-wordmark" style={{ fontSize: 24 }}>Safron</span>
            <span
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 10.5,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              Providers
            </span>
          </Link>

          <nav className="hidden md:flex items-center" style={{ gap: 30 }}>
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: 14.5,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.8)",
                  textDecoration: "none",
                }}
                className="provider-nav-link"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center" style={{ gap: 12 }}>
            <Link href="/auth/login" style={{ textDecoration: "none" }}>
              <span className="btn-pill-outline-provider">Sign In</span>
            </Link>
            <Link href="/auth/register" style={{ textDecoration: "none" }}>
              <span className="btn-pill-gold-provider">Become a Provider</span>
            </Link>
          </div>

          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="md:hidden flex items-center justify-center"
            style={{ width: 40, height: 40, color: "#FFFFFF" }}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden" style={{ padding: "0 20px 24px", display: "flex", flexDirection: "column", gap: 4 }}>
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setIsMenuOpen(false)}
                style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: 16,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.85)",
                  textDecoration: "none",
                  padding: "12px 4px",
                }}
              >
                {l.label}
              </a>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <Link href="/auth/login" style={{ textDecoration: "none", flex: 1 }}>
                <span className="btn-pill-outline-provider" style={{ display: "block", textAlign: "center" }}>
                  Sign In
                </span>
              </Link>
              <Link href="/auth/register" style={{ textDecoration: "none", flex: 1 }}>
                <span className="btn-pill-gold-provider" style={{ display: "block", textAlign: "center" }}>
                  Become a Provider
                </span>
              </Link>
            </div>
          </div>
        )}
      </header>

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
        .provider-nav-link:hover { color: #FFFFFF !important; }
        .btn-pill-outline-provider {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 9px 18px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.4);
          background: transparent; color: #FFFFFF; font-family: var(--font-sans), sans-serif;
          font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; white-space: nowrap;
        }
        .btn-pill-outline-provider:hover { background: rgba(255,255,255,0.12); }
        .btn-pill-gold-provider {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 9px 20px; border-radius: 999px; border: none;
          background: #C5A880; color: #0A2320; font-family: var(--font-sans), sans-serif;
          font-size: 14px; font-weight: 700; cursor: pointer; transition: background 0.2s; white-space: nowrap;
        }
        .btn-pill-gold-provider:hover { background: #b89a6f; }
      `}</style>
    </>
  );
}
