"use client";

import React, { useEffect, useState } from "react";
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
  const [activeIndex, setActiveIndex] = useState(0);

  // Hidden on auth pages
  if (pathname.startsWith("/auth")) {
    return null;
  }

  // Update active index based on route
  useEffect(() => {
    const idx = navItems.findIndex((item) => 
      pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
    );
    if (idx !== -1) setActiveIndex(idx);
    else setActiveIndex(0); // fallback
  }, [pathname]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe px-4 mb-4">
      <div
        className="relative bg-[#0A2320] rounded-3xl h-[60px] flex items-center justify-between shadow-2xl"
        style={{ filter: "drop-shadow(0px 8px 16px rgba(10,35,32,0.2))" }}
      >

        {/* The Animated Indicator (Cutout) */}
        <div
          className="absolute top-[-16px] w-[52px] h-[52px] z-10 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none"
          style={{
            left: `calc((100% / 5) * ${activeIndex} + (100% / 10))`,
            transform: "translateX(-50%)"
          }}
        >
          {/* Main Cutout Circle (White Border + Green Center) */}
          <div className="absolute inset-0 rounded-full border-[4px] border-[#F8F9FA] bg-[#0A2320]" />
        </div>

        {/* The Nav Items */}
        {navItems.map((item, i) => {
          const isActive = activeIndex === i;
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className="relative z-20 flex-1 flex flex-col items-center justify-center h-full tap-target"
            >
              {/* Icon Container */}
              <div
                className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  isActive ? '-translate-y-[20px] text-white' : 'translate-y-[0px] text-white/50 hover:text-white/80'
                }`}
              >
                <Icon className="transition-all duration-500 w-5 h-5" />
              </div>

              {/* Label */}
              <span
                className={`absolute text-[9px] font-semibold transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  isActive ? "bottom-[9px] opacity-100 text-white" : "bottom-[0px] opacity-0 text-white/50 translate-y-4"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
