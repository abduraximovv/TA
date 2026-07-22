"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, MessageSquare, Compass, User } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/dashboard", icon: Compass },
    { label: "Map", href: "/map", icon: Map },
    { label: "Translate", href: "/translator", icon: MessageSquare },
    { label: "Profile", href: "/profile", icon: User },
  ];

  // Do not show bottom nav on auth pages
  if (pathname.startsWith("/login")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? "text-[#1E6F8A]" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
