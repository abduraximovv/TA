"use client";

import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { LayoutGrid, TreePine, Landmark, ShoppingBag, UtensilsCrossed, MapPin, Check, ChevronRight } from "lucide-react";
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const tiles = useMemo(() => {
    const source =
      experiences.length >= 6
        ? experiences.slice(0, 12).map((e) => ({
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
    return active === "all" ? source : source.filter((t) => t.category === active);
  }, [experiences, active]);

  const scrollByCard = () => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-carousel-item]");
    const delta = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.65;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section style={{ padding: "88px 0 100px", background: "#FFFFFF" }}>
      <div style={{ marginBottom: 8, paddingLeft: 56, paddingRight: 56 }}>
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
            fontSize: 36,
            fontWeight: 600,
            color: "#0A2320",
            marginBottom: 32,
          }}
        >
          Things To Do
        </div>

        {/* Filter chips */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {FILTERS.map((f) => {
            const Icon = f.icon;
            const isActive = active === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActive(f.key)}
                className={`filter-chip${isActive ? " active" : ""}`}
              >
                {isActive ? <Check size={13} /> : <Icon size={13} />}
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Full-bleed horizontal photo carousel — flush edge-to-edge tiles, no card chrome */}
      <div style={{ position: "relative", marginTop: 36 }}>
        <div
          ref={scrollRef}
          className="scrollbar-hide snap-x-cards"
          style={{
            display: "flex",
            gap: 24,
            paddingBottom: 8,
            overflowX: "auto",
            overflowY: "hidden",
            scrollSnapType: "x mandatory",
          }}
        >
          {tiles.map((tile, i) => (
            <motion.div
              key={tile.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              data-carousel-item
              style={{ flexShrink: 0, width: "min(920px, 62vw)", scrollSnapAlign: "center" }}
            >
              <Link href={tile.href} style={{ textDecoration: "none", display: "block" }}>
                <div style={{ position: "relative", height: 500, borderRadius: 20, overflow: "hidden" }} className="discover-card">
                  <Image
                    src={tile.image}
                    alt={tile.title}
                    fill
                    className="object-cover discover-card-img"
                    sizes="460px"
                  />
                </div>

                <div style={{ padding: "18px 24px 4px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 11,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "rgba(10,35,32,0.5)",
                        marginBottom: 8,
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
                        fontSize: 20,
                        lineHeight: 1.3,
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

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
                    {tile.price > 0 ? (
                      <span style={{ fontSize: 12.5, color: "rgba(10,35,32,0.6)", fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap" }}>
                        From{" "}
                        <span style={{ fontWeight: 700, color: "#0A2320" }}>
                          {(Number(tile.price) || 0).toLocaleString("en-US").replace(/,/g, " ")}
                        </span>{" "}
                        {tile.currency}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="btn-pill-primary" style={{ fontSize: 12.5, padding: "8px 18px", display: "inline-flex" }}>
                      Book Now
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Floating advance arrow */}
        <button
          onClick={scrollByCard}
          aria-label="Next things to do"
          className="carousel-arrow"
          style={{ position: "absolute", right: 24, top: "40%" }}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
