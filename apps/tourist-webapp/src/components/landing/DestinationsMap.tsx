"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import type { GeoJsonObject } from "geojson";
import "leaflet/dist/leaflet.css";

export interface MapPinData {
  name: string;
  lat: number;
  lng: number;
  featured: boolean;
  image: string | null;
  description: string | null;
}

interface Props {
  pins: MapPinData[];
  hovered: string | null;
  onHoverPin: (name: string | null) => void;
}

// ── Custom HTML/CSS marker (a plain L.divIcon, not the default Leaflet pin) ──
// Circular, fixed size, solid brand-colored border, with the destination's photo as the
// background image -- swap the border/background colors here to re-theme the pins.
function pinIcon(imageUrl: string | null, active: boolean) {
  const size = active ? 56 : 44;
  const imgHtml = imageUrl ? `<img src="${imageUrl}" style="width:100%;height:100%;object-fit:cover;" />` : "";
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:#006B70;border:3px solid ${active ? "#C5A880" : "#FFFFFF"};box-shadow:0 4px 12px rgba(10,35,32,0.4);overflow:hidden;transition:all 0.2s;transform: scale(${active ? 1.05 : 1}); z-index: ${active ? 999 : 1}; position: relative;">${imgHtml}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Fixed regional extent -- southern Kazakhstan in the north, a slice of Afghanistan/Turkmenistan
// in the south, Turkmenistan/Caspian side to the west, Kyrgyzstan/Tajikistan side to the east.
// Keeps Uzbekistan the clear focus while still showing neighboring countries for context,
// regardless of how few/many pins are plotted.
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

// ── GeoJSON country/region border ──
// Fetched at runtime and drawn with a transparent fill + solid stroke, per
// L.geoJSON() usage. Swap BORDER_GEOJSON_URL to point at a different region's boundary file.
const BORDER_GEOJSON_URL = "/geo/uzbekistan-border.geojson";

function CountryBorder({ url }: { url: string }) {
  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setGeoData(data);
      })
      .catch(() => {
        // Border is decorative -- if it fails to load, the map still works fine without it.
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!geoData) return null;

  return (
    <GeoJSON
      data={geoData}
      style={{
        fill: false,
        fillOpacity: 0,
        color: "#006B70",
        weight: 2,
        opacity: 0.85,
      }}
    />
  );
}

export function DestinationsMap({ pins, hovered, onHoverPin }: Props) {
  return (
    <MapContainer
      center={[41.3, 64.5]}
      zoom={6}
      scrollWheelZoom={false}
      style={{ width: "100%", height: "100%", background: "#F3F1EA" }}
      attributionControl={false}
    >
      {/* CartoDB Positron -- free, no API key, light-gray minimalist basemap */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      <CountryBorder url={BORDER_GEOJSON_URL} />

      <FitRegion />

      {/* ── Placeholder-style location data loop ──
          `pins` is populated from real destinations (see KnowTheDestinationsSection.tsx);
          swap the source array for any {name, lat, lng, image, description} list. */}
      {pins.map((pin) => (
        <Marker
          key={pin.name}
          position={[pin.lat, pin.lng]}
          icon={pinIcon(pin.image, hovered === pin.name)}
          eventHandlers={{
            mouseover: () => onHoverPin(pin.name),
            mouseout: () => onHoverPin(null),
          }}
          zIndexOffset={hovered === pin.name ? 1000 : 0}
        >
          <Popup className="destinations-map-popup" closeButton={false}>
            <div style={{ minWidth: 180, maxWidth: 220 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 16, color: "#0A2320", marginBottom: pin.description ? 4 : 0 }}>
                {pin.name}
              </div>
              {pin.description && (
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, lineHeight: 1.45, color: "rgba(10,35,32,0.65)" }}>
                  {pin.description}
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
