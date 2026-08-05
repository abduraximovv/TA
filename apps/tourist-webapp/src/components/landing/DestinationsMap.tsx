"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface MapPinData {
  name: string;
  lat: number;
  lng: number;
  featured: boolean;
  image: string | null;
}

interface Props {
  pins: MapPinData[];
  hovered: string | null;
  onHoverPin: (name: string | null) => void;
}

function pinIcon(imageUrl: string | null, active: boolean) {
  const size = active ? 56 : 44;
  const imgHtml = imageUrl ? `<img src="${imageUrl}" style="width:100%;height:100%;object-fit:cover;" />` : '';
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:#006B70;border:3px solid ${active ? '#C5A880' : '#FFFFFF'};box-shadow:0 4px 12px rgba(10,35,32,0.4);overflow:hidden;transition:all 0.2s;transform: scale(${active ? 1.05 : 1}); z-index: ${active ? 999 : 1}; position: relative;">${imgHtml}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Fits the view to all pins once on mount, matching how the illustrative map used to frame Uzbekistan.
function FitBounds({ pins }: { pins: MapPinData[] }) {
  const map = useMap();
  React.useEffect(() => {
    if (pins.length === 0) return;
    const bounds = L.latLngBounds(pins.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, pins]);
  return null;
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
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <FitBounds pins={pins} />
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
          <Tooltip direction="top" offset={[0, -20]} opacity={1} className="destinations-map-tooltip">
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 14 }}>{pin.name}</span>
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
