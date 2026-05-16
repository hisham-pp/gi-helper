import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Genshin Material Tracker",
    short_name: "Material Tracker",
    description:
      "Track Genshin Impact materials, goals, and recursive crafting progress.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f7fb",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
