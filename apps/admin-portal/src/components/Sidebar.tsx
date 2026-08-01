"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@repo/auth";
import { LogOut } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Verification Hub", href: "/verification-hub" },
    { label: "Destinations", href: "/destinations" },
    { label: "Providers", href: "/providers" },
    { label: "Analytics", href: "/analytics" },
    { label: "Settings", href: "/settings" },
  ];

  return (
    <aside 
      style={{ 
        width: 250, 
        flexShrink: 0, 
        background: "#0A2320", 
        display: "flex", 
        flexDirection: "column", 
        padding: "28px 0",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 50
      }}
    >
      <div style={{ padding: "0 24px 28px", marginBottom: 12, borderBottom: "1px solid rgba(249,248,245,0.1)" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 19, color: "#F9F8F5" }}>
          Silk&nbsp;Road
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "#C5A880", marginTop: 4 }}>
          Admin Portal
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 14px" }}>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{ textDecoration: "none" }}
            >
              <div 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 12, 
                  padding: "11px 12px", 
                  borderRadius: 5, 
                  cursor: "pointer", 
                  background: isActive ? "rgba(197,168,128,0.14)" : "transparent",
                  transition: "background 0.2s"
                }}
                className="admin-nav-item"
              >
                <div 
                  style={{ 
                    width: 7, 
                    height: 7, 
                    borderRadius: 2, 
                    flexShrink: 0, 
                    background: isActive ? "#C5A880" : "rgba(249,248,245,0.4)" 
                  }}
                />
                <div 
                  style={{ 
                    fontSize: 14, 
                    fontWeight: isActive ? 600 : 500, 
                    color: isActive ? "#C5A880" : "rgba(249,248,245,0.75)",
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  {item.label}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div style={{ marginTop: "auto", padding: "16px 24px 0", borderTop: "1px solid rgba(249,248,245,0.1)" }}>
        
        {/* User Info & Logout */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(249,248,245,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F9F8F5", fontWeight: 600, fontSize: 13, flexShrink: 0 }}>
             {user?.email?.charAt(0).toUpperCase() || "A"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#F9F8F5", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
              {user?.email || "Admin"}
            </div>
            <div style={{ fontSize: 11, color: "rgba(249,248,245,0.5)", marginTop: 2 }}>
              Super Admin
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            style={{ background: "transparent", border: "none", color: "rgba(249,248,245,0.5)", cursor: "pointer", padding: 4 }}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>

        {/* System Status */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 16, borderTop: "1px solid rgba(249,248,245,0.1)" }}>
          <div style={{ width: 8, height: 8, borderRadius: 100, background: "#4ADE80", flexShrink: 0 }}></div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: "rgba(249,248,245,0.6)" }}>
            System Operational
          </div>
        </div>
      </div>

      <style>{`
        .admin-nav-item:hover { background: rgba(197,168,128,0.08) !important; }
      `}</style>
    </aside>
  );
}
