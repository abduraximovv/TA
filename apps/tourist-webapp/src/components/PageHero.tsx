"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface PageHeroProps {
  title: string;
  eyebrow?: string;
  image: string;
  alt: string;
  height?: number;
  style?: React.CSSProperties;
  /** Hide the bottom mosaic strip -- e.g. on pages whose own header content (a chip, a badge)
   * already sits right below the hero, where the strip reads as a redundant second divider. */
  hideMosaicStrip?: boolean;
}

const MOSAIC_STRIP =
  "url(\"data:image/svg+xml,%3Csvg width='40' height='16' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='16' fill='%230A2320'/%3E%3Cpolygon points='10,0 20,8 10,16 0,8' fill='%23006B70'/%3E%3Cpolygon points='10,4 15,8 10,12 5,8' fill='%23C5A880'/%3E%3Cpolygon points='30,0 40,8 30,16 20,8' fill='%23C1592A'/%3E%3Cpolygon points='30,4 35,8 30,12 25,8' fill='%23F9F8F5'/%3E%3Cpolygon points='20,0 30,0 20,8 10,0' fill='%23E3A335'/%3E%3Cpolygon points='20,16 30,16 20,8 10,16' fill='%23E3A335'/%3E%3Cpolygon points='0,0 10,0 0,8' fill='%23004D61'/%3E%3Cpolygon points='0,16 10,16 0,8' fill='%23004D61'/%3E%3Cpolygon points='40,0 30,0 40,8' fill='%23004D61'/%3E%3Cpolygon points='40,16 30,16 40,8' fill='%23004D61'/%3E%3C/svg%3E\")";

/**
 * Shared full-bleed page hero: photo settles in first, then the title fades up,
 * then the mosaic strip unrolls -- used at the top of every top-level content page.
 */
export function PageHero({ title, eyebrow, image, alt, height, style, hideMosaicStrip }: PageHeroProps) {
  return (
    <>
      {/* Mobile Version (Text Only) */}
      <div className="md:hidden pt-8 pb-4 pl-4 pr-6">
        {eyebrow && (
          <div className="font-mono text-[11px] tracking-[0.1em] uppercase text-[#C5A880] mb-2">
            {eyebrow}
          </div>
        )}
        <h1 className="font-serif text-[38px] font-bold text-[#0A2320] m-0 tracking-tight leading-[1.1] whitespace-pre-line">
          {title === "Destinations" ? "Discover\nyour new destination!" : title}
        </h1>
      </div>

      {/* Desktop Version (Full Image Hero) */}
      <div
        className={`hidden md:block relative w-full rounded-[24px] overflow-hidden mb-12 ${height ? '' : 'h-[520px]'}`}
        style={{
          ...(height ? { height } : {}),
          boxShadow: "0 24px 48px -12px rgba(10,35,32,0.25)",
          ...style,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          <Image src={image} alt={alt} fill className="object-cover" priority />
        </motion.div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(10,35,32,0) 30%, rgba(10,35,32,0.6) 70%, rgba(10,35,32,0.95) 100%)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-14 left-12 pr-12"
        >
        {eyebrow && (
          <div className="font-mono text-[10px] md:text-[12px] tracking-[0.1em] uppercase text-[#C5A880] mb-2 md:mb-3">
            {eyebrow}
          </div>
        )}
        <h1 className="font-serif text-5xl md:text-[84px] font-bold text-white m-0 tracking-tight leading-[1.1]">
          {title}
        </h1>
      </motion.div>

      {!hideMosaicStrip && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.7, duration: 0.5, ease: "easeOut" }}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 16,
            transformOrigin: "left center",
            backgroundImage: MOSAIC_STRIP,
            backgroundRepeat: "repeat-x",
            backgroundSize: "auto 100%",
          }}
        />
      )}
    </div>
    </>
  );
}
