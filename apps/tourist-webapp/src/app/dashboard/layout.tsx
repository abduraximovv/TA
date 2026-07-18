"use client";

import React from "react";
import { BottomNav } from "../../components/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pb-16 min-h-screen bg-[#F9FAFB]">
      {children}
      <BottomNav />
    </div>
  );
}
