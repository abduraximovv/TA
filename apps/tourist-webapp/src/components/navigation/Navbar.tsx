"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Globe, ChevronDown, Search, Accessibility } from "lucide-react";
import { useAuth } from "@repo/auth";
import { AuthModal } from "@/components/auth/AuthModal";
import { motion } from "framer-motion";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Destinations", href: "/discover", hasDropdown: true },
  { label: "Packages", href: "/packages" },
  { label: "Experiences", href: "/experiences" },
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

  // For the Saudi style, we want a dark background even at the top, or slightly transparent.
  // The screenshot shows a solid dark grey. Let's use a solid dark header that matches the screenshot exactly.
  const isTransparent = isHome && !isScrolled;

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: "rgba(10, 35, 32, 0.96)", // Dark base
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            padding: "16px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            maxWidth: 1920,
            margin: "0 auto",
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: 24,
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
              gap: 28,
              flexWrap: "nowrap",
            }}
          >
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/');
              return (
                <div key={link.label} className="group relative flex items-center" style={{ height: "100%" }}>
                  <Link
                    href={link.href}
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#FFFFFF",
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                      fontFamily: "'Inter', sans-serif",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "8px 0",
                      position: "relative"
                    }}
                  >
                    {link.label}
                    {link.hasDropdown && <ChevronDown size={14} style={{ opacity: 0.8 }} />}
                    
                    {/* Active Underline */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-underline"
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: 2,
                          background: "#850064", // Saudi purple
                          borderRadius: 2
                        }}
                      />
                    )}
                  </Link>

                  {/* Dropdown Menu (only visible on hover) */}
                  {link.hasDropdown && (
                    <div 
                      className="absolute top-full left-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                      style={{
                        background: "#FFFFFF",
                        padding: "16px 24px",
                        borderRadius: 12,
                        minWidth: 220,
                        boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        marginTop: 16
                      }}
                    >
                      <Link href={link.href} className="dropdown-link">Explore All</Link>
                      <Link href={link.href + "?type=popular"} className="dropdown-link">Popular Spots</Link>
                      <Link href={link.href + "?type=hidden"} className="dropdown-link">Hidden Gems</Link>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Icons + Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexShrink: 0,
            }}
          >
            {/* Accessibility icon */}
            <button
              className="nav-btn-outline"
              title="Accessibility"
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Accessibility size={18} />
            </button>

            {/* Search */}
            <button className="nav-btn-outline" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 20 }}>
              <Search size={16} />
              <span>Search</span>
            </button>

            {/* Language */}
            <button className="nav-btn-outline" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 20 }}>
              <Globe size={16} />
              <span>EN</span>
            </button>

            {/* Log In / Sign Up */}
            {!isLoading && (
              <>
                {user ? (
                  <Link href="/profile" style={{ textDecoration: "none" }}>
                    <button className="nav-btn-filled">
                      Profile
                    </button>
                  </Link>
                ) : (
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="nav-btn-filled"
                  >
                    Log In / Sign Up
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />

      <style>{`
        .nav-btn-outline {
          border: 1px solid rgba(255,255,255,0.8);
          background: transparent;
          color: #FFFFFF;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .nav-btn-outline:hover {
          background: rgba(255,255,255,0.1);
        }
        .nav-btn-filled {
          background: #850064; /* Purple color matching screenshot */
          color: #FFFFFF;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          border: none;
          padding: 8px 24px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .nav-btn-filled:hover {
          background: #700054;
        }
        .dropdown-link {
          color: #333333;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s;
        }
        .dropdown-link:hover {
          color: #850064;
        }
      `}</style>
    </>
  );
}
