import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: SITE.url,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE.url}/db/materials`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...["/db/characters", "/db/weapons", "/db/artifacts"].map((path) => ({
      url: `${SITE.url}${path}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: `${SITE.url}/feedback`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${SITE.url}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE.url}/versions`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
