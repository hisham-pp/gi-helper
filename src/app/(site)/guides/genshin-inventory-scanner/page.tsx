import type { Metadata } from "next";
import { ShellLink } from "@/components/layout/ShellLink";
import {
  Scan,
  Check,
  X,
  ShieldCheck,
  Zap,
  Globe,
  Layers,
  HelpCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { pageMetadata, SITE } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Genshin Inventory Scanner – Web-Based Online Kamera Alternative",
  description:
    "Discover the free web-based Genshin Impact inventory scanner. Scan materials, weapons, artifacts and characters in your browser without downloads or macros. Full Kamera alternative.",
  path: "/guides/genshin-inventory-scanner",
});

const FAQS = [
  {
    q: "Why use a web-based scanner instead of Inventory Kamera?",
    a: "Inventory Kamera is a desktop executable that automates mouse clicks and keystrokes while capturing your game window. While effective, it only works on Windows PC, requires software installation, and can interfere with active gameplay. GI Helper runs in any web browser on PC, Mac, Linux, iOS, Android, and consoles, requiring zero downloads and never sending simulated inputs to your operating system.",
  },
  {
    q: "Can my HoYoverse account get banned for using GI Helper?",
    a: "No. GI Helper is 100% compliant with HoYoverse Terms of Service. Unlike prohibited cheat software or intrusive macros, GI Helper does not inject code into the Genshin game process, read game memory, or automate input devices. It performs OCR solely on screenshots, screen recordings, or screen share streams that you provide.",
  },
  {
    q: "What types of inventory items can GI Helper detect?",
    a: "GI Helper recognizes Character Development Items, Materials (local specialties, foods, ores, wood, billets), Weapons (with rarity, levels 1–90, refinement R1–R5, and lock status), Artifacts (set, slot, level, main stat, and roll-verified 4 sub-stats), and Character rosters.",
  },
  {
    q: "Does GI Helper upload my screenshots to external servers?",
    a: "By default, no. The standard image and video scanners execute client-side inside your browser using Web Workers and WebAssembly (Tesseract OCR). Your game screenshots stay private on your local machine. If you opt into AI Vision scanning, images are securely sent only to your chosen AI provider (Gemini, OpenAI, Claude, or Grok) using your own personal API key.",
  },
];

export default function GenshinInventoryScannerGuide() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Web-Based Genshin Inventory Scanner & Kamera Alternative Guide",
        description:
          "Complete guide to scanning your Genshin Impact inventory in the browser. Learn how to scan materials, weapons, artifacts, and characters across PC, Mac, and mobile.",
        url: `${SITE.url}/guides/genshin-inventory-scanner`,
        author: {
          "@type": "Organization",
          name: "GI Helper",
          url: SITE.url,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
          },
        })),
      },
    ],
  };

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-start px-4 pb-12 pt-4 sm:px-6 md:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <article className="w-full max-w-4xl space-y-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-white/50">
          <ShellLink href="/" className="hover:text-cyan-300">
            Home
          </ShellLink>
          <span>/</span>
          <ShellLink href="/guides" className="hover:text-cyan-300">
            Guides
          </ShellLink>
          <span>/</span>
          <span className="text-white/80">Inventory Scanner</span>
        </nav>

        {/* Hero Header */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Core Tool Guide</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-3xl md:text-4xl">
            Genshin Impact Inventory Scanner: The Web-Based Kamera Alternative
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-white/80 sm:text-base">
            Managing thousands of artifacts, weapons, and ascension materials in Genshin Impact can
            be overwhelming. While desktop scanners like Inventory Kamera have been the community
            go-to for years, GI Helper provides a modern, 100% web-based alternative that runs in
            any browser with zero installation.
          </p>
        </header>

        {/* Comparison Table */}
        <section aria-labelledby="comparison" className="glass-card glass-card--lg p-6 sm:p-8 space-y-4">
          <div className="space-y-1">
            <h2 id="comparison" className="text-lg font-bold text-white sm:text-xl">
              GI Helper vs Desktop Scanners (Inventory Kamera &amp; Amenoma)
            </h2>
            <p className="text-xs text-white/70 leading-relaxed sm:text-sm">
              See why hundreds of travelers use an in-browser scanner rather than downloading desktop
              binaries:
            </p>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full min-w-[540px] text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/10 text-cyan-300">
                  <th className="pb-3 font-semibold">Capability</th>
                  <th className="pb-3 font-semibold">GI Helper (Web Scanner)</th>
                  <th className="pb-3 font-semibold text-white/60">Inventory Kamera (.exe)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                <tr>
                  <td className="py-3 font-medium text-white">Platform Compatibility</td>
                  <td className="py-3 text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <Check className="h-4 w-4 shrink-0" />
                      Windows, Mac, iOS, Android, Linux, PS5
                    </span>
                  </td>
                  <td className="py-3 text-white/60">Windows PC only</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-white">Installation Required</td>
                  <td className="py-3 text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <Check className="h-4 w-4 shrink-0" />
                      Zero install (Runs in web browser)
                    </span>
                  </td>
                  <td className="py-3 text-white/60">Requires .exe download &amp; extract</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-white">Input Simulation / Macros</td>
                  <td className="py-3 text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <Check className="h-4 w-4 shrink-0" />
                      None (Pure visual OCR)
                    </span>
                  </td>
                  <td className="py-3 text-amber-300/80">Automates keyboard &amp; mouse clicks</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-white">Screen Recording &amp; Video</td>
                  <td className="py-3 text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <Check className="h-4 w-4 shrink-0" />
                      Supported (Stitches scroll frames)
                    </span>
                  </td>
                  <td className="py-3 text-rose-300/80">
                    <span className="flex items-center gap-1.5">
                      <X className="h-4 w-4 shrink-0" />
                      Not supported
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-white">Export Format</td>
                  <td className="py-3 text-cyan-300">GOOD Format 3.0 (Genshin Optimizer)</td>
                  <td className="py-3 text-white/60">GOOD Format</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* How It Works Section */}
        <section aria-labelledby="how-it-works" className="space-y-4">
          <h2 id="how-it-works" className="text-xl font-bold text-white">
            How In-Browser Scanning Works
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="glass-card p-5 space-y-2">
              <span className="glass-chip h-8 w-8 justify-center rounded-xl text-cyan-300 font-mono text-sm font-bold">
                1
              </span>
              <h3 className="text-sm font-bold text-white">Image Preprocessing</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                When you drop a screenshot or share your screen, GI Helper detects the inventory grid
                layout, crops item tiles, and filters noise using HTML5 canvas.
              </p>
            </div>

            <div className="glass-card p-5 space-y-2">
              <span className="glass-chip h-8 w-8 justify-center rounded-xl text-cyan-300 font-mono text-sm font-bold">
                2
              </span>
              <h3 className="text-sm font-bold text-white">WebAssembly OCR</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Tesseract.js and Web Workers run on your device to parse counts, weapon refinements,
                and artifact sub-stats locally without sending your data to any server.
              </p>
            </div>

            <div className="glass-card p-5 space-y-2">
              <span className="glass-chip h-8 w-8 justify-center rounded-xl text-cyan-300 font-mono text-sm font-bold">
                3
              </span>
              <h3 className="text-sm font-bold text-white">Validation &amp; Verification</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                The scanner checks numbers against official game data—verifying artifact roll math,
                weapon stats, and material icons to ensure 100% data fidelity.
              </p>
            </div>
          </div>
        </section>

        {/* Supported Items Section */}
        <section aria-labelledby="supported-items" className="glass-card glass-card--lg p-6 sm:p-8 space-y-4">
          <h2 id="supported-items" className="text-lg font-bold text-white sm:text-xl">
            Supported Genshin Inventory Categories
          </h2>
          <p className="text-xs text-white/70 sm:text-sm">
            GI Helper supports every major bag tab in Genshin Impact:
          </p>

          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1.5">
              <h3 className="text-sm font-bold text-cyan-300">
                <ShellLink href="/db/materials" className="hover:underline">
                  Character Development Items &amp; Materials →
                </ShellLink>
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Local specialties, talent level-up books, weekly boss materials, enhancement ores,
                billets, and wood. Scans item quantity up to 9,999.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1.5">
              <h3 className="text-sm font-bold text-cyan-300">
                <ShellLink href="/db/weapons" className="hover:underline">
                  Weapons (1★ to 5★) →
                </ShellLink>
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Extracts weapon name, level (1–90), ascension rank, refinement level (R1–R5), and
                equipped character locks.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1.5">
              <h3 className="text-sm font-bold text-cyan-300">
                <ShellLink href="/db/artifacts" className="hover:underline">
                  Artifacts &amp; Sub-stats →
                </ShellLink>
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Set recognition, slot (Flower, Feather, Sands, Goblet, Circlet), main stat, level,
                and all 4 roll-validated sub-stats for build optimization.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1.5">
              <h3 className="text-sm font-bold text-cyan-300">
                <ShellLink href="/db/characters" className="hover:underline">
                  Party Roster &amp; Characters →
                </ShellLink>
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Scans character levels, ascension phases, and constellation levels directly from party
                setup or character selection screens.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section aria-labelledby="faqs" className="space-y-4">
          <h2 id="faqs" className="text-xl font-bold text-white">
            Frequently Asked Questions
          </h2>
          <div className="space-y-2.5">
            {FAQS.map((faq, i) => (
              <details
                key={i}
                className="glass-card group rounded-xl p-4 transition-all duration-200 open:border-cyan-400/40"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-white/90 hover:text-cyan-200">
                  <span className="text-sm pr-4">{faq.q}</span>
                  <span className="glass-chip h-6 w-6 shrink-0 justify-center rounded-lg text-xs transition-transform duration-200 group-open:rotate-180">
                    ↓
                  </span>
                </summary>
                <p className="mt-3 text-xs leading-relaxed text-white/75 sm:text-sm border-t border-white/5 pt-3">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Call to Action Bar */}
        <div className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-white">Ready to scan your inventory?</h3>
            <p className="text-xs text-white/70">
              Start with the live web scanner or explore the video tutorial.
            </p>
          </div>
          <div className="flex gap-3">
            <ShellLink href="/" className="glass-btn glass-btn--primary px-5 py-2 text-xs font-bold">
              <Scan className="h-4 w-4" />
              Open Web Scanner
            </ShellLink>
            <ShellLink
              href="/guides/screenshot-to-good-export"
              className="glass-btn px-4 py-2 text-xs font-medium"
            >
              Export Guide →
            </ShellLink>
          </div>
        </div>
      </article>
    </div>
  );
}
