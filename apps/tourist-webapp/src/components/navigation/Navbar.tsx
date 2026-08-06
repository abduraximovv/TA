"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Map, Search, Menu, X } from "lucide-react";
import { useAuth } from "@repo/auth";
import { AuthModal } from "@/components/auth/AuthModal";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Destinations", href: "/discover" },
  { label: "Packages", href: "/packages" },
  { label: "Experiences", href: "/experiences" },
  { label: "Events", href: "/events" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileQuery, setMobileQuery] = useState("");
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // A route change (tapping a link inside the sheet, or navigating some other way) should
  // always close mobile overlays -- otherwise the menu/search stays stuck open on the new page.
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  }, [pathname]);

  const isTransparent = isHome && !isScrolled;
  // Once anything mobile-only is open, the header needs a solid ground regardless of scroll
  // position -- a transparent bar over the hero with a menu sheet open reads as broken.
  const headerBg = isTransparent && !isMobileMenuOpen && !isMobileSearchOpen ? "transparent" : "rgba(10, 35, 32, 0.96)";

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = mobileQuery.trim();
    if (!q) return;
    router.push(`/discover?q=${encodeURIComponent(q)}`);
    setIsMobileSearchOpen(false);
    setMobileQuery("");
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: headerBg,
          backdropFilter: headerBg === "transparent" ? "none" : "blur(12px)",
          paddingTop: "var(--safe-top)",
        }}
      >
        {/* ── Mobile row (<768px): logo + quick search + menu trigger ── */}
        <div className="flex md:hidden items-center justify-between gap-3" style={{ padding: "14px 20px" }}>
          {isMobileSearchOpen ? (
            <form onSubmit={handleMobileSearchSubmit} className="flex items-center gap-2 w-full">
              <input
                autoFocus
                value={mobileQuery}
                onChange={(e) => setMobileQuery(e.target.value)}
                placeholder="Search destinations, experiences…"
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.25)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#FFFFFF",
                  fontSize: 15,
                  fontFamily: "var(--font-sans), sans-serif",
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(false)}
                aria-label="Close search"
                className="tap-target tap-active flex items-center justify-center rounded-full shrink-0"
                style={{ color: "#FFFFFF" }}
              >
                <X className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <>
              <Link href="/" style={{ textDecoration: "none" }}>
                <div
                  style={{
                    fontFamily: "var(--font-serif), serif",
                    fontWeight: 700,
                    fontSize: 21,
                    color: "#FFFFFF",
                    whiteSpace: "nowrap",
                  }}
                >
                  Silk&nbsp;Road
                </div>
              </Link>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMobileSearchOpen(true)}
                  aria-label="Search"
                  className="tap-target tap-active flex items-center justify-center rounded-full"
                  style={{ color: "#FFFFFF" }}
                >
                  <Search className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Open menu"
                  className="tap-target tap-active flex items-center justify-center rounded-full"
                  style={{ color: "#FFFFFF" }}
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── Desktop row (≥768px): unchanged full nav ── */}
        <div
          className="hidden md:flex items-center justify-between"
          style={{
            padding: "16px 56px",
            gap: 20,
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                fontFamily: "var(--font-serif), serif",
                fontWeight: 700,
                fontSize: 26,
                color: "#FFFFFF",
                whiteSpace: "nowrap",
                letterSpacing: "0.02em",
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
                  fontSize: 14.5,
                  fontWeight: pathname === link.href ? 700 : 500,
                  color:
                    pathname === link.href ? "#FFFFFF" : "rgba(255,255,255,0.75)",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "color 0.2s",
                  fontFamily: "var(--font-sans), sans-serif",
                  letterSpacing: "0.01em",
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

      {/* ── Mobile menu sheet: everything not already covered by BottomNav's 5 tabs ── */}
      {isMobileMenuOpen && (
        // Above BottomNav's z-[100] -- otherwise the tab bar pokes through the sheet/backdrop.
        <div className="fixed inset-0 z-[110] md:hidden">
          <div className="absolute inset-0" style={{ background: "rgba(10,35,32,0.5)" }} onClick={() => setIsMobileMenuOpen(false)} />
          <div
            className="absolute top-0 right-0 h-full flex flex-col"
            style={{
              width: "78%",
              maxWidth: 320,
              background: "#0A2320",
              paddingTop: "var(--safe-top)",
              paddingBottom: "var(--safe-bottom)",
              boxShadow: "-8px 0 32px rgba(0,0,0,0.3)",
            }}
          >
            <div className="flex items-center justify-between" style={{ padding: "18px 20px" }}>
              <div style={{ fontFamily: "var(--font-serif), serif", fontWeight: 700, fontSize: 19, color: "#FFFFFF" }}>Menu</div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
                className="tap-target tap-active flex items-center justify-center rounded-full"
                style={{ color: "#FFFFFF" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col" style={{ padding: "8px 12px" }}>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="tap-target tap-active"
                  style={{
                    padding: "13px 12px",
                    borderRadius: 10,
                    fontSize: 16,
                    fontWeight: pathname === link.href ? 700 : 500,
                    color: pathname === link.href ? "#C5A880" : "rgba(255,255,255,0.85)",
                    textDecoration: "none",
                    fontFamily: "var(--font-sans), sans-serif",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "8px 20px" }} />

            <nav className="flex flex-col" style={{ padding: "8px 12px" }}>
              <Link
                href="/map"
                className="tap-target tap-active flex items-center gap-3"
                style={{ padding: "13px 12px", borderRadius: 10, fontSize: 16, color: "rgba(255,255,255,0.85)", textDecoration: "none", fontFamily: "var(--font-sans), sans-serif" }}
              >
                <Map className="w-[18px] h-[18px]" /> Survival Map
              </Link>
            </nav>

            <div style={{ marginTop: "auto", padding: 20 }}>
              {!isLoading &&
                (user ? (
                  <Link href="/profile" style={{ textDecoration: "none" }}>
                    <button className="btn-pill-outline tap-target" style={{ width: "100%" }}>
                      Profile
                    </button>
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsAuthOpen(true);
                    }}
                    className="btn-pill-outline tap-target"
                    style={{ width: "100%" }}
                  >
                    Sign In
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      <AuthModal isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />

      <style>{`
        .nav-link-hover:hover { color: #FFFFFF !important; }
        .btn-pill-outline {
          padding: 8px 16px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.4);
          background: transparent;
          color: #FFFFFF;
          font-family: var(--font-sans), sans-serif;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-pill-outline:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </>
  );
}
