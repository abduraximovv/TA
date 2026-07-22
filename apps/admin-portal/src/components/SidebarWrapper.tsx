"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login" || pathname === "/"; // Assuming / redirects or is public

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Sidebar />
      <div className="pl-[240px]">
        <main className="w-full min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
