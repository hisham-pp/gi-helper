import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NEXT_DIST_DIR=.next-prod lets a production build (and `next start` for the
  // E2E tests) run beside `pnpm dev`, which would otherwise overwrite .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  typedRoutes: true,
  env: {
    NEXT_PUBLIC_BUILD_ID: process.env.NEXT_BUILD_ID ?? `dev-${Date.now()}`,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "enka.network",
      },
      {
        protocol: "https",
        hostname: "static.wikia.nocookie.net",
      },
    ],
  },
  outputFileTracingExcludes: {
    "*": [
      ".git/**/*",
      ".next/cache/**/*",
      "public/images/artifacts/**/*",
      "public/images/boss/**/*",
      "public/images/character-avatars/**/*",
      "public/images/characters/**/*",
      "public/images/consumables/**/*",
      "public/images/enemies/**/*",
      "public/images/map/**/*",
      "public/images/material-thumbs/**/*",
      "public/images/materials/**/*",
      "public/images/weapons/**/*",
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // The database and inventory moved to sub-pages (/db/*, /inventory/*) in 0.0.20
  async redirects() {
    return [
      { source: "/db", destination: "/db/materials", permanent: false },
      { source: "/inventory", destination: "/inventory/materials", permanent: false },
      // Old URLs, still linked from outside
      { source: "/materials", destination: "/db/materials", permanent: true },
      { source: "/characters", destination: "/db/characters", permanent: true },
      { source: "/weapons", destination: "/db/weapons", permanent: true },
      { source: "/artifacts", destination: "/db/artifacts", permanent: true },
    ];
  },
  // Files in public/ default to "max-age=0, must-revalidate", so browsers
  // re-check every icon on every visit. These rarely or never change.
  async headers() {
    return [
      {
        // Fetched as ?v=<content hash> (lib/material-detector/browser.ts): never changes
        source: "/data/material-atlas.png",
        has: [{ type: "query", key: "v" }],
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // The manifest is how a new atlas is found, so it stays fairly fresh
        source: "/data/material-atlas.json",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" }],
      },
      {
        // Icons, avatars, background and samples keep their names when rebuilt:
        // a week, then refreshed in the background
        source: "/:dir(images|samples)/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/data/materials.json",
        destination: "/api/materials",
      },
    ];
  },
};

export default nextConfig;
