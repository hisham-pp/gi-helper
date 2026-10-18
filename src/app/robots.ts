import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/debug", "/feedback/inbox"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
