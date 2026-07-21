import React from "react";
import { BottomNav } from "@/components/navigation/BottomNav";

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      {children}
      <BottomNav />
    </div>
  );
}
