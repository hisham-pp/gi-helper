import type { Metadata } from "next";
import { ShellLink } from "@/components/layout/ShellLink";
import {
  Download,
  FileCode,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Scan,
  Layers,
} from "lucide-react";
import { pageMetadata, SITE } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Screenshot to GOOD Format Export Guide – Genshin Optimizer Import",
  description:
    "Learn how to export Genshin Impact screenshots and inventory scans into standard GOOD JSON format. Import artifacts, weapons, materials, and characters into Genshin Optimizer.",
  path: "/guides/screenshot-to-good-export",
});

const STEPS = [
  {
    title: "1. Capture In-Game Bag or Roster",
    description:
      "Open your Genshin Impact inventory (Artifacts, Weapons, Character Development Items, or Materials) or the Party Setup character roster. Take high-resolution screenshots at 1080p, 1440p, or 4K. On mobile or console, you can also take scrolling screen recordings.",
  },
  {
    title: "2. Scan with GI Helper",
    description:
      "Open GI Helper in your browser and drop your screenshots into the Scanner tab. The local Web Workers analyze artifact sub-stats, weapon refinements, and material quantities instantly on your device.",
  },
  {
    title: "3. Review & Validate Detected Items",
    description:
      "A review modal highlights any ambiguous rolls or rare items. You can make quick one-click adjustments to ensure your artifact rolls and character constellations are 100% accurate.",
  },
  {
    title: "4. One-Click GOOD Format Export",
    description:
      "Head over to the Inventory tab and click 'Export to GOOD'. GI Helper immediately downloads a standard .json file compliant with the GOOD format specification version 3.0.",
  },
  {
    title: "5. Import into Genshin Optimizer or Seelie",
    description:
      "Open Genshin Optimizer (frzyc.github.io/genshin-optimizer), navigate to Settings → Database → Import / Upload File, and select your exported GOOD JSON. Your builds and damage numbers are computed automatically!",
  },
];

const COMPATIBLE_TOOLS = [
  {
    name: "Genshin Optimizer",
    url: "https://frzyc.github.io/genshin-optimizer/",
    desc: "The premier damage calculator and artifact build optimizer. Import your weapons, artifacts, and characters to find optimal team builds.",
  },
  {
    name: "Seelie.me",
    url: "https://seelie.me/",
    desc: "Daily task and farming progression tracker. Sync your materials, boss drops, and talent books to plan character ascensions.",
  },
  {
    name: "Akasha System",
    url: "https://akasha.cv/",
    desc: "Global artifact roll scoring and character build leaderboards based on Genshin Optimizer data formats.",
  },
];

export default function ScreenshotToGoodExportGuide() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HowTo",
        name: "How to Export Genshin Impact Screenshots to GOOD Format for Genshin Optimizer",
        description:
          "Step-by-step instructions for converting Genshin Impact screenshots and recordings into GOOD JSON format using GI Helper.",
        totalTime: "PT3M",
        step: STEPS.map((s, idx) => ({
          "@type": "HowToStep",
          position: idx + 1,
          name: s.title,
          text: s.description,
          url: `${SITE.url}/guides/screenshot-to-good-export#step-${idx + 1}`,
        })),
      },
      {
        "@type": "Article",
        headline: "Genshin Screenshot to GOOD Export Guide",
        description:
          "Convert screenshots to Genshin Open Object Description (GOOD) format ready for Genshin Optimizer and Seelie.me.",
        url: `${SITE.url}/guides/screenshot-to-good-export`,
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
          <span className="text-white/80">Screenshot to GOOD Export</span>
        </nav>

        {/* Header Hero */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300">
            <Download className="h-3.5 w-3.5" />
            <span>Format &amp; Integration Guide</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-3xl md:text-4xl">
            Screenshot to GOOD Export: Import Your Genshin Bag into Genshin Optimizer
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-white/80 sm:text-base">
            Typing in dozens of artifact sub-stats and weapon levels manually into build calculators
            takes hours. With GI Helper, you can convert in-game screenshots and screen recordings
            into standard <strong>GOOD (Genshin Open Object Description)</strong> format in seconds.
          </p>
        </header>

        {/* What is GOOD format */}
        <section className="glass-card glass-card--lg p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2.5 text-cyan-300">
            <FileCode className="h-5 w-5" />
            <h2 className="text-lg font-bold text-white sm:text-xl">
              What is the GOOD Format (Genshin Open Object Description)?
            </h2>
          </div>
          <p className="text-xs text-white/75 sm:text-sm leading-relaxed">
            The <strong>GOOD format</strong> is an open-source, standardized JSON data specification
            created by the Genshin Impact developer community. It allows different fan-made apps—including
            scanners, damage optimizers, and farm planners—to exchange inventory information seamlessly
            without custom conversion scripts.
          </p>
          <div className="rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-xs text-cyan-200/90 overflow-x-auto">
            <pre>{`{
  "format": "GOOD",
  "version": 3,
  "source": "GI Helper Web Scanner",
  "artifacts": [
    {
      "setKey": "GladiatorsFinale",
      "slotKey": "plume",
      "level": 20,
      "rarity": 5,
      "mainStatKey": "atk",
      "substats": [
        { "key": "critRate_", "value": 10.5 },
        { "key": "critDMG_", "value": 21.0 },
        { "key": "atk_", "value": 5.8 },
        { "key": "enerRech_", "value": 11.0 }
      ]
    }
  ],
  "weapons": [ ... ],
  "characters": [ ... ],
  "materials": { ... }
}`}</pre>
          </div>
        </section>

        {/* 5-Step Walkthrough */}
        <section aria-labelledby="steps-heading" className="space-y-4">
          <h2 id="steps-heading" className="text-xl font-bold text-white">
            Step-by-Step Export Walkthrough
          </h2>
          <div className="space-y-3">
            {STEPS.map((s, idx) => (
              <div
                key={s.title}
                id={`step-${idx + 1}`}
                className="glass-card p-5 flex items-start gap-4"
              >
                <span className="glass-chip h-9 w-9 shrink-0 justify-center rounded-xl text-cyan-300 font-mono text-sm font-bold">
                  {idx + 1}
                </span>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white sm:text-base">{s.title}</h3>
                  <p className="text-xs text-white/70 leading-relaxed sm:text-sm">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Compatible Community Tools */}
        <section aria-labelledby="tools-heading" className="glass-card glass-card--lg p-6 sm:p-8 space-y-4">
          <h2 id="tools-heading" className="text-lg font-bold text-white sm:text-xl">
            Where Can You Use Your GOOD Export File?
          </h2>
          <p className="text-xs text-white/70 sm:text-sm">
            Files exported from GI Helper are fully compliant with every community tool accepting
            GOOD v2 or v3:
          </p>

          <div className="grid gap-3 sm:grid-cols-3 pt-2">
            {COMPATIBLE_TOOLS.map((tool) => (
              <a
                key={tool.name}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 group hover:border-cyan-400/40 transition-colors block"
              >
                <div className="flex items-center justify-between text-cyan-300">
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-200">
                    {tool.name}
                  </h3>
                  <ExternalLink className="h-3.5 w-3.5 text-white/40 group-hover:text-cyan-300" />
                </div>
                <p className="text-xs text-white/70 leading-relaxed">{tool.desc}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Tips for 100% Accuracy */}
        <section className="glass-card p-6 space-y-3">
          <div className="flex items-center gap-2 text-emerald-300">
            <CheckCircle2 className="h-5 w-5" />
            <h3 className="text-base font-bold text-white">Pro Tips for Accurate Artifact Scanning</h3>
          </div>
          <ul className="space-y-2 text-xs text-white/75 sm:text-sm leading-relaxed">
            <li className="flex gap-2">
              <span className="text-cyan-300">•</span>
              <span>
                <strong>Keep UI scale standard:</strong> In-game UI scale set to Default or 100%
                ensures optimal optical character recognition without artifact font distortion.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-300">•</span>
              <span>
                <strong>Clean backgrounds:</strong> For artifact stat cards, ensure the right-hand
                detail pane is unobstructed by chat bubbles or third-party Discord overlays.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-300">•</span>
              <span>
                <strong>Use Video Scrolling for large collections:</strong> Instead of taking 50
                individual screenshots, record a 20-second video scrolling smoothly through your bag!
              </span>
            </li>
          </ul>
        </section>

        {/* CTA Bar */}
        <div className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-white">Start your GOOD export now</h3>
            <p className="text-xs text-white/70">
              Drag screenshots into GI Helper and download your GOOD JSON immediately.
            </p>
          </div>
          <div className="flex gap-3">
            <ShellLink href="/" className="glass-btn glass-btn--primary px-5 py-2 text-xs font-bold">
              <Scan className="h-4 w-4" />
              Launch Scanner
            </ShellLink>
            <ShellLink href="/inventory/artifacts" className="glass-btn px-4 py-2 text-xs font-medium">
              View Inventory
            </ShellLink>
          </div>
        </div>
      </article>
    </div>
  );
}
