"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { MapPin, MapPinKind } from "@/components/map/mapConstants";
import { MapFilters } from "@/components/map/MapFilters";

const ExploreMap = dynamic(() => import("@/components/map/ExploreMap").then((m) => m.ExploreMap), {
  ssr: false,
  loading: () => (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(10,35,32,0.4)", fontSize: 13 }}>
      Loading map…
    </div>
  ),
});

interface Props {
  pins: MapPin[];
}

const DEFAULT_LAYERS: Record<MapPinKind, boolean> = {
  destination: true,
  experience: true,
  event: true,
};

export function MapPageClient({ pins }: Props) {
  const [query, setQuery] = useState("");
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
  const [densityMode, setDensityMode] = useState(false);

  const experienceCategories = useMemo(
    () => Array.from(new Set(pins.filter((p) => p.kind === "experience" && p.category).map((p) => p.category as string))).sort(),
    [pins]
  );

  const filteredPins = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pins.filter((pin) => {
      if (!layers[pin.kind]) return false;
      if (pin.kind === "experience" && activeCategories.size > 0 && !activeCategories.has(pin.category || "")) return false;
      if (q) {
        const haystack = `${pin.name} ${pin.city || ""} ${pin.category || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [pins, layers, activeCategories, query]);

  const toggleLayer = (kind: MapPinKind) => setLayers((prev) => ({ ...prev, [kind]: !prev[kind] }));

  const toggleCategory = (category: string) =>
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Contains Leaflet's own internal z-index (its zoom control runs up to 1000) inside a new
          stacking context, so it can never paint over the MapFilters panel below, which is a
          plain sibling rather than a descendant of the map. */}
      <div style={{ position: "relative", zIndex: 0, width: "100%", height: "100%" }}>
        <ExploreMap pins={filteredPins} densityMode={densityMode} />
      </div>

      <MapFilters
        query={query}
        onQueryChange={setQuery}
        layers={layers}
        onToggleLayer={toggleLayer}
        categories={experienceCategories}
        activeCategories={activeCategories}
        onToggleCategory={toggleCategory}
        densityMode={densityMode}
        onToggleDensity={() => setDensityMode((v) => !v)}
        resultCount={filteredPins.length}
        totalCount={pins.length}
      />
    </div>
  );
}
