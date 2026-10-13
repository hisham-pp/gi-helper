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
    "Scan Genshin Impact inventory screenshots to extract every material and quantity. Runs in your browser or with AI Vision, then export to GOOD format.",
  keywords: [
    "Genshin Impact",
    "Genshin inventory scanner",
    "Genshin material tracker",
    "Genshin materials list",
    "screenshot scanner",
    "GOOD format export",
    "Genshin optimizer import",
    "ascension materials",
    "talent books",
  ],
  locale: "en_US",
  themeColor: "#020e13",
  ogImageAlt:
    "GI Helper: Genshin Impact Inventory Scanner. Extract materials from inventory screenshots.",
} as const;
