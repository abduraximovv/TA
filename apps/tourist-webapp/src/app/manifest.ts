import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UzTour Tourist",
    short_name: "UzTour",
    description: "Uzbekistan Digital Tourism Ecosystem",
    start_url: "/",
    display: "standalone",
    background_color: "#0A2320",
    theme_color: "#0A2320",
    orientation: "any",
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
