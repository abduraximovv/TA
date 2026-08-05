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
}

interface Props {
  pins: MapPinData[];
  hovered: string | null;
  onHoverPin: (name: string | null) => void;
}

function pinIcon(featured: boolean, active: boolean) {
  const size = active ? (featured ? 20 : 15) : featured ? 16 : 11;
  const color = featured ? "#006B70" : "#C1592A";
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2.5px solid #FFFFFF;box-shadow:0 2px 8px rgba(10,35,32,0.35);transition:width 0.15s,height 0.15s;"></div>`,
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
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <FitBounds pins={pins} />
      {pins.map((pin) => (
        <Marker
          key={pin.name}
          position={[pin.lat, pin.lng]}
          icon={pinIcon(pin.featured, hovered === pin.name)}
          eventHandlers={{
            mouseover: () => onHoverPin(pin.name),
            mouseout: () => onHoverPin(null),
          }}
        >
          <Tooltip direction="top" offset={[0, -8]} opacity={1} className="destinations-map-tooltip">
            {pin.name}
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
