"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function HeroSection() {
  const [region, setRegion] = useState("Samarkand & Bukhara");
  const [dates, setDates] = useState("14 – 21 Sep");
  const router = useRouter();

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        height: "92vh",
        minHeight: 680,
        overflow: "hidden",
      }}
    >
      {/* Background Image */}
      <div style={{ position: "absolute", inset: 0 }}>
        <Image
          src="/images/registan_4k.png"
          alt="Registan Square, Samarkand, Uzbekistan"
          fill
          priority
          unoptimized
          className="object-cover"
          quality={100}
          sizes="100vw"
        />
      </div>

      {/* Gradient overlay — matches design exactly */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.75) 100%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Hero text content — left aligned */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "absolute",
          left: 0,
          top: 150,
          zIndex: 2,
          maxWidth: "38%",
          padding: "0 56px",
        }}
      >
        {/* Eyebrow label */}
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#C5A880",
            marginBottom: 18,
          }}
        >
          Republic of Uzbekistan · Official Tourism Platform
        </div>

        {/* Main heading */}
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 600,
            fontSize: 44,
            lineHeight: 1.15,
            color: "#FFFFFF",
            margin: "0 0 18px",
          }}
        >
          Four Thousand Years of the Silk Road, One Journey.
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.85)",
            margin: "0 0 30px",
          }}
        >
          From the turquoise domes of Samarkand to the mountain trails of
          Chimgan — plan, translate, and book with verified local providers.
        </p>

        {/* CTA Buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 34,
          }}
        >
          <Link
            href="/service"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: 14,
              padding: "14px 26px",
              background: "#F9F8F5",
              color: "#0A2320",
              border: "none",
              borderRadius: 3,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              whiteSpace: "nowrap",
              flexShrink: 0,
              textDecoration: "none",
              transition: "background 0.2s",
            }}
          >
            Plan My Journey <span>→</span>
          </Link>
          <Link
            href="/map"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: 14,
              padding: "13px 24px",
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
              color: "#FFFFFF",
              border: "1px solid rgba(255,255,255,0.4)",
              borderRadius: 3,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              textDecoration: "none",
              transition: "background 0.2s",
            }}
          >
            Open Survival Map
          </Link>
        </div>

        {/* Quick Search Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 6,
            padding: 6,
          }}
        >
          {/* Region Field */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              padding: "8px 16px",
              borderRight: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.6)",
                marginBottom: 2,
              }}
            >
              Region
            </div>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              style={{
                fontSize: 13,
                color: "#FFFFFF",
                background: "transparent",
                border: "none",
                outline: "none",
                fontFamily: "'Inter', sans-serif",
                width: "100%",
              }}
            />
          </div>

          {/* Dates Field */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              padding: "8px 16px",
            }}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.6)",
                marginBottom: 2,
              }}
            >
              Dates
            </div>
            <input
              type="text"
              value={dates}
              onChange={(e) => setDates(e.target.value)}
              style={{
                fontSize: 13,
                color: "#FFFFFF",
                background: "transparent",
                border: "none",
                outline: "none",
                fontFamily: "'Inter', sans-serif",
                width: "100%",
              }}
            />
          </div>

          {/* Search Button */}
          <button
            onClick={() =>
              router.push(`/discover?region=${encodeURIComponent(region)}`)
            }
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: 13,
              padding: "11px 18px",
              background: "#006B70",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "background 0.2s",
            }}
          >
            Search
          </button>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.75)",
          }}
        >
          Scroll
        </div>
        <div
          style={{
            width: 1,
            height: 34,
            background: "rgba(255,255,255,0.4)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: 1,
              height: 12,
              background: "#FFFFFF",
              position: "absolute",
              top: 0,
              left: 0,
              animation: "scrollBob 1.8s ease-in-out infinite",
            }}
          />
        </div>
      </div>
    </section>
  );
}
