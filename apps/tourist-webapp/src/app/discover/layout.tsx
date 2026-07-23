import React from "react";
export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {children}
    </div>
  );
}
