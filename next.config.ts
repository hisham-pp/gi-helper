import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
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
      "public/images/characters/**/*",
      "public/images/consumables/**/*",
      "public/images/enemies/**/*",
      "public/images/map/**/*",
      "public/images/materials/**/*",
      "public/images/weapons/**/*",
    ],
  },
};

export default nextConfig;
