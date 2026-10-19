import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

/**
 * Web app manifest (served at /manifest.webmanifest and linked automatically).
 * Built from the site identity so the install name and colours stay in sync.
 * Icons come from `pnpm build:brand-icons`.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${SITE.name}: ${SITE.title}`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: SITE.themeColor,
    theme_color: SITE.themeColor,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    // Web Share Target: allows mobile players to share screenshots directly into GI Helper
    share_target: {
      action: "/",
      method: "POST",
      enctype: "multipart/form-data",
      params: {
        files: [
          {
            name: "images",
            accept: ["image/*"],
          },
        ],
      },
    },
    shortcuts: [
      {
        name: "Scanner",
        url: "/",
        description: "Open the inventory screenshot and video scanner",
      },
      {
        name: "Inventory",
        url: "/inventory/materials",
        description: "View and manage scanned materials and gear",
      },
      {
        name: "Database",
        url: "/db/materials",
        description: "Browse Genshin Impact materials, weapons, and characters",
      },
    ],
  } as MetadataRoute.Manifest;
}
