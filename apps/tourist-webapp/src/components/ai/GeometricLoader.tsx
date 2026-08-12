"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

// Timurid-inspired 8-point star lattice -- same motif as .pattern-watermark/.pattern-band-muted
// in globals.css, rebuilt as an animated SVG to mask AI latency. Shared by MenuScanner and
// ItineraryGenerator (and anything else spinning on a Kimi response).
export function GeometricLoader({ label }: { label: string }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16">
      <motion.svg
        width="72"
        height="72"
        viewBox="0 0 48 48"
        animate={prefersReducedMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        <motion.g
          fill="none"
          stroke="#006B70"
          strokeWidth="2"
          animate={prefersReducedMotion ? undefined : { opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="8" y="8" width="16" height="16" transform="rotate(45 16 16)" />
          <rect x="24" y="8" width="16" height="16" transform="rotate(45 32 16)" />
          <rect x="8" y="24" width="16" height="16" transform="rotate(45 16 32)" />
          <rect x="24" y="24" width="16" height="16" transform="rotate(45 32 32)" />
        </motion.g>
      </motion.svg>
      <p className="text-[13px] font-medium" style={{ color: "rgba(10,35,32,0.55)" }}>
        {label}
      </p>
    </div>
  );
}
