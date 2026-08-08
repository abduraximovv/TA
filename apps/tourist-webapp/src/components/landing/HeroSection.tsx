"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

const SLIDE_DURATION = 6500;

const SLIDES = [
  {
    id: "registan",
    eyebrow: "Silk Road Uzbekistan · Independent Travel Platform",
    headline: "Four Thousand Years of the Silk Road, One Journey.",
    subtitle:
      "From the turquoise domes of Samarkand to the mountain trails of Chimgan — plan, translate, and book with verified local providers.",
    image: "/images/registan_4k.png",
    cta: { label: "Plan My Journey", href: "/service" },
  },
  {
    id: "sharq",
    eyebrow: "Sharq Taronalari · Samarkand",
    headline: "Where East Meets Melody.",
    subtitle:
      "Every two years, musicians from across the world gather beneath the Registan for Central Asia's grandest festival of song.",
    image:
      "https://images.unsplash.com/photo-1733586092622-1b3201e802a5?q=80&w=2400&auto=format&fit=crop",
    cta: { label: "See Uzbekistan Calendar", href: "/discover" },
  },
  {
    id: "khiva",
    eyebrow: "Itchan Kala · Khiva",
    headline: "Step Inside a Living Museum City.",
    subtitle:
      "Wander mudbrick walls untouched for centuries — Khiva's old town is a UNESCO World Heritage site you can still sleep inside.",
    image:
      "https://images.unsplash.com/photo-1728115214399-ad40d93eb935?q=80&w=2400&auto=format&fit=crop",
    cta: { label: "Discover Khiva", href: "/discover" },
  },
  {
    id: "chimgan",
    eyebrow: "Chimgan Highlands · Tashkent Region",
    headline: "Mountains, Yurts & Open Sky.",
    subtitle:
      "An hour from the capital, trek pine-covered ridgelines and sleep under the stars in a traditional Uzbek yurt camp.",
    image:
      "https://images.unsplash.com/photo-1619955498702-edf6cbdb8803?q=80&w=2400&auto=format&fit=crop",
    cta: { label: "Book an Adventure", href: "/packages" },
  },
];

export function HeroSection() {
  const [region, setRegion] = useState("Samarkand & Bukhara");
  const [dates, setDates] = useState("14 – 21 Sep");
  const [current, setCurrent] = useState(0);
  const [muted, setMuted] = useState(true);
  const router = useRouter();

  const goTo = useCallback((i: number) => {
    setCurrent(((i % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => goTo(current + 1), SLIDE_DURATION);
    return () => clearTimeout(timer);
  }, [current, goTo]);

  const slide = SLIDES[current];

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Background image — crossfades between slides */}
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
          style={{ position: "absolute", inset: 0 }}
        >
          <Image
            src={slide.image}
            alt={slide.headline}
            fill
            priority={current === 0}
            className="object-cover"
            quality={90}
            sizes="100vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.8) 100%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Mute toggle — top-right, echoes VisitSaudi's video hero control */}
      <button
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "Unmute ambience" : "Mute ambience"}
        style={{
          position: "absolute",
          top: 100,
          right: 32,
          zIndex: 2,
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.14)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFFFFF",
          cursor: "pointer",
        }}
      >
        {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>

      {/* Hero text content — left aligned, anchored above the bottom slide tabs, crossfades with slide */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 128,
          zIndex: 2,
          width: "min(92vw, 560px)",
          padding: "0 clamp(20px, 6vw, 56px)",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#C5A880",
                marginBottom: 18,
              }}
            >
              {slide.eyebrow}
            </div>

            <h1
              style={{
                fontFamily: "var(--font-serif), serif",
                fontWeight: 600,
                fontSize: "clamp(26px, 3vw + 14px, 44px)",
                lineHeight: 1.15,
                color: "#FFFFFF",
                margin: "0 0 18px",
              }}
            >
              {slide.headline}
            </h1>

            <p
              style={{
                fontSize: "clamp(14px, 1.5vw + 10px, 16px)",
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.85)",
                margin: "0 0 30px",
              }}
            >
              {slide.subtitle}
            </p>

            <div
              className="flex flex-col sm:flex-row sm:items-center"
              style={{
                gap: 12,
                marginBottom: 34,
              }}
            >
              <Link href={slide.cta.href} className="btn-primary" style={{ textDecoration: "none", gap: 8, whiteSpace: "nowrap" }}>
                {slide.cta.label} <span>→</span>
              </Link>
              <Link href="/map" className="btn-outline-white" style={{ textDecoration: "none", whiteSpace: "nowrap" }}>
                Open Survival Map
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Quick Search Bar — persists across slides */}
        <div
          className="glass-panel"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            borderRadius: 6,
            padding: 6,
          }}
        >
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
                fontFamily: "var(--font-sans), sans-serif",
                width: "100%",
              }}
            />
          </div>

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
                fontFamily: "var(--font-mono), monospace",
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

          <button
            onClick={() => router.push(`/discover?region=${encodeURIComponent(region)}`)}
            className="btn-teal"
          >
            Search
          </button>
        </div>
      </div>

      {/* Slide captions + multicolor progress bar — bottom third, VisitSaudi-style */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2,
          padding: "0 clamp(20px, 6vw, 56px) 28px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 28,
            marginBottom: 14,
            flexWrap: "wrap",
          }}
        >
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              style={{
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: 13,
                fontWeight: i === current ? 700 : 500,
                color: i === current ? "#FFFFFF" : "rgba(255,255,255,0.45)",
                transition: "color 0.3s",
                whiteSpace: "nowrap",
              }}
            >
              {s.id === "registan" && "Silk Road Journey"}
              {s.id === "sharq" && "Sharq Taronalari"}
              {s.id === "khiva" && "Living Museum City"}
              {s.id === "chimgan" && "Mountains & Yurts"}
            </button>
          ))}
        </div>

        {/* Progress bar — segmented, gradient fill animates per active slide */}
        <div style={{ display: "flex", gap: 6 }}>
          {SLIDES.map((s, i) => (
            <div
              key={s.id}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background: "rgba(255,255,255,0.25)",
                overflow: "hidden",
              }}
            >
              <div
                key={i === current ? `active-${current}` : `static-${i}`}
                style={{
                  height: "100%",
                  width: i < current ? "100%" : i === current ? "100%" : "0%",
                  transformOrigin: "left",
                  transform: i === current ? undefined : i < current ? "scaleX(1)" : "scaleX(0)",
                  animation: i === current ? `heroSlideFill ${SLIDE_DURATION}ms linear forwards` : undefined,
                  background:
                    "linear-gradient(90deg, #006B70 0%, #C5A880 50%, #C1592A 100%)",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
