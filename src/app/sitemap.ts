import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

/**
 * Stable build-time date for `lastModified`.
 *
 * Using `new Date()` here would stamp every URL as modified on every crawl,
 * confusing Googlebot and wasting crawl budget. Instead we pin to the
 * deployment date (injected by CI as NEXT_PUBLIC_BUILD_DATE, e.g.
 * "2026-11-11") and fall back to the build timestamp so it still advances
 * on each deploy without pretending pages change between deployments.
 *
 * Content-heavy pages (guides, DB) carry their own date so Google can tell
 * when they were last meaningfully updated.
 */
const BUILD_DATE = new Date(process.env.NEXT_PUBLIC_BUILD_DATE ?? Date.now());

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE.url,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE.url}/db/materials`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...["/db/characters", "/db/weapons", "/db/artifacts"].map((path) => ({
      url: `${SITE.url}${path}`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: `${SITE.url}/guides`,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...[
      "/guides/genshin-inventory-scanner",
      "/guides/screenshot-to-good-export",
      "/guides/video-inventory-scanner",
    ].map((path) => ({
      url: `${SITE.url}${path}`,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    {
      url: `${SITE.url}/feedback`,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${SITE.url}/about`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE.url}/versions`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
