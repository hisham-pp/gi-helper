import type { Metadata } from "next";
import { ShellLink } from "@/components/layout/ShellLink";
import {
  Scan,
  Download,
  Video,
  ArrowRight,
  Sparkles,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Laptop,
  Smartphone,
  Gamepad2,
} from "lucide-react";
import { pageMetadata, SITE } from "@/lib/seo";
import type { Route } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Genshin Scanner Guides & Tutorials – Video, OCR & GOOD Export",
  description:
    "Master inventory scanning in Genshin Impact. Learn how to scan materials, weapons, artifacts and characters from screenshots or video, and export to Genshin Optimizer.",
  path: "/guides",
});

interface GuideCard {
  slug: Route;
  title: string;
  tagline: string;
  description: string;
  icon: typeof Scan;
  badge: string;
  keywords: string[];
}

const GUIDES: GuideCard[] = [
  {
    slug: "/guides/genshin-inventory-scanner",
    title: "Web-Based Genshin Inventory Scanner & Kamera Alternative",
    tagline: "Scan your complete bag in any browser with zero installation",
    description:
      "A complete walkthrough comparing web OCR with desktop tools like Inventory Kamera. Learn how to scan on Windows, Mac, Linux, iOS, Android, and PlayStation consoles.",
    icon: Scan,
    badge: "Scanner Guide",
    keywords: ["Kamera Alternative", "Web Scanner", "Mobile & Mac"],
  },
  {
    slug: "/guides/screenshot-to-good-export",
    title: "Screenshot to GOOD Format Export for Genshin Optimizer",
    tagline: "Import your artifacts, weapons, and characters into optimizers",
    description:
      "How to convert your in-game screenshots and bag scans into standard GOOD (Genshin Open Object Description) format ready for Genshin Optimizer, Seelie.me, and Akasha.",
    icon: Download,
    badge: "Export & Optimization",
    keywords: ["GOOD Format", "Genshin Optimizer", "Artifact Scoring"],
  },
  {
    slug: "/guides/video-inventory-scanner",
    title: "Scanning Genshin Inventory from Video & Screen Sharing",
    tagline: "Rapid bulk inventory capture in seconds without manual screenshots",
    description:
      "Save time by recording your screen while scrolling through your materials or sharing your window in real time. Learn frame stitching and deduplication tricks.",
    icon: Video,
    badge: "Video & Live Stream",
    keywords: ["Screen Recording", "Live Screen Share", "Auto Stitching"],
  },
];

export default function GuidesIndexPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "GI Helper Guides & Tutorials",
    description:
      "Guides on Genshin Impact inventory scanning, screenshot-to-GOOD export, and video scanning.",
    url: `${SITE.url}/guides`,
    hasPart: GUIDES.map((g) => ({
      "@type": "Article",
      headline: g.title,
      description: g.description,
      url: `${SITE.url}${g.slug}`,
    })),
  };

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-start px-4 pb-12 pt-4 sm:px-6 md:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <main className="w-full max-w-4xl space-y-8">
        {/* Header Hero */}
        <div className="glass-card glass-card--lg space-y-4 p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Guides &amp; Tutorials</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-3xl md:text-4xl">
            Genshin Impact Inventory Scanning Guides
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
            Learn how to digitize your Genshin Impact inventory in minutes. Whether you are on PC,
            Mac, mobile, or PlayStation, discover how to extract materials, weapons, and artifacts
            directly into Genshin Optimizer using web OCR.
          </p>
        </div>

        {/* Guides Grid */}
        <section aria-label="Available Guides" className="space-y-4">
          <h2 className="px-1 text-xs font-bold uppercase tracking-wider text-white/60">
            Featured Guides
          </h2>
          <div className="grid gap-5">
            {GUIDES.map((guide) => {
              const Icon = guide.icon;
              return (
                <ShellLink
                  key={guide.slug}
                  href={guide.slug}
                  className="glass-card group relative block overflow-hidden p-6 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <span className="glass-chip h-12 w-12 shrink-0 justify-center rounded-2xl text-cyan-300 group-hover:scale-105 transition-transform">
                        <Icon className="h-6 w-6" />
                      </span>
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-cyan-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300 border border-cyan-400/20">
                            {guide.badge}
                          </span>
                          <span className="text-xs text-white/40">• 5 min read</span>
                        </div>
                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-200 transition-colors">
                          {guide.title}
                        </h3>
                        <p className="text-xs font-medium text-cyan-300/90 sm:text-sm">
                          {guide.tagline}
                        </p>
                        <p className="max-w-2xl text-xs leading-relaxed text-white/70 sm:text-sm">
                          {guide.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {guide.keywords.map((kw) => (
                            <span
                              key={kw}
                              className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-white/60"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 self-end text-xs font-semibold text-cyan-300 sm:self-center">
                      <span>Read Guide</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </ShellLink>
              );
            })}
          </div>
        </section>

        {/* Quick Reference Platform Compatibility */}
        <section className="glass-card glass-card--lg p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-white sm:text-xl">
            Scan On Any Device Without Downloads
          </h2>
          <p className="text-xs leading-relaxed text-white/70 sm:text-sm">
            Traditional desktop scanners like Inventory Kamera only run as Windows executables. GI
            Helper runs in any modern browser using WebAssembly, enabling scanning on every gaming
            platform:
          </p>

          <div className="grid gap-3 sm:grid-cols-3 pt-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-cyan-300">
                <Laptop className="h-4 w-4" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  PC, Mac &amp; Linux
                </h3>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Use direct browser screen sharing or drop screenshots/screen recordings into the
                scanner. No administrator rights or Python required.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-300">
                <Smartphone className="h-4 w-4" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  iPhone, iPad &amp; Android
                </h3>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Take screenshots in-game, record your screen while scrolling, or share your mobile
                screen directly via Chrome or Safari.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-300">
                <Gamepad2 className="h-4 w-4" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  PlayStation (PS4 / PS5)
                </h3>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Capture screenshots with the DualSense Create button, auto-sync them to the PS App
                on your phone, and upload directly to GI Helper.
              </p>
            </div>
          </div>
        </section>

        {/* Quick CTA */}
        <div className="glass-card p-6 text-center space-y-3">
          <h3 className="text-base font-bold text-white">Ready to scan your inventory?</h3>
          <p className="text-xs text-white/70">
            Open the scanner, drop in your images or recordings, and get your GOOD export in seconds.
          </p>
          <div className="flex justify-center gap-3 pt-1">
            <ShellLink href="/" className="glass-btn glass-btn--primary px-5 py-2 text-xs font-bold">
              <Scan className="h-4 w-4" />
              Launch Scanner
            </ShellLink>
            <ShellLink href="/inventory/materials" className="glass-btn px-4 py-2 text-xs font-medium">
              View Inventory
            </ShellLink>
          </div>
        </div>
      </main>
    </div>
  );
}
