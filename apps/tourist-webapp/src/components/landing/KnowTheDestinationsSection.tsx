"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Sun, CloudSun } from "lucide-react";
import type { Destination } from "@repo/database";
import type { MapPinData } from "./DestinationsMap";

const DestinationsMap = dynamic(() => import("./DestinationsMap").then((m) => m.DestinationsMap), {
  ssr: false,
  loading: () => (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(10,35,32,0.4)", fontSize: 13 }}>
      Loading map…
    </div>
  ),
});

interface Props {
  destinations: Destination[];
}

// Real coordinates for well-known Uzbekistan destinations — used whenever a DB record has no lat/lng of its own.
const KNOWN_COORDS: Record<string, { lat: number; lng: number }> = {
  Tashkent: { lat: 41.2995, lng: 69.2401 },
  Samarkand: { lat: 39.627, lng: 66.975 },
  Bukhara: { lat: 39.7747, lng: 64.4286 },
  Khiva: { lat: 41.3775, lng: 60.3639 },
  Chimgan: { lat: 41.6167, lng: 70.0333 },
  "Chimgan Highlands": { lat: 41.6167, lng: 70.0333 },
  "Fergana Valley": { lat: 40.3894, lng: 71.7869 },
  Fergana: { lat: 40.3894, lng: 71.7869 },
  Nurata: { lat: 40.5675, lng: 65.6892 },
  "Nurata & the Kyzylkum Desert": { lat: 40.5675, lng: 65.6892 },
};

const FALLBACK_LIST = [
  { name: "Tashkent", tags: "Urban, Food", temp: "34°" },
  { name: "Samarkand", tags: "Culture & History", temp: "36°" },
  { name: "Bukhara", tags: "Culture, Bazaars", temp: "35°" },
  { name: "Khiva", tags: "Heritage, Desert", temp: "37°" },
  { name: "Chimgan", tags: "Nature, Adventure", temp: "24°" },
  { name: "Fergana Valley", tags: "Crafts, Food", temp: "33°" },
];

// Verified-working images.unsplash.com photos (images.unsplash.com is an allowed host in next.config.mjs).
// Most match the destination's own image_url in the seed data (packages/database/scripts/seed-full.mjs); Tashkent,
// Nurata, and Khiva use a different photo than their seed row because that row's own image_url/hero_image_url
// is itself a broken/nonexistent Unsplash ID -- see note to the user about fixing that at the source too.
const FALLBACK_IMAGES: Record<string, string> = {
  Tashkent: "https://images.unsplash.com/photo-1715966743489-0ac1138420a5?q=80&w=800",
  Samarkand: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800",
  Bukhara: "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?q=80&w=800",
  Khiva: "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?q=80&w=800",
  Chimgan: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800",
  "Chimgan Highlands": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800",
  "Fergana Valley": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=800",
  Nurata: "https://images.unsplash.com/photo-1694167232441-fd7a2c238d19?q=80&w=800",
  "Nurata & the Kyzylkum Desert": "https://images.unsplash.com/photo-1694167232441-fd7a2c238d19?q=80&w=800",
};

export function KnowTheDestinationsSection({ destinations }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const getValidImage = (name: string, originalImage: string | null) => {
    if (failedImages.has(name)) return FALLBACK_IMAGES[name] || `https://placehold.co/600x400/EFEDE7/0A2320?text=${encodeURIComponent(name)}`;
    return originalImage || FALLBACK_IMAGES[name] || `https://placehold.co/600x400/EFEDE7/0A2320?text=${encodeURIComponent(name)}`;
  };

  const list =
    destinations.length >= 4
      ? destinations.slice(0, 6).map((d, i) => ({
          name: d.name,
          tags: d.region || FALLBACK_LIST[i % FALLBACK_LIST.length].tags,
          temp: FALLBACK_LIST[i % FALLBACK_LIST.length].temp,
          image: d.image_url,
          lat: d.latitude ?? KNOWN_COORDS[d.name]?.lat ?? null,
          lng: d.longitude ?? KNOWN_COORDS[d.name]?.lng ?? null,
        }))
      : FALLBACK_LIST.map((f) => ({
          ...f,
          image: null as string | null,
          lat: KNOWN_COORDS[f.name]?.lat ?? null,
          lng: KNOWN_COORDS[f.name]?.lng ?? null,
        }));

  const pins: MapPinData[] = useMemo(
    () =>
      list
        .filter((item): item is typeof item & { lat: number; lng: number } => item.lat !== null && item.lng !== null)
        .map((item, i) => ({ name: item.name, lat: item.lat, lng: item.lng, featured: i < 3, image: getValidImage(item.name, item.image) })),
    [list, failedImages]
  );

  return (
    <section style={{ padding: "88px 56px 96px", background: "#FFFFFF" }}>
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 42,
            fontWeight: 700,
            color: "#0A2320",
          }}
        >
          Know the Destinations
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 32 }}>
        {/* Left: scrollable destination list with large cards */}
        <div
          className="scrollbar-hide"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            maxHeight: 640,
            overflowY: "auto",
            paddingRight: 8,
          }}
        >
          {list.map((item) => (
            <div
              key={item.name}
              onMouseEnter={() => setHovered(item.name)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: "flex",
                flexDirection: "column",
                borderRadius: 16,
                overflow: "hidden",
                border: hovered === item.name ? "1px solid #006B70" : "1px solid #EFEDE7",
                background: hovered === item.name ? "#F9F8F5" : "#FFFFFF",
                transition: "all 0.2s ease-in-out",
                cursor: "pointer",
                boxShadow: hovered === item.name ? "0 8px 24px rgba(10,35,32,0.08)" : "0 2px 8px rgba(10,35,32,0.03)"
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: 200,
                  position: "relative",
                  background: "#EFEDE7",
                }}
              >
                {item.image || FALLBACK_IMAGES[item.name] ? (
                  <Image 
                    src={getValidImage(item.name, item.image)} 
                    alt={item.name} 
                    fill 
                    className="object-cover" 
                    sizes="400px" 
                    onError={() => {
                      setFailedImages(prev => new Set(prev).add(item.name));
                    }}
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#A8A393", fontFamily: "'Inter', sans-serif", fontSize: 12 }}>
                    No Image Available
                  </div>
                )}
              </div>
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "rgba(10,35,32,0.6)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {item.tags}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#0A2320",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <Sun size={14} color="#C1592A" /> {item.temp}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#0A2320",
                  }}
                >
                  {item.name}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: real map with actual destination coordinates */}
        <div
          style={{
            position: "relative",
            borderRadius: 24,
            overflow: "hidden",
            background: "#E5E3DD",
            minHeight: 640,
            border: "1px solid #EFEDE7",
          }}
        >
          <DestinationsMap pins={pins} hovered={hovered} onHoverPin={setHovered} />

          {/* CTA overlay */}
          <div style={{ position: "absolute", bottom: 20, right: 20, zIndex: 4 }}>
            <Link href="/map" className="btn-teal" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <CloudSun size={14} /> Open Full Survival Map
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
