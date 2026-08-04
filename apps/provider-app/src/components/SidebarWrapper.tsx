"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChromeless = pathname === "/" || pathname.startsWith("/auth");

  if (isChromeless) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F9F8F5]">
      <Sidebar />
      <div className="pl-[240px]">
        <main className="w-full min-h-screen">{children}</main>
      </div>
    </div>
  );
}
