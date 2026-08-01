"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, MessageSquare, Compass, User, Home } from "lucide-react";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Discover", href: "/discover", icon: Compass },
  { label: "Map", href: "/map", icon: Map },
  { label: "Translate", href: "/translator", icon: MessageSquare },
  { label: "Profile", href: "/profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hidden on auth pages (no chrome during sign-in/registration) and on the landing page
  // itself, where the full-bleed hero is meant to read as an immersive, chrome-free moment —
  // matches Navbar's own transparent-over-hero treatment on "/".
  if (pathname === "/" || pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[100] pb-[env(safe-area-inset-bottom)]"
      style={{
        background: "rgba(249, 248, 245, 0.96)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(10,35,32,0.08)",
        boxShadow: "0 -4px 20px rgba(10,35,32,0.06)",
      }}
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-full h-full space-y-0.5 transition-all duration-300"
              style={{
                color: isActive ? "#0A2320" : "rgba(10,35,32,0.4)",
                transform: isActive ? "translateY(-2px)" : "none",
              }}
            >
              <Icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.5 : 1.8} />
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 10,
                  letterSpacing: "0.02em",
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                {item.label}
              </span>
              {isActive && (
                <div
                  className="absolute -bottom-[2px] w-1.5 h-1.5 rounded-full"
                  style={{ background: "#C5A880", boxShadow: "0 0 8px rgba(197,168,128,0.8)" }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
