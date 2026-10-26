/**
 * Site-wide identity used by SEO metadata, the sitemap, robots.txt,
 * Open Graph images and structured data.
 */

/** Production origin, used everywhere unless NEXT_PUBLIC_SITE_URL overrides it. */
const DEFAULT_SITE_URL = "https://gi-helper.vercel.app";

/**
 * Absolute origin of the site (no trailing slash). Canonical URLs, the sitemap
 * and share images always point at production, even from local or preview builds.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return (explicit || DEFAULT_SITE_URL).replace(/\/+$/, "");
}

export const SITE = {
  name: "GI Helper",
  url: resolveSiteUrl(),
  title: "Genshin Inventory Scanner – Web-Based & Kamera Alternative",
  description:
    "Free web-based Genshin Impact inventory scanner. Scan materials, weapons, artifacts & characters in your browser. Fast Kamera alternative with GOOD export.",
  keywords: [
    "Genshin Impact",
    "Genshin inventory scanner",
    "genshin web based inventory scanner",
    "genshin web scanner",
    "genshin online inventory scanner",
    "genshin kamera",
    "inventory kamera",
    "genshin kamera alternative",
    "inventory kamera web",
    "inventory kamera alternative web",
    "genshin artifact scanner",
    "genshin weapon scanner",
    "genshin material scanner",
    "genshin screen recording scanner",
    "GOOD format export",
    "genshin optimizer scanner",
    "genshin optimizer import",
    "in-browser genshin scanner",
    "mobile genshin scanner",
    "genshin screenshot scanner",
    "ascension materials",
    "talent books",
  ],
  locale: "en_US",
  themeColor: "#10232d",
  themeColorLight: "#f0fbfb",
  ogImageAlt:
    "GI Helper: Web-based Genshin Impact inventory scanner and Kamera alternative. Read materials, weapons, artifacts and characters from screenshots.",
} as const;
