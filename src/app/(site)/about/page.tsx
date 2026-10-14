import type { Metadata } from "next";
import Link from "next/link";
import {
  Download,
  Heart,
  PackageCheck,
  Scan,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { BrandIcon } from "@/components/layout/BrandIcon";
import materials from "@/data/materials.json";
import { pageMetadata } from "@/lib/seo";
import { getLatestVersion } from "@/lib/versions";

export const metadata: Metadata = pageMetadata({
  title: "About GI Helper",
  description:
    "GI Helper is a free, fan-made Genshin Impact inventory scanner: recognise materials from screenshots or screen recordings on your device or with AI Vision, review them, and export to GOOD format.",
  path: "/about",
});

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Scan,
    title: "Scan on your device",
    text: "Recognises every material, its rarity and quantity from screenshots or a screen recording, right in your browser. No API key, nothing uploaded.",
  },
  {
    icon: Sparkles,
    title: "AI Vision, if you prefer",
    text: "Use Gemini, OpenAI, Claude, Grok or any OpenAI-compatible model with your own API key.",
  },
  {
    icon: Download,
    title: "Review and export",
    text: "Fix anything the scanner wasn't sure about, then export to GOOD format for Genshin optimizers.",
  },
  {
    icon: PackageCheck,
    title: "Materials directory",
    text: `Browse all ${materials.length} materials in in-game inventory order, with search and filters.`,
  },
];

const STEPS = [
  "Open your inventory on the Character Development Items tab and take screenshots, or record your screen while you scroll through it.",
  "Drop them into the scanner (recordings go in the Video tab), or try a sample first.",
  "Review the results. Slots the scanner wasn't sure about are listed first.",
  "Export to GOOD and import the file into your optimizer.",
];

const PRIVACY = [
  "The on-device scanners read your screenshots and recordings in the browser; they never leave your device.",
  "AI Vision sends the screenshot and your API key through GI Helper's server to the provider you pick, only for that request. Nothing is saved.",
  "Your API keys, settings and scanned inventory are stored in your browser only.",
  "Anonymous page-view analytics (Vercel Analytics) show which features get used.",
];

export default function AboutPage() {
  const latest = getLatestVersion();

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-start px-4 pb-4 pt-2 sm:px-6 sm:pt-4 md:px-8 md:pb-8">
      <main className="w-full max-w-4xl space-y-6 pb-12">
        {/* Hero */}
        <div className="glass-card glass-card--lg p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <BrandIcon size={96} className="h-16 w-16 shrink-0 sm:h-20 sm:w-20" />
            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-3xl md:text-4xl">
                About GI Helper
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-white/80">
                A free, fan-made helper for Genshin Impact players: scan your inventory
                screenshots, check every material, and export them to your favourite
                optimizer, without typing a single number.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <section aria-labelledby="features" className="space-y-3">
          <h2 id="features" className="px-1 text-xs font-bold uppercase tracking-wider text-white/60">
            What you can do
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="glass-card p-5">
                <div className="flex items-start gap-3">
                  <span className="glass-chip h-9 w-9 shrink-0 justify-center rounded-xl text-cyan-300">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">{title}</h3>
                    <p className="text-sm leading-relaxed text-white/75">{text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section aria-labelledby="how" className="glass-card glass-card--lg p-6 sm:p-8">
          <h2 id="how" className="text-lg font-extrabold tracking-tight text-white sm:text-xl">
            How it works
          </h2>
          <ol className="mt-4 space-y-3">
            {STEPS.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm leading-relaxed text-white/85">
                <span className="glass-chip h-6 w-6 shrink-0 justify-center font-mono text-xs font-bold text-cyan-300">
                  {index + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
          <Link href="/" className="glass-btn glass-btn--primary mt-6 px-5 py-2 text-sm">
            <Scan className="h-4 w-4" />
            Start scanning
          </Link>
        </section>

        {/* Privacy */}
        <section aria-labelledby="privacy" className="glass-card glass-card--lg p-6 sm:p-8">
          <h2
            id="privacy"
            className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-white sm:text-xl"
          >
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
            Your data
          </h2>
          <ul className="mt-4 space-y-2.5">
            {PRIVACY.map((point) => (
              <li key={point} className="flex gap-2.5 text-sm leading-relaxed text-white/85">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Fan project */}
        <section aria-labelledby="fan" className="glass-card glass-card--lg p-6 sm:p-8">
          <h2
            id="fan"
            className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-white sm:text-xl"
          >
            <Heart className="h-5 w-5 text-rose-300" />
            A fan project
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/80">
            GI Helper is an unofficial fan project and isn&apos;t affiliated with or endorsed
            by HoYoverse. Genshin Impact, its names, artwork and material icons are
            trademarks and copyrights of HoYoverse.
          </p>
          {latest && (
            <p className="mt-4 text-xs text-white/60">
              Version{" "}
              <Link href="/versions" className="font-mono font-semibold text-cyan-300 hover:underline">
                v{latest.version}
              </Link>
              . See the release notes for what changed.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
