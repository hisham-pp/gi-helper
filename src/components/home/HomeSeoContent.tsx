import React from "react";
import { ShellLink } from "@/components/layout/ShellLink";
import {
  Globe,
  MonitorCheck,
  ShieldCheck,
  Download,
  Check,
  X,
  HelpCircle,
  Sparkles,
  BookOpen,
  Video,
  Layers,
  ArrowRight,
  ExternalLink,
  Cpu,
  Lock,
  PackageCheck,
  Swords,
  Sparkle,
  Users,
} from "lucide-react";

export interface SeoFaqItem {
  question: string;
  answerText: string;
}

export const SEO_FAQS: SeoFaqItem[] = [
  {
    question: "Is there a web-based inventory scanner for Genshin Impact?",
    answerText:
      "Yes. GI Helper is a free, web-based Genshin Impact inventory scanner that runs completely in your web browser. You can scan screenshots, video screen recordings, or share your screen directly in your browser on desktop and mobile without downloading or installing any desktop software.",
  },
  {
    question: "How does GI Helper compare to Genshin Kamera (Inventory Kamera)?",
    answerText:
      "Inventory Kamera is a desktop application that automates key presses and captures the game window in real-time on Windows PC. GI Helper is a modern web-based alternative that works across Windows, Mac, Linux, iOS, Android, and PlayStation screenshots. It supports direct in-browser screen sharing with zero installation, no administrative privileges, and never interacts with your game client or memory.",
  },
  {
    question: "Can I scan Genshin inventory on iPhone, iPad, Android, or PlayStation?",
    answerText:
      "Yes. Because GI Helper runs directly in any modern browser (Safari, Chrome, Firefox, Edge), mobile players on iOS and Android can take screenshots in-game, upload screen recordings, or share their screen directly to scan their inventory. Console players (PS4/PS5) can scan effortlessly by transferring their bag screenshots to their phone or computer via the PlayStation App.",
  },
  {
    question: "What Genshin Impact inventory items can be scanned?",
    answerText:
      "GI Helper scans Character Development Items, Materials (local specialties, food, ores, wood), Weapons (with level 1–90, refinement R1–R5, and ascension locks), Artifacts (with set, slot, rarity, main stat, and full roll-verified substats), and your party setup character roster.",
  },
  {
    question: "How do I export my scanned inventory to Genshin Optimizer?",
    answerText:
      "After scanning and confirming your items in the review modal, open the Inventory page and click 'Export to GOOD'. GI Helper creates a standard GOOD (Genshin Open Object Description) JSON file that can be imported directly into Genshin Optimizer, Seelie.me, or Akasha System.",
  },
  {
    question: "Is GI Helper safe to use? Can my Genshin account get banned?",
    answerText:
      "GI Helper is 100% safe. It operates entirely on static screenshots or video screen recordings that you provide. It does not inject code, hook into the game process, read memory, or automate keypresses, making it completely compliant with HoYoverse terms of service.",
  },
  {
    question: "How does video inventory scanning work?",
    answerText:
      "In the Video tab, drop a screen recording of yourself scrolling steadily through your bag, or use the Live Screen Studio to stream your game window directly. GI Helper extracts frames, detects scroll speed, eliminates duplicate rows, and stitches the entire grid automatically.",
  },
  {
    question: "Can I use AI Vision models like Gemini, Claude, or OpenAI for scanning?",
    answerText:
      "Yes. While the built-in WebAssembly OCR engine runs 100% locally for free with zero API keys, you can optionally connect your own API key for Google Gemini, OpenAI GPT-4o, Anthropic Claude, or xAI Grok in Settings for complex multi-lingual or unusual aspect ratio images.",
  },
];

export function HomeSeoContent() {
  return (
    <section
      aria-labelledby="scanner-guide-title"
      className="mx-auto mt-12 w-full max-w-4xl space-y-12 border-t border-cyan-400/20 pt-10 text-white/90"
    >
      {/* Section Header */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Next-Gen Genshin Web Scanner</span>
        </div>
        <h2
          id="scanner-guide-title"
          className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-3xl md:text-4xl"
        >
          Web-Based Genshin Impact Inventory Scanner &amp; Kamera Alternative
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-white/75 sm:text-base">
          GI Helper is the free, in-browser inventory scanner designed for Genshin Impact travelers.
          Scan screenshots and screen recordings of your materials, weapons, artifacts, and
          characters to export directly to{" "}
          <ShellLink href="/guides/screenshot-to-good-export" className="font-semibold text-cyan-300 hover:underline">
            Genshin Optimizer
          </ShellLink>{" "}
          in GOOD format with zero software installation.
        </p>
      </div>

      {/* Featured Search Landing Page Guides */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-300">
            <BookOpen className="h-4 w-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Featured Scanner Guides</h3>
          </div>
          <ShellLink
            href="/guides"
            className="flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:underline"
          >
            <span>View All Guides</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </ShellLink>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <ShellLink
            href="/guides/genshin-inventory-scanner"
            className="glass-card group p-5 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-md"
          >
            <div className="space-y-2">
              <span className="glass-chip h-9 w-9 justify-center rounded-xl text-cyan-300">
                <Globe className="h-4 w-4" />
              </span>
              <h4 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">
                Kamera Online Alternative
              </h4>
              <p className="text-xs text-white/70 leading-relaxed">
                Scan on Mac, iOS, Android, and PC with zero downloads or macro automation.
              </p>
              <div className="flex items-center gap-1 pt-1 text-[11px] font-semibold text-cyan-300">
                <span>Read Guide</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </ShellLink>

          <ShellLink
            href="/guides/screenshot-to-good-export"
            className="glass-card group p-5 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-md"
          >
            <div className="space-y-2">
              <span className="glass-chip h-9 w-9 justify-center rounded-xl text-cyan-300">
                <Download className="h-4 w-4" />
              </span>
              <h4 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">
                Screenshot to GOOD Export
              </h4>
              <p className="text-xs text-white/70 leading-relaxed">
                Convert your bag into standard GOOD JSON for Genshin Optimizer and Seelie.
              </p>
              <div className="flex items-center gap-1 pt-1 text-[11px] font-semibold text-cyan-300">
                <span>Read Guide</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </ShellLink>

          <ShellLink
            href="/guides/video-inventory-scanner"
            className="glass-card group p-5 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-md"
          >
            <div className="space-y-2">
              <span className="glass-chip h-9 w-9 justify-center rounded-xl text-cyan-300">
                <Video className="h-4 w-4" />
              </span>
              <h4 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">
                Video &amp; Screen Share Scanner
              </h4>
              <p className="text-xs text-white/70 leading-relaxed">
                Scan 200+ materials in 20 seconds with scrolling video frame stitching.
              </p>
              <div className="flex items-center gap-1 pt-1 text-[11px] font-semibold text-cyan-300">
                <span>Read Guide</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </ShellLink>
        </div>
      </div>

      {/* Guide 1: Supported Inventory Types with Direct Internal Links */}
      <div className="glass-card glass-card--lg p-6 sm:p-8 space-y-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-300">
            <PackageCheck className="h-5 w-5" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Inventory Coverage</h3>
          </div>
          <h3 className="text-lg font-bold text-white sm:text-xl">
            Supported Genshin Impact Inventory Categories
          </h3>
          <p className="text-xs leading-relaxed text-white/70 sm:text-sm">
            GI Helper parses and categorizes all bag tabs recognized by Genshin Impact. Click any
            category to explore our live catalogue or view your scanned items:
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-cyan-300">Character Development &amp; Materials</span>
              <ShellLink href="/db/materials" className="text-xs text-white/60 hover:text-cyan-200">
                Browse DB →
              </ShellLink>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Ascension gems, boss drops, talent books, local specialties, ores, billets, and wood.
              Counts up to 9,999.
            </p>
            <div className="flex gap-2 pt-1 text-[11px]">
              <ShellLink href="/inventory/materials" className="text-cyan-300 hover:underline">
                View Scanned Materials
              </ShellLink>
              <span className="text-white/30">•</span>
              <ShellLink href="/db/materials" className="text-cyan-300 hover:underline">
                Materials Database
              </ShellLink>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-cyan-300">Weapons (1★ to 5★)</span>
              <ShellLink href="/db/weapons" className="text-xs text-white/60 hover:text-cyan-200">
                Browse DB →
              </ShellLink>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Weapon name, level (1–90), ascension lock status, and refinement rank (R1 to R5)
              accurately parsed.
            </p>
            <div className="flex gap-2 pt-1 text-[11px]">
              <ShellLink href="/inventory/weapons" className="text-cyan-300 hover:underline">
                View Scanned Weapons
              </ShellLink>
              <span className="text-white/30">•</span>
              <ShellLink href="/db/weapons" className="text-cyan-300 hover:underline">
                Weapons Database
              </ShellLink>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-cyan-300">Artifacts &amp; Sub-stats</span>
              <ShellLink href="/db/artifacts" className="text-xs text-white/60 hover:text-cyan-200">
                Browse DB →
              </ShellLink>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Set name, piece slot (Flower, Feather, Sands, Goblet, Circlet), main stat, level, and
              all 4 roll-verified sub-stats.
            </p>
            <div className="flex gap-2 pt-1 text-[11px]">
              <ShellLink href="/inventory/artifacts" className="text-cyan-300 hover:underline">
                View Scanned Artifacts
              </ShellLink>
              <span className="text-white/30">•</span>
              <ShellLink href="/db/artifacts" className="text-cyan-300 hover:underline">
                Artifacts Database
              </ShellLink>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-cyan-300">Characters &amp; Roster</span>
              <ShellLink href="/db/characters" className="text-xs text-white/60 hover:text-cyan-200">
                Browse DB →
              </ShellLink>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Character level, ascension status, and constellation level extracted from the party
              setup or character selection screen.
            </p>
            <div className="flex gap-2 pt-1 text-[11px]">
              <ShellLink href="/inventory/characters" className="text-cyan-300 hover:underline">
                View Scanned Characters
              </ShellLink>
              <span className="text-white/30">•</span>
              <ShellLink href="/db/characters" className="text-cyan-300 hover:underline">
                Characters Database
              </ShellLink>
            </div>
          </div>
        </div>
      </div>

      {/* Guide 2: How Scanning Works & Privacy Architecture */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="glass-card p-6 space-y-3">
          <div className="flex items-center gap-2 text-cyan-300">
            <Cpu className="h-5 w-5" />
            <h3 className="text-base font-bold text-white">How Scanning Works</h3>
          </div>
          <p className="text-xs text-white/75 leading-relaxed sm:text-sm">
            GI Helper uses a high-performance computer vision pipeline running directly in your
            browser:
          </p>
          <ul className="space-y-2 text-xs text-white/70 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-cyan-300 font-bold">•</span>
              <span>
                <strong>Grid Detection &amp; Tile Cropping:</strong> High-speed canvas math locates
                item borders and extracts count regions.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-300 font-bold">•</span>
              <span>
                <strong>WebAssembly OCR:</strong> Client-side Tesseract.js Web Workers read numbers
                and text without network lag.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-300 font-bold">•</span>
              <span>
                <strong>Video Frame Stitching:</strong> Optical delta tracking calculates scrolling
                offsets, eliminating duplicate rows.
              </span>
            </li>
          </ul>
        </div>

        <div className="glass-card p-6 space-y-3">
          <div className="flex items-center gap-2 text-emerald-300">
            <ShieldCheck className="h-5 w-5" />
            <h3 className="text-base font-bold text-white">Privacy &amp; Account Safety</h3>
          </div>
          <p className="text-xs text-white/75 leading-relaxed sm:text-sm">
            Your account security and privacy are top priorities:
          </p>
          <ul className="space-y-2 text-xs text-white/70 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-emerald-300 font-bold">•</span>
              <span>
                <strong>100% Client-Side Processing:</strong> Default scans occur in your
                browser&apos;s memory; images are never stored on our servers.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-300 font-bold">•</span>
              <span>
                <strong>Zero Game Process Hooking:</strong> Unlike desktop macros or memory readers,
                GI Helper never attaches to Genshin&apos;s executable or simulates OS keys.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-300 font-bold">•</span>
              <span>
                <strong>TOS Compliant:</strong> Strictly operates on passive media, keeping your
                HoYoverse account completely safe from bans. Read more in our{" "}
                <ShellLink href="/about" className="text-cyan-300 hover:underline">
                  About &amp; Privacy policy
                </ShellLink>
                .
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Guide 3: The Export Workflow (GOOD Format) */}
      <div className="glass-card glass-card--lg p-6 sm:p-8 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-300">
            <Download className="h-5 w-5" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Export Workflow</h3>
          </div>
          <h3 className="text-lg font-bold text-white sm:text-xl">
            Direct Export to Genshin Optimizer &amp; Seelie in GOOD Format
          </h3>
          <p className="text-xs leading-relaxed text-white/70 sm:text-sm">
            GI Helper formats your inventory according to the standard{" "}
            <strong>Genshin Open Object Description (GOOD 3.0)</strong> specification. Read the full{" "}
            <ShellLink
              href="/guides/screenshot-to-good-export"
              className="font-semibold text-cyan-300 hover:underline"
            >
              GOOD export tutorial
            </ShellLink>{" "}
            or follow these quick steps:
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 pt-2">
          <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
            <span className="glass-chip h-7 w-7 justify-center font-mono text-xs font-bold text-cyan-300">
              1
            </span>
            <h4 className="text-sm font-bold text-white">Scan &amp; Review</h4>
            <p className="text-xs leading-relaxed text-white/70">
              Drop screenshots or videos into the scanner. Verify detected stats in the review modal
              with one click.
            </p>
          </div>
          <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
            <span className="glass-chip h-7 w-7 justify-center font-mono text-xs font-bold text-cyan-300">
              2
            </span>
            <h4 className="text-sm font-bold text-white">Export GOOD File</h4>
            <p className="text-xs leading-relaxed text-white/70">
              Open the{" "}
              <ShellLink href="/inventory/materials" className="text-cyan-300 hover:underline">
                Inventory tab
              </ShellLink>{" "}
              and click &quot;Export to GOOD&quot; to download your standardized JSON file.
            </p>
          </div>
          <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
            <span className="glass-chip h-7 w-7 justify-center font-mono text-xs font-bold text-cyan-300">
              3
            </span>
            <h4 className="text-sm font-bold text-white">Import &amp; Optimize</h4>
            <p className="text-xs leading-relaxed text-white/70">
              Upload the JSON file into Genshin Optimizer or Seelie.me to calculate optimal builds
              and farm schedules instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Section: GI Helper vs Desktop Scanners */}
      <div className="glass-card glass-card--lg overflow-hidden p-6 sm:p-8">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white sm:text-xl">
            GI Helper vs Traditional Desktop Scanners (Inventory Kamera)
          </h3>
          <p className="text-xs leading-relaxed text-white/70 sm:text-sm">
            Wondering whether to use a desktop OCR executable or GI Helper? Here is how they compare:
          </p>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/10 text-cyan-300">
                <th className="pb-3 font-semibold">Feature</th>
                <th className="pb-3 font-semibold">GI Helper (Web Scanner)</th>
                <th className="pb-3 font-semibold text-white/60">Desktop Scanners (Kamera)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              <tr>
                <td className="py-3 font-medium text-white">Platform Support</td>
                <td className="py-3 text-emerald-300">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>PC, Mac, iOS, Android, Linux, Consoles</span>
                  </div>
                </td>
                <td className="py-3 text-white/60">Windows PC only</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white">Installation</td>
                <td className="py-3 text-emerald-300">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>Zero install (Runs in browser)</span>
                  </div>
                </td>
                <td className="py-3 text-white/60">Requires executable download (.exe)</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white">Account Safety &amp; TOS</td>
                <td className="py-3 text-emerald-300">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>100% Safe (Only reads static images/video)</span>
                  </div>
                </td>
                <td className="py-3 text-white/60">Automates inputs / captures active window</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white">Mobile Screenshots</td>
                <td className="py-3 text-emerald-300">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>Supported (Upload right from your phone)</span>
                  </div>
                </td>
                <td className="py-3 text-rose-300/80">
                  <div className="flex items-center gap-1.5">
                    <X className="h-4 w-4 shrink-0" />
                    <span>Not supported</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white">Screen Recording Scan</td>
                <td className="py-3 text-emerald-300">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>Supported (Stitches scrolling frames)</span>
                  </div>
                </td>
                <td className="py-3 text-white/60">Live game automation only</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white">Live Screen Share</td>
                <td className="py-3 text-emerald-300">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>Supported (Desktop &amp; mobile browser screen sharing)</span>
                  </div>
                </td>
                <td className="py-3 text-white/60">Automates active window only</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white">Export Format</td>
                <td className="py-3 text-cyan-300">Standard GOOD Format (Genshin Optimizer)</td>
                <td className="py-3 text-white/60">Standard GOOD Format</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequently Asked Questions (FAQ) */}
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-300">
            <HelpCircle className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">FAQ</span>
          </div>
          <h3 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-2.5">
          {SEO_FAQS.map((faq, index) => (
            <details
              key={index}
              name="faq"
              className="glass-card group rounded-xl transition-all duration-200 open:border-cyan-400/40"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between p-4 text-sm font-semibold text-white/90 hover:text-cyan-200">
                <span className="pr-4">{faq.question}</span>
                <span className="glass-chip h-6 w-6 shrink-0 justify-center rounded-lg text-xs transition-transform duration-200 group-open:rotate-180">
                  ↓
                </span>
              </summary>
              <div className="border-t border-white/5 px-4 pb-4 pt-2 text-xs leading-relaxed text-white/75 sm:text-sm">
                {faq.answerText}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Site Directory Links Hub for Crawlers & Visitors */}
      <div className="glass-card p-6 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
          Quick Navigation &amp; Resources
        </h3>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/70">
          <ShellLink href="/inventory/materials" className="hover:text-cyan-300 hover:underline">
            Inventory Tracker
          </ShellLink>
          <ShellLink href="/db/materials" className="hover:text-cyan-300 hover:underline">
            Materials Database
          </ShellLink>
          <ShellLink href="/db/weapons" className="hover:text-cyan-300 hover:underline">
            Weapons Database
          </ShellLink>
          <ShellLink href="/db/artifacts" className="hover:text-cyan-300 hover:underline">
            Artifacts Database
          </ShellLink>
          <ShellLink href="/db/characters" className="hover:text-cyan-300 hover:underline">
            Characters Database
          </ShellLink>
          <ShellLink href="/guides" className="hover:text-cyan-300 hover:underline">
            Scanner Guides
          </ShellLink>
          <ShellLink href="/about" className="hover:text-cyan-300 hover:underline">
            About &amp; Architecture
          </ShellLink>
          <ShellLink href="/versions" className="hover:text-cyan-300 hover:underline">
            Release Notes
          </ShellLink>
          <ShellLink href="/feedback" className="hover:text-cyan-300 hover:underline">
            Feedback &amp; Bug Reports
          </ShellLink>
          <a
            href="https://github.com/hisham-pp/gi-helper"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-300 hover:underline inline-flex items-center gap-1"
          >
            <span>GitHub (Open Source)</span>
            <ExternalLink className="h-3 w-3 text-white/40" />
          </a>
        </div>
      </div>
    </section>
  );
}
