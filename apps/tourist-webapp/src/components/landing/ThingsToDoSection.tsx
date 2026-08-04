"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { LayoutGrid, TreePine, Landmark, ShoppingBag, UtensilsCrossed, MapPin, Check } from "lucide-react";
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
    image: "https://images.unsplash.com/photo-1624792301219-f4a98797f81e?q=80&w=700",
  },
  {
    id: "t-2",
    title: "Chorsu Bazaar",
    city: "Tashkent",
    category: "bazaar",
    image: "https://images.unsplash.com/photo-1601963404496-e6fcffa44f71?q=80&w=700",
  },
  {
    id: "t-3",
    title: "Chimgan Ridgeline Trek",
    city: "Chimgan",
    category: "nature",
    image: "https://images.unsplash.com/photo-1726547507018-606c37f09b82?q=80&w=700",
  },
  {
    id: "t-4",
    title: "Plov Masterclass",
    city: "Fergana Valley",
    category: "food",
    image: "https://images.unsplash.com/photo-1671048116858-e8ef69175b2d?q=80&w=700",
  },
  {
    id: "t-5",
    title: "Itchan Kala Walls",
    city: "Khiva",
    category: "culture",
    image: "https://images.unsplash.com/photo-1744873332054-d982edc655dd?q=80&w=700",
  },
  {
    id: "t-6",
    title: "Nuratau Yurt Camp",
    city: "Nurata",
    category: "nature",
    image: "https://images.unsplash.com/photo-1621425022689-308a7b7691a3?q=80&w=700",
  },
  {
    id: "t-7",
    title: "Rishtan Ceramic Workshop",
    city: "Rishtan",
    category: "culture",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=700",
  },
  {
    id: "t-8",
    title: "Siyob Bazaar Food Tour",
    city: "Samarkand",
    category: "food",
    image: "https://images.unsplash.com/photo-1629649407271-2dac934c1f1b?q=80&w=700",
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

  const tiles = useMemo(() => {
    const source =
      experiences.length >= 6
        ? experiences.slice(0, 8).map((e) => ({
            id: e.id,
            title: e.title,
            city: e.city || e.region || "Uzbekistan",
            category: normalizeCategory(e.category || "culture"),
            image: e.image_url || FALLBACK_TILES[0].image,
          }))
        : FALLBACK_TILES;
    return active === "all" ? source : source.filter((t) => t.category === active);
  }, [experiences, active]);

  return (
    <section style={{ padding: "88px 56px 100px", background: "#FFFFFF" }}>
      <div style={{ marginBottom: 8 }}>
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
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 36 }}>
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

      {/* Flush, zero-radius grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 2,
        }}
      >
        {tiles.map((tile, i) => (
          <motion.div
            key={tile.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <Link href="/service" style={{ textDecoration: "none", display: "block" }}>
              <div style={{ position: "relative", height: 220, overflow: "hidden" }} className="discover-card">
                <Image
                  src={tile.image}
                  alt={tile.title}
                  fill
                  className="object-cover discover-card-img"
                  sizes="(max-width: 1280px) 25vw, 300px"
                />
              </div>
              <div style={{ padding: "12px 4px 0", height: 68, overflow: "hidden" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 10.5,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "rgba(10,35,32,0.5)",
                    marginBottom: 4,
                    fontFamily: "'Inter', sans-serif",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  <MapPin size={11} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {tile.city} | {FILTERS.find((f) => f.key === tile.category)?.label || "Culture"}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 14.5,
                    lineHeight: 1.3,
                    fontWeight: 600,
                    color: "#0A2320",
                    fontFamily: "'Inter', sans-serif",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {tile.title}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
