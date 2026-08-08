import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Safron Provider Portal",
    short_name: "Safron Pro",
    description: "Manage your listings, bookings, and reviews as a verified Safron provider.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A2320",
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
