import type { Metadata } from "next";
import { Scanner } from "@/components/scanner/Scanner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScannerSettingsButton } from "@/components/scanner/ScannerSettingsButton";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { getLatestVersion } from "@/lib/versions";

export const metadata: Metadata = pageMetadata({
  title: `${SITE.title} | ${SITE.name}`,
  absoluteTitle: true,
  description: SITE.description,
  path: "/",
});

/** Structured data so search engines can describe the scanner as a free web app. */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: SITE.url,
      name: SITE.name,
      description: SITE.description,
      inLanguage: "en",
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE.url}/#app`,
      name: `${SITE.name} – ${SITE.title}`,
      url: SITE.url,
      description: SITE.description,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "On-device scanning of inventory screenshots, no API key needed",
        "Optional AI Vision scanning with Gemini, OpenAI, Claude or Grok",
        "Review and correct detected materials and quantities",
        "Export to GOOD format for Genshin optimizers",
      ],
      about: { "@type": "VideoGame", name: "Genshin Impact" },
      isPartOf: { "@id": `${SITE.url}/#website` },
    },
  ],
};

export default function ScannerPage() {
  const latestVersion = getLatestVersion();

  return (
    <div className="relative z-10 flex min-h-screen w-full flex-col bg-transparent px-4 py-4 sm:px-6 md:px-8">
      <script
        type="application/ld+json"
        // Escape "<" so the JSON can never close the script tag
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      {/* Top Header Bar */}
      <header className="flex w-full shrink-0 items-center justify-between pb-3 sm:pb-4">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl border border-white/10 bg-white/10 shadow-sm backdrop-blur-md">
            <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
          </span>
          <span className="text-xs sm:text-sm font-bold tracking-tight text-white drop-shadow-sm">
            GI Helper
          </span>
          {latestVersion && (
            <Link
              href="/versions"
              title="Release notes"
              className="glass-chip px-2 py-0.5 font-mono text-[10px] font-bold text-white/70"
            >
              v{latestVersion.version}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/materials"
            className="text-on-surface flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1 sm:px-3.5 sm:py-1.5 text-xs font-bold shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20 active:scale-95"
          >
            <span>Materials</span>
          </Link>
          <ScannerSettingsButton />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Scanner Container - Supports Natural Scrolling for Results */}
      <main className="flex flex-1 w-full flex-col items-center justify-start pb-12">
        <Scanner />
      </main>
    </div>
  );
}

