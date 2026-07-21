"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Map as MapIcon, Heart, User } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/discover", icon: Compass, label: "Discover" },
    { href: "/map", icon: MapIcon, label: "Map" },
    { href: "/favorites", icon: Heart, label: "Saved" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-gray-200 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? "text-[#1E6F8A]" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div className={`relative p-1 rounded-xl transition-all duration-300 ${isActive ? "bg-[#1E6F8A]/10" : ""}`}>
                <Icon className={`w-6 h-6 transition-transform duration-300 ${isActive ? "scale-110" : "scale-100"}`} />
              </div>
              <span className={`text-[10px] font-medium tracking-wide ${isActive ? "text-[#1E6F8A]" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
