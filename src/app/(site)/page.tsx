import type { Metadata } from "next";
import { Scanner } from "@/components/scanner/Scanner";
import { HomeSeoContent, SEO_FAQS } from "@/components/home/HomeSeoContent";
import { pageMetadata, SITE } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Genshin Inventory Scanner – Web-Based & Kamera Alternative | GI Helper",
  absoluteTitle: true,
  description: SITE.description,
  path: "/",
});

/** Structured data so search engines understand the web app, keywords, and FAQs. */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: SITE.url,
      name: "GI Helper – Genshin Inventory Scanner",
      alternateName: [
        "Genshin Inventory Scanner",
        "Genshin Web Based Inventory Scanner",
        "GI Helper",
        "Genshin Kamera Web Alternative",
      ],
      description: SITE.description,
      inLanguage: "en",
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE.url}/#app`,
      name: "Genshin Inventory Scanner (GI Helper)",
      alternateName: [
        "Genshin Web Based Inventory Scanner",
        "Genshin Kamera Web Alternative",
        "GI Helper",
      ],
      url: SITE.url,
      description: SITE.description,
      applicationCategory: "UtilitiesApplication, GameApplication",
      operatingSystem: "Any Web Browser (Chrome, Safari, Firefox, Edge, iOS, Android, PC, Mac, Linux)",
      browserRequirements: "Requires JavaScript and modern browser with WebAssembly / Web Workers",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "100% Web-based Genshin Impact inventory scanner requiring no software downloads",
        "Lightweight online alternative to desktop scanners like Inventory Kamera and Amenoma",
        "Client-side private scanning using Web Workers; screenshots and recordings never leave your device",
        "Scans Character Development Items, Materials, Weapons, Artifacts, and Character rosters",
        "Video screen recording scanner with automatic scroll detection and frame stitching",
        "Direct export to GOOD (Genshin Open Object Description) format for Genshin Optimizer",
        "Optional AI Vision scanning with Gemini, OpenAI, Claude, or Grok",
      ],
      about: { "@type": "VideoGame", name: "Genshin Impact" },
      isPartOf: { "@id": `${SITE.url}/#website` },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE.url}/#faq`,
      mainEntity: SEO_FAQS.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answerText,
        },
      })),
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
      {/* Main Scanner Container. */}
      <main className="flex w-full flex-1 flex-col items-center justify-start pb-6">
        <Scanner />
        <HomeSeoContent />
      </main>
    </div>
  );
}
