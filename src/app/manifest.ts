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
  };
}
