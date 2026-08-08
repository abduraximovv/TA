import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Safron — Uzbekistan Travel",
    short_name: "Safron",
    description: "Discover Uzbekistan, book verified local guides and experiences, and plan your trip with Safron.",
    start_url: "/",
    display: "standalone",
    background_color: "#F9F8F5",
    theme_color: "#0A2320",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
