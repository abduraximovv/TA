"use client";

import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import type { GeoJsonObject } from "geojson";
import "leaflet/dist/leaflet.css";
import { KIND_COLOR, KIND_LABEL, LEVEL_COLOR, LEVEL_LABEL, type MapPin, type MapPinKind, type DensityLevel } from "./mapConstants";

export type { MapPin, MapPinKind } from "./mapConstants";

interface Props {
  pins: MapPin[];
  densityMode: boolean;
}

// ── Custom HTML/CSS marker: a plain L.divIcon, photo-filled, ringed in the pin's kind color ──
function pinIcon(kind: MapPinKind, imageUrl: string | null, active: boolean) {
  const size = active ? 60 : 38;
  const ring = active ? "#0A2320" : KIND_COLOR[kind];
  const imgHtml = imageUrl
    ? `<img src="${imageUrl}" style="width:100%;height:100%;object-fit:cover;" />`
    : `<div style="width:100%;height:100%;background:${KIND_COLOR[kind]};"></div>`;
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:#EFEDE7;border:3px solid ${ring};box-shadow:0 4px 14px rgba(10,35,32,0.4);overflow:hidden;transition:all 0.2s;transform:scale(${active ? 1.05 : 1});z-index:${active ? 999 : 1};position:relative;">${imgHtml}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const REGION_BOUNDS: [[number, number], [number, number]] = [
  [34.5, 52.5],
  [49.5, 78.5],
];

function FitRegion() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(REGION_BOUNDS);
  }, [map]);
  return null;
}

const BORDER_GEOJSON_URL = "/geo/uzbekistan-border.geojson";

function CountryBorder() {
  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch(BORDER_GEOJSON_URL)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setGeoData(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  if (!geoData) return null;
  return <GeoJSON data={geoData} style={{ fill: false, fillOpacity: 0, color: "#006B70", weight: 2, opacity: 0.85 }} />;
}

const PinMarker = React.memo(function PinMarker({ pin, active, onHoverPin }: { pin: MapPin; active: boolean; onHoverPin: (id: string | null) => void }) {
  const icon = useMemo(() => pinIcon(pin.kind, pin.image, active), [pin.kind, pin.image, active]);
  return (
    <Marker
      position={[pin.lat, pin.lng]}
      icon={icon}
      eventHandlers={{ mouseover: () => onHoverPin(pin.id), mouseout: () => onHoverPin(null) }}
      zIndexOffset={active ? 1000 : pin.kind === "destination" ? 100 : 0}
    >
      <Popup className="explore-map-popup" closeButton={false}>
        <div style={{ minWidth: 200, maxWidth: 240 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: KIND_COLOR[pin.kind], marginBottom: 4 }}>
            {KIND_LABEL[pin.kind]}
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 16, color: "#0A2320", marginBottom: pin.description ? 4 : 0 }}>
            {pin.name}
          </div>
          {pin.meta && (
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(10,35,32,0.55)", marginBottom: 4 }}>{pin.meta}</div>
          )}
          {pin.description && (
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, lineHeight: 1.45, color: "rgba(10,35,32,0.65)", marginBottom: 8 }}>
              {pin.description.length > 120 ? `${pin.description.slice(0, 120)}…` : pin.description}
            </div>
          )}
          <Link
            href={pin.href}
            style={{ display: "inline-block", fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: "#006B70", textDecoration: "none" }}
          >
            View details →
          </Link>
        </div>
      </Popup>
    </Marker>
  );
});

// ── Simulated "live activity" density layer ──
// Real inputs (rating_count, is_featured, how many real pins share a place), combined with a
// deterministic time-of-day curve so the numbers visibly shift depending on when you load the
// page. This is NOT GPS-tracked footfall -- the platform has no session-location telemetry to
// draw that from (see docs/PRD.md F-M03) -- so it's clearly labeled as an estimate in the popup.
interface DensityCluster {
  key: string;
  label: string;
  lat: number;
  lng: number;
  destinations: number;
  experiences: number;
  events: number;
  estimate: number;
  level: DensityLevel;
}

function buildClusters(pins: MapPin[], hourMultiplier: number): DensityCluster[] {
  const groups = new Map<string, MapPin[]>();
  for (const pin of pins) {
    const key = pin.city || pin.name;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(pin);
  }

  const clusters: DensityCluster[] = [];
  groups.forEach((members, key) => {
    const lat = members.reduce((sum, m) => sum + m.lat, 0) / members.length;
    const lng = members.reduce((sum, m) => sum + m.lng, 0) / members.length;
    let score = 0;
    let destinations = 0;
    let experiences = 0;
    let events = 0;
    for (const m of members) {
      score += 15 + Math.min(m.ratingCount, 100) * 1.2 + (m.featured ? 25 : 0) + (m.kind === "destination" ? 40 : 0);
      if (m.kind === "destination") destinations++;
      if (m.kind === "experience") experiences++;
      if (m.kind === "event") events++;
    }
    const estimate = Math.max(12, Math.round(score * hourMultiplier));
    const level: DensityCluster["level"] = estimate < 90 ? "quiet" : estimate < 200 ? "moderate" : "busy";
    clusters.push({ key, label: key, lat, lng, destinations, experiences, events, estimate, level });
  });

  return clusters;
}

function DensityLayer({ pins }: { pins: MapPin[] }) {
  const hourMultiplier = useMemo(() => {
    const hour = new Date().getHours();
    const raw = 0.65 + 0.35 * Math.sin(((hour - 6) / 12) * Math.PI);
    return Math.min(1.15, Math.max(0.5, raw));
  }, []);

  const clusters = useMemo(() => buildClusters(pins, hourMultiplier), [pins, hourMultiplier]);

  return (
    <>
      {clusters.map((c) => {
        // Sized to read as a clear color halo at the region-wide default zoom (Uzbekistan spans
        // ~1000km across, so a "realistic" 1-2km radius would be invisible) -- these are visual
        // activity bubbles, not literal footprint boundaries.
        const radiusMeters = Math.min(48000, 9000 + Math.sqrt(c.estimate) * 2100);
        const color = LEVEL_COLOR[c.level];
        return (
          <Circle
            key={c.key}
            center={[c.lat, c.lng]}
            radius={radiusMeters}
            pathOptions={{ color, weight: 2, fill: true, fillColor: color, fillOpacity: 0.42 }}
          >
            <Popup className="explore-map-popup" closeButton={false}>
              <div style={{ minWidth: 210 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color, marginBottom: 4 }}>
                  {LEVEL_LABEL[c.level]} · Live Activity
                </div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 17, color: "#0A2320", marginBottom: 6 }}>
                  ~{c.estimate} near {c.label}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(10,35,32,0.65)", marginBottom: 8 }}>
                  {[
                    c.destinations ? `${c.destinations} landmark${c.destinations > 1 ? "s" : ""}` : null,
                    c.experiences ? `${c.experiences} experience${c.experiences > 1 ? "s" : ""}` : null,
                    c.events ? `${c.events} event${c.events > 1 ? "s" : ""}` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, fontStyle: "italic", color: "rgba(10,35,32,0.45)", lineHeight: 1.4 }}>
                  Estimated from real listings, ratings & time of day — not GPS tracking.
                </div>
              </div>
            </Popup>
          </Circle>
        );
      })}
    </>
  );
}

export function ExploreMap({ pins, densityMode }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <MapContainer
      center={[41.3, 64.5]}
      zoom={6}
      scrollWheelZoom={true}
      style={{ width: "100%", height: "100%", background: "#F3F1EA" }}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      <CountryBorder />
      <FitRegion />

      {densityMode && <DensityLayer pins={pins} />}

      {pins.map((pin) => (
        <PinMarker key={`${pin.kind}-${pin.id}`} pin={pin} active={hovered === pin.id} onHoverPin={setHovered} />
      ))}
    </MapContainer>
  );
}
