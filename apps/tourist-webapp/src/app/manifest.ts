import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UzTour Ecosystem",
    short_name: "UzTour",
    description: "Uzbekistan Digital Tourism Ecosystem",
    start_url: "/",
    display: "standalone",
    background_color: "#F9F8F5",
    theme_color: "#0A2320",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
