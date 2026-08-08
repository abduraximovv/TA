"use client";

import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import { LayoutGrid, TreePine, Landmark, ShoppingBag, UtensilsCrossed, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import type { Service } from "@repo/database";

interface Props {
  experiences: Service[];
}

const FILTERS = [
  { key: "all", label: "All", icon: LayoutGrid },
  { key: "nature", label: "Nature", icon: TreePine },
  { key: "culture", label: "Culture & History", icon: Landmark },
  { key: "bazaar", label: "Bazaars", icon: ShoppingBag },
  { key: "food", label: "Food & Beverages", icon: UtensilsCrossed },
];

const FALLBACK_TILES = [
  {
    id: "t-1",
    title: "Registan Ensemble",
    city: "Samarkand",
    category: "culture",
    price: 45000,
    currency: "UZS",
    image: "https://images.unsplash.com/photo-1624792301219-f4a98797f81e?q=80&w=900",
  },
  {
    id: "t-2",
    title: "Chorsu Bazaar",
    city: "Tashkent",
    category: "bazaar",
    price: 0,
    currency: "UZS",
    image: "https://images.unsplash.com/photo-1601963404496-e6fcffa44f71?q=80&w=900",
  },
  {
    id: "t-3",
    title: "Chimgan Ridgeline Trek",
    city: "Chimgan",
    category: "nature",
    price: 220000,
    currency: "UZS",
    image: "https://images.unsplash.com/photo-1726547507018-606c37f09b82?q=80&w=900",
  },
  {
    id: "t-4",
    title: "Plov Masterclass",
    city: "Fergana Valley",
    category: "food",
    price: 95000,
    currency: "UZS",
    image: "https://images.unsplash.com/photo-1671048116858-e8ef69175b2d?q=80&w=900",
  },
  {
    id: "t-5",
    title: "Itchan Kala Walls",
    city: "Khiva",
    category: "culture",
    price: 60000,
    currency: "UZS",
    image: "https://images.unsplash.com/photo-1744873332054-d982edc655dd?q=80&w=900",
  },
  {
    id: "t-6",
    title: "Nuratau Yurt Camp",
    city: "Nurata",
    category: "nature",
    price: 180000,
    currency: "UZS",
    image: "https://images.unsplash.com/photo-1621425022689-308a7b7691a3?q=80&w=900",
  },
  {
    id: "t-7",
    title: "Rishtan Ceramic Workshop",
    city: "Rishtan",
    category: "culture",
    price: 95000,
    currency: "UZS",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=900",
  },
  {
    id: "t-8",
    title: "Siyob Bazaar Food Tour",
    city: "Samarkand",
    category: "food",
    price: 70000,
    currency: "UZS",
    image: "https://images.unsplash.com/photo-1629649407271-2dac934c1f1b?q=80&w=900",
  },
];

function normalizeCategory(raw: string): string {
  const c = raw.toLowerCase();
  if (c.includes("nature") || c.includes("trek") || c.includes("mountain")) return "nature";
  if (c.includes("bazaar") || c.includes("shop")) return "bazaar";
  if (c.includes("food") || c.includes("dining") || c.includes("culinary")) return "food";
  return "culture";
}

export function ThingsToDoSection({ experiences }: Props) {
  const [active, setActive] = useState("all");
  const swiperRef = useRef<SwiperType | null>(null);

  const tiles = useMemo(() => {
    const source =
      experiences.length >= 6
        ? experiences.slice(0, 24).map((e) => ({
            id: e.id,
            title: e.title,
            city: e.city || e.region || "Uzbekistan",
            category: normalizeCategory(e.category || "culture"),
            price: e.price,
            currency: e.currency,
            image: e.image_url || FALLBACK_TILES[0].image,
            href: `/service/${e.id}`,
          }))
        : FALLBACK_TILES.map((t) => ({ ...t, href: "/service" }));
    const filtered = active === "all" ? source : source.filter((t) => t.category === active);

    // Swiper's loop mode (centeredSlides, slidesPerView 2.1) needs roughly 6+ real slides to loop
    // cleanly -- with fewer it logs "not enough slides for loop mode" and mispositions slides.
    // Categories with only 4-5 real items are padded by cycling them so the carousel still loops.
    const MIN_FOR_LOOP = 6;
    if (filtered.length === 0 || filtered.length >= MIN_FOR_LOOP) return filtered;
    const padded = [...filtered];
    for (let i = 0; padded.length < MIN_FOR_LOOP; i++) {
      const src = filtered[i % filtered.length];
      padded.push({ ...src, id: `${src.id}-dup${Math.floor(i / filtered.length)}` });
    }
    return padded;
  }, [experiences, active]);

  return (
    <section style={{ padding: "clamp(40px, 10vw, 88px) 0 clamp(48px, 11vw, 100px)", background: "#FFFFFF" }}>
      <div style={{ marginBottom: 8, paddingLeft: "var(--section-padding-x)", paddingRight: "var(--section-padding-x)" }}>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#006B70",
            marginBottom: 12,
          }}
        >
          Browse by Interest
        </div>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "var(--text-h2)",
            fontWeight: 600,
            color: "#0A2320",
            marginBottom: "clamp(18px, 4vw, 32px)",
          }}
        >
          Things To Do
        </div>

        {/* Filter chips -- horizontally scrollable on narrow screens instead of wrapping into an
            awkward multi-row grid with 64px gaps. */}
        <div
          className="scrollbar-hide flex flex-nowrap overflow-x-auto md:flex-wrap md:overflow-visible md:justify-between"
          style={{ gap: "clamp(18px, 5vw, 64px)", paddingBottom: 4 }}
        >
          {FILTERS.map((f) => {
            const Icon = f.icon;
            const isActive = active === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActive(f.key)}
                className="tap-active"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "clamp(6px, 1.5vw, 12px)",
                  background: "none",
                  border: "none",
                  padding: 0,
                  flexShrink: 0,
                  cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <Icon
                  size={28}
                  className="md:hidden"
                  strokeWidth={1.15}
                  color={isActive ? "#006B70" : "rgba(10,35,32,0.55)"}
                />
                <Icon
                  size={46}
                  className="hidden md:block"
                  strokeWidth={1.15}
                  color={isActive ? "#006B70" : "rgba(10,35,32,0.55)"}
                />
                <span
                  style={{
                    fontSize: "clamp(11px, 3vw, 16px)",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#0A2320" : "rgba(10,35,32,0.65)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {f.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Swiper carousel — circular loop; one long centered slide fills the view, neighbors peek on each side */}
      <div style={{ position: "relative", marginTop: "clamp(20px, 4vw, 36px)" }} className="things-to-do-swiper">
        <Swiper
          key={active}
          modules={[Navigation]}
          onSwiper={(s) => (swiperRef.current = s)}
          loop={tiles.length > 3}
          observer
          observeParents
          centeredSlides
          spaceBetween={12}
          slidesPerView={1.35}
          breakpoints={{
            640: { slidesPerView: 1.8, spaceBetween: 16 },
            1024: { slidesPerView: 2.1, spaceBetween: 20 },
          }}
        >
          {tiles.map((tile) => (
            <SwiperSlide key={tile.id}>
              <Link href={tile.href} style={{ textDecoration: "none", display: "block" }}>
                <div style={{ position: "relative", height: "clamp(160px, 42vw, 500px)", borderRadius: 20, overflow: "hidden" }} className="discover-card">
                  <Image
                    src={tile.image}
                    alt={tile.title}
                    fill
                    priority
                    className="object-cover discover-card-img"
                    sizes="(max-width: 640px) 90vw, 460px"
                  />
                </div>

                <div style={{ padding: "clamp(12px, 3vw, 22px) 4px 4px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "clamp(10px, 3vw, 20px)" }}>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: "clamp(10.5px, 2.6vw, 13px)",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "rgba(10,35,32,0.5)",
                        marginBottom: "clamp(5px, 1.5vw, 10px)",
                        fontFamily: "'Inter', sans-serif",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <MapPin size={12} style={{ flexShrink: 0 }} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {tile.city} | {FILTERS.find((f) => f.key === tile.category)?.label || "Culture"}
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "clamp(15px, 4.2vw, 24px)",
                        lineHeight: 1.25,
                        fontWeight: 600,
                        color: "#0A2320",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {tile.title}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "clamp(7px, 2vw, 12px)", flexShrink: 0 }}>
                    {tile.price > 0 ? (
                      <span style={{ fontSize: "clamp(11px, 2.8vw, 14px)", color: "rgba(10,35,32,0.6)", fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap" }}>
                        From{" "}
                        <span style={{ fontWeight: 700, color: "#0A2320" }}>
                          {(Number(tile.price) || 0).toLocaleString("en-US").replace(/,/g, " ")}
                        </span>{" "}
                        {tile.currency}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="btn-pill-primary" style={{ fontSize: "clamp(11px, 2.8vw, 14px)", padding: "clamp(6px, 1.8vw, 10px) clamp(12px, 3.5vw, 22px)", display: "inline-flex" }}>
                      Book Now
                    </span>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Prev/next arrows — visitsaudi-style floating circular controls */}
        <button
          onClick={() => swiperRef.current?.slidePrev()}
          aria-label="Previous things to do"
          className="carousel-arrow"
          style={{ position: "absolute", left: 24, top: "38%", zIndex: 5 }}
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => swiperRef.current?.slideNext()}
          aria-label="Next things to do"
          className="carousel-arrow"
          style={{ position: "absolute", right: 24, top: "38%", zIndex: 5 }}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
