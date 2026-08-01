"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Globe } from "lucide-react";
import { useAuth } from "@repo/auth";
import { AuthModal } from "@/components/auth/AuthModal";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Destinations", href: "/discover" },
  { label: "Packages", href: "/packages" },
  { label: "Experiences", href: "/service" },
  { label: "Hotels", href: "/hotels" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isTransparent = isHome && !isScrolled;

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: isTransparent ? "transparent" : "rgba(10, 35, 32, 0.96)",
          backdropFilter: isTransparent ? "none" : "blur(12px)",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "24px 56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none" }}>
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 600,
                fontSize: 19,
                color: "#FFFFFF",
                whiteSpace: "nowrap",
                letterSpacing: "0.01em",
              }}
            >
              Silk&nbsp;Road
            </div>
          </Link>

          {/* Center Nav */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              flexWrap: "nowrap",
            }}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: 13.5,
                  fontWeight: pathname === link.href ? 700 : 500,
                  color:
                    pathname === link.href ? "#FFFFFF" : "rgba(255,255,255,0.75)",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "color 0.2s",
                  fontFamily: "'Inter', sans-serif",
                }}
                className="nav-link-hover"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Icons + Sign In */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexShrink: 0,
            }}
          >
            {/* Survival Map icon */}
            <Link
              href="/map"
              title="Survival Map"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1.5px solid rgba(255,255,255,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
                color: "#FFFFFF",
                textDecoration: "none",
              }}
            >
              <Map style={{ width: 14, height: 14 }} />
            </Link>

            {/* Translator icon */}
            <Link
              href="/translator"
              title="Contextual Translator"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1.5px solid rgba(255,255,255,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
                color: "#FFFFFF",
                textDecoration: "none",
              }}
            >
              <Globe style={{ width: 14, height: 14 }} />
            </Link>

            {!isLoading && (
              <>
                {user ? (
                  <Link href="/profile" style={{ textDecoration: "none" }}>
                    <button className="btn-pill-outline" style={{ flexShrink: 0 }}>
                      Profile
                    </button>
                  </Link>
                ) : (
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="btn-pill-outline"
                    style={{ flexShrink: 0 }}
                  >
                    Sign In
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />

      <style>{`
        .nav-link-hover:hover { color: #FFFFFF !important; }
      `}</style>
    </>
  );
}
