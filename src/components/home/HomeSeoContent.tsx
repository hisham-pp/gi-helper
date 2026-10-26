import React from "react";
import {
  Globe,
  MonitorCheck,
  ShieldCheck,
  Download,
  Check,
  X,
  HelpCircle,
  Sparkles,
} from "lucide-react";

export interface SeoFaqItem {
  question: string;
  answerText: string;
}

export const SEO_FAQS: SeoFaqItem[] = [
  {
    question: "Is there a web-based inventory scanner for Genshin Impact?",
    answerText:
      "Yes. GI Helper is a free, web-based Genshin Impact inventory scanner that runs completely in your web browser. You can scan screenshots and video screen recordings of your materials, weapons, artifacts, and characters without downloading or installing any desktop software.",
  },
  {
    question: "How does GI Helper compare to Genshin Kamera (Inventory Kamera)?",
    answerText:
      "Inventory Kamera is a popular desktop application that automates key presses and captures the game window in real-time, but it only works on Windows PC. GI Helper is a modern web-based alternative that works across Windows, Mac, Linux, iOS, Android, and PlayStation screenshots. It requires zero installation, no administrative privileges, and never interacts with your game client or memory.",
  },
  {
    question: "Can I scan Genshin inventory on iPhone, iPad, Android, or PlayStation?",
    answerText:
      "Yes. Because GI Helper runs directly in any modern browser (Safari, Chrome, Firefox, Edge), mobile players on iOS and Android can take screenshots in-game and upload them directly to gi-helper.vercel.app. Console players (PS4/PS5) can also transfer their bag screenshots to their phone or computer and scan them effortlessly.",
  },
  {
    question: "What Genshin Impact inventory items can be scanned?",
    answerText:
      "GI Helper scans Character Development Items, Materials (local specialties, food, ores, wood), Weapons (with level, refinement, and ascension locks), Artifacts (with set, slot, rarity, main stat, and full roll-verified substats), and your party setup character roster.",
  },
  {
    question: "How do I export my scanned inventory to Genshin Optimizer?",
    answerText:
      "After scanning and confirming your items in the review modal, open the Inventory page and click Export to GOOD. GI Helper creates a standard GOOD (Genshin Open Object Description) JSON file that can be imported directly into Genshin Optimizer, Seelie.me, or Akasha System.",
  },
  {
    question: "Is GI Helper safe to use? Can my Genshin account get banned?",
    answerText:
      "GI Helper is 100% safe. It operates entirely on static screenshots or video screen recordings that you provide. It does not inject code, hook into the game process, read memory, or automate keypresses, making it completely compliant with game terms of service.",
  },
];

export function HomeSeoContent() {
  return (
    <section
      aria-labelledby="scanner-guide-title"
      className="mx-auto mt-12 w-full max-w-4xl space-y-10 border-t border-cyan-400/20 pt-10 text-white/90"
    >
      {/* Section Header */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Next-Gen Genshin Web Scanner</span>
        </div>
        <h2
          id="scanner-guide-title"
          className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-3xl"
        >
          Web-Based Genshin Impact Inventory Scanner &amp; Kamera Alternative
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-white/75">
          GI Helper is the free, in-browser inventory scanner designed for Genshin Impact travelers.
          Scan screenshots and screen recordings of your materials, weapons, artifacts, and
          characters to export directly to Genshin Optimizer with zero software installation.
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="glass-card p-5 transition-all duration-300 hover:border-cyan-400/40">
          <div className="flex items-start gap-3.5">
            <span className="glass-chip h-10 w-10 shrink-0 justify-center rounded-xl text-cyan-300">
              <Globe className="h-5 w-5" />
            </span>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">100% Web-Based &amp; Zero Install</h3>
              <p className="text-xs leading-relaxed text-white/70">
                Runs instantly inside any web browser on PC, Mac, iPhone, iPad, Android, or Linux.
                No Python scripts, no downloads, and no administrator privileges required.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 transition-all duration-300 hover:border-cyan-400/40">
          <div className="flex items-start gap-3.5">
            <span className="glass-chip h-10 w-10 shrink-0 justify-center rounded-xl text-cyan-300">
              <MonitorCheck className="h-5 w-5" />
            </span>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Genshin Kamera Online Alternative</h3>
              <p className="text-xs leading-relaxed text-white/70">
                A lightweight alternative to desktop OCR tools like Inventory Kamera and Amenoma.
                Scan without window-hooking, desktop resolution locks, or risk of input interference.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 transition-all duration-300 hover:border-cyan-400/40">
          <div className="flex items-start gap-3.5">
            <span className="glass-chip h-10 w-10 shrink-0 justify-center rounded-xl text-cyan-300">
              <ShieldCheck className="h-5 w-5 text-emerald-300" />
            </span>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Private, Client-Side OCR</h3>
              <p className="text-xs leading-relaxed text-white/70">
                Your images stay yours. Standard and video scans run entirely on your device using
                Web Workers. Nothing is uploaded to external servers without your explicit consent.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 transition-all duration-300 hover:border-cyan-400/40">
          <div className="flex items-start gap-3.5">
            <span className="glass-chip h-10 w-10 shrink-0 justify-center rounded-xl text-cyan-300">
              <Download className="h-5 w-5" />
            </span>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">GOOD Format for Genshin Optimizer</h3>
              <p className="text-xs leading-relaxed text-white/70">
                One-click export in standard Genshin Open Object Description (GOOD 3) format. Import
                directly into Genshin Optimizer, Seelie.me, and community build calculators.
              </p>
            </div>
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
            Wondering whether to use a desktop OCR tool or GI Helper? Here is how they compare:
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
                <td className="py-3 font-medium text-white">Export Format</td>
                <td className="py-3 text-cyan-300">Standard GOOD Format (Genshin Optimizer)</td>
                <td className="py-3 text-white/60">Standard GOOD Format</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* How It Works Steps */}
      <div className="glass-card glass-card--lg p-6 sm:p-8">
        <h3 className="text-lg font-bold text-white sm:text-xl">
          How to Scan Your Genshin Inventory Online
        </h3>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
            <span className="glass-chip h-7 w-7 justify-center font-mono text-xs font-bold text-cyan-300">
              1
            </span>
            <h4 className="text-sm font-bold text-white">Capture Bag or Party</h4>
            <p className="text-xs leading-relaxed text-white/70">
              Take screenshots of your Materials, Weapons, Artifacts, or Character lists, or take a
              screen recording as you scroll.
            </p>
          </div>
          <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
            <span className="glass-chip h-7 w-7 justify-center font-mono text-xs font-bold text-cyan-300">
              2
            </span>
            <h4 className="text-sm font-bold text-white">Drop into Scanner</h4>
            <p className="text-xs leading-relaxed text-white/70">
              Drop screenshots into the Scanner tab or videos into the Video tab. The in-browser OCR
              recognises items and counts instantly.
            </p>
          </div>
          <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
            <span className="glass-chip h-7 w-7 justify-center font-mono text-xs font-bold text-cyan-300">
              3
            </span>
            <h4 className="text-sm font-bold text-white">Review &amp; Export GOOD</h4>
            <p className="text-xs leading-relaxed text-white/70">
              Verify detected items in the review modal, then export a GOOD JSON file ready for
              Genshin Optimizer.
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions (FAQ) with Native Details/Summary */}
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
    </section>
  );
}
