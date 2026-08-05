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

export function KnowTheDestinationsSection({ destinations }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

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
        .map((item, i) => ({ name: item.name, lat: item.lat, lng: item.lng, featured: i < 3 })),
    [list]
  );

  return (
    <section style={{ padding: "88px 56px 96px", background: "#FFFFFF" }}>
      <div style={{ marginBottom: 40 }}>
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
          Interactive Map
        </div>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 36,
            fontWeight: 600,
            color: "#0A2320",
          }}
        >
          Know the Destinations
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 32 }}>
        {/* Left: scrollable destination list */}
        <div
          className="scrollbar-hide"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            maxHeight: 480,
            overflowY: "auto",
            paddingRight: 4,
          }}
        >
          {list.map((item) => (
            <div
              key={item.name}
              onMouseEnter={() => setHovered(item.name)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 10,
                borderRadius: 10,
                border: "1px solid #EFEDE7",
                background: hovered === item.name ? "#F9F8F5" : "#FFFFFF",
                transition: "background 0.2s",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 8,
                  overflow: "hidden",
                  position: "relative",
                  flexShrink: 0,
                  background: "#EFEDE7",
                }}
              >
                {item.image && (
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="52px" />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
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
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 14.5,
                      fontWeight: 600,
                      color: "#0A2320",
                    }}
                  >
                    {item.name}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      fontSize: 12,
                      color: "#C1592A",
                      flexShrink: 0,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    <Sun size={12} /> {item.temp}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "rgba(10,35,32,0.5)",
                    marginTop: 2,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {item.tags}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: real map with actual destination coordinates */}
        <div
          style={{
            position: "relative",
            borderRadius: 20,
            overflow: "hidden",
            background: "#F3F1EA",
            minHeight: 480,
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
