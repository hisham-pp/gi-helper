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
  title: "Genshin Impact Inventory Scanner",
  description:
    "Scan Genshin Impact inventory screenshots to read your materials, weapons, artifacts and characters. Runs in your browser or with AI Vision, then export to GOOD format.",
  keywords: [
    "Genshin Impact",
    "Genshin inventory scanner",
    "Genshin material tracker",
    "Genshin materials list",
    "Genshin weapon scanner",
    "Genshin artifact scanner",
    "screenshot scanner",
    "GOOD format export",
    "Genshin optimizer import",
    "ascension materials",
    "talent books",
  ],
  locale: "en_US",
  themeColor: "#10232d",
  themeColorLight: "#f0fbfb",
  ogImageAlt:
    "GI Helper: Genshin Impact Inventory Scanner. Read materials, weapons, artifacts and characters from screenshots.",
} as const;
