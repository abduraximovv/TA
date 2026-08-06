// Pure types/constants shared between ExploreMap (which imports leaflet -- browser-only, must
// stay behind next/dynamic(..., { ssr: false })) and MapFilters (a small, SSR-safe UI panel).
// MapFilters must NOT import anything from ExploreMap.tsx directly: even a "just the constants"
// import there forces webpack to evaluate the whole module -- including leaflet's top-level
// `window` access -- during server rendering, which crashes with "window is not defined".

export type MapPinKind = "destination" | "experience" | "event";

export interface MapPin {
  id: string;
  kind: MapPinKind;
  name: string;
  lat: number;
  lng: number;
  image: string | null;
  description: string | null;
  category: string | null;
  city: string | null;
  meta: string | null;
  href: string;
  featured: boolean;
  ratingCount: number;
}

export const KIND_COLOR: Record<MapPinKind, string> = {
  destination: "#006B70",
  experience: "#C5A880",
  event: "#C1592A",
};

export const KIND_LABEL: Record<MapPinKind, string> = {
  destination: "Destination",
  experience: "Experience",
  event: "Event",
};

export type DensityLevel = "quiet" | "moderate" | "busy";

export const LEVEL_COLOR: Record<DensityLevel, string> = {
  quiet: "#3FA34D",
  moderate: "#C5A880",
  busy: "#C1592A",
};

export const LEVEL_LABEL: Record<DensityLevel, string> = {
  quiet: "Quiet",
  moderate: "Moderate",
  busy: "Busy",
};
