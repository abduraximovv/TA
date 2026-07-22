"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, LogOut, Compass, ShieldCheck } from "lucide-react";
import { useAuth } from "@repo/auth";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Services", href: "/services", icon: Package },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, user, isVerified } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <aside className="w-[240px] h-screen bg-primary text-white flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
          <Compass className="w-5 h-5 text-primary" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">UzTour Provider</span>
      </div>

      <nav className="flex-1 px-4 mt-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive ? "bg-white/20 font-semibold" : "hover:bg-white/10 text-blue-100 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-white/20">
        <div className="flex items-center space-x-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-sm font-bold">{user?.email?.charAt(0).toUpperCase() || "P"}</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.email || "Provider"}</p>
            <p className="text-xs text-blue-200 flex items-center gap-1">
              {isVerified ? (
                <>
                  <ShieldCheck className="w-3 h-3" /> Verified Provider
                </>
              ) : (
                "Pending verification"
              )}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg hover:bg-white/10 text-blue-100 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
