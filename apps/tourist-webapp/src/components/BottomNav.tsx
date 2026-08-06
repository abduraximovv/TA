"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, Package, Sparkles, User } from "lucide-react";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Destinations", href: "/discover", icon: MapPin },
  { label: "Packages", href: "/packages", icon: Package },
  { label: "Experiences", href: "/experiences", icon: Sparkles },
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
      className="fixed bottom-0 left-0 right-0 z-[100]"
      style={{
        background: "rgba(249, 248, 245, 0.96)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(10,35,32,0.08)",
        boxShadow: "0 -4px 20px rgba(10,35,32,0.06)",
        // Real home-indicator clearance on iOS/Android, 0px everywhere else.
        paddingBottom: "var(--safe-bottom)",
      }}
    >
      <div className="flex items-stretch justify-around max-w-lg mx-auto" style={{ height: "var(--bottom-nav-height)" }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="tap-target tap-active relative flex flex-col items-center justify-center flex-1 h-full gap-0.5"
              style={{
                color: isActive ? "#0A2320" : "rgba(10,35,32,0.45)",
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
