import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
      "public/images/characters/**/*",
      "public/images/consumables/**/*",
      "public/images/enemies/**/*",
      "public/images/map/**/*",
      "public/images/materials/**/*",
      "public/images/weapons/**/*",
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
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
