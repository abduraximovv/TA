"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login" || pathname === "/" || pathname.startsWith("/auth/login"); 

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh", fontFamily: "'Inter', sans-serif", background: "#F9F8F5" }}>
      <Sidebar />
      <div style={{ paddingLeft: 250, flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}
