"use client";

import React from "react";
import { Calendar, Users, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";

interface TripControlBarProps {
  tripDate: string;
  onDateChange: (d: string) => void;
  guestCount: number;
  onGuestCountChange: (n: number) => void;
  disabled?: boolean;
}

export function TripControlBar({
  tripDate,
  onDateChange,
  guestCount,
  onGuestCountChange,
  disabled = false,
}: TripControlBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-shrink-0 flex items-center gap-3 px-4 py-3 flex-wrap"
      style={{
        background: "rgba(249,248,245,0.92)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(10,35,32,0.08)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      {/* Date Picker */}
      <div
        className="flex items-center gap-2"
        style={{
          background: "#FFFFFF",
          padding: "8px 14px",
          borderRadius: 12,
          border: "1px solid rgba(10,35,32,0.1)",
          boxShadow: "0 2px 8px rgba(10,35,32,0.04)",
        }}
      >
        <Calendar style={{ width: 15, height: 15, color: "#C5A880", flexShrink: 0 }} />
        <input
          type="date"
          value={tripDate}
          min={new Date().toISOString().slice(0, 10)}
          onChange={(e) => onDateChange(e.target.value)}
          disabled={disabled}
          className="outline-none bg-transparent disabled:opacity-50"
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#0A2320",
            fontFamily: "'JetBrains Mono', monospace",
            width: 120,
          }}
        />
      </div>

      {/* Guest Stepper */}
      <div
        className="flex items-center gap-2"
        style={{
          background: "#FFFFFF",
          padding: "6px 12px",
          borderRadius: 12,
          border: "1px solid rgba(10,35,32,0.1)",
          boxShadow: "0 2px 8px rgba(10,35,32,0.04)",
        }}
      >
        <Users style={{ width: 15, height: 15, color: "#C5A880", flexShrink: 0 }} />
        <button
          type="button"
          onClick={() => onGuestCountChange(Math.max(1, guestCount - 1))}
          disabled={disabled || guestCount <= 1}
          className="tap-active flex items-center justify-center disabled:opacity-30"
          style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(10,35,32,0.06)" }}
          aria-label="Decrease guests"
        >
          <ChevronDown style={{ width: 14, height: 14, color: "#0A2320" }} />
        </button>
        <span
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: "#0A2320",
            minWidth: 22,
            textAlign: "center",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {guestCount}
        </span>
        <button
          type="button"
          onClick={() => onGuestCountChange(Math.min(50, guestCount + 1))}
          disabled={disabled || guestCount >= 50}
          className="tap-active flex items-center justify-center disabled:opacity-30"
          style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(10,35,32,0.06)" }}
          aria-label="Increase guests"
        >
          <ChevronUp style={{ width: 14, height: 14, color: "#0A2320" }} />
        </button>
        <span style={{ fontSize: 12, color: "rgba(10,35,32,0.5)", fontWeight: 500 }}>guests</span>
      </div>
    </motion.div>
  );
}
