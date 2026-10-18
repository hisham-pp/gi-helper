import type { Metadata } from "next";
import { Scanner } from "@/components/scanner/Scanner";
import { pageMetadata, SITE } from "@/lib/seo";

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
        "On-device scanning of inventory screen recordings",
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
  return (
    <div className="flex w-full flex-1 flex-col px-4 sm:px-6 md:px-8">
      <script
        type="application/ld+json"
        // Escape "<" so the JSON can never close the script tag
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      {/* Main Scanner Container. Results live on /inventory, so only a small
          gap above the footer (the old bottom padding made the page scroll) */}
      <main className="flex flex-1 w-full flex-col items-center justify-start pb-4">
        <Scanner />
      </main>
    </div>
  );
}

