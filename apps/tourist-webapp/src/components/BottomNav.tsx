"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, MessageSquare, Compass, User, Home } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Discover", href: "/discover", icon: Compass },
    { label: "Map", href: "/map", icon: Map },
    { label: "Translate", href: "/translator", icon: MessageSquare },
    { label: "Profile", href: "/profile", icon: User },
  ];

  // Do not show bottom nav on auth pages or landing page
  if (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-white/95 md:bg-transparent border-t border-gray-100 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-full h-full space-y-0.5 transition-all duration-300 ${
                isActive
                  ? "text-primary -translate-y-0.5"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon
                className="w-[22px] h-[22px]"
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span
                className={`text-[10px] tracking-wide transition-all duration-300 ${
                  isActive ? "font-bold" : "font-medium"
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-[2px] w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(197,168,128,0.8)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
