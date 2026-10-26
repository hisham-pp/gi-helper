import type { Metadata } from "next";
import { ShellLink } from "@/components/layout/ShellLink";
import {
  Video,
  MonitorCheck,
  Sparkles,
  CheckCircle2,
  Scan,
  Smartphone,
  Laptop,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { pageMetadata, SITE } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Scan Genshin Inventory from Video & Screen Share – Video OCR Scanner",
  description:
    "How to scan hundreds of Genshin Impact materials, weapons, and artifacts in seconds using video screen recordings or live browser screen sharing. No software installation.",
  path: "/guides/video-inventory-scanner",
});

const VIDEO_STEPS = [
  {
    title: "1. Start Screen Recording or Screen Share",
    description:
      "On PC or Mac, open your preferred screen recorder (OBS, GeForce Experience, Windows Game Bar Win+G, or Mac Cmd+Shift+5), or use GI Helper's built-in live browser screen share feature.",
  },
  {
    title: "2. Open Genshin Bag & Scroll Smoothly",
    description:
      "Navigate to the bag tab you wish to scan (e.g. Materials or Character Development Items). Scroll down steadily from top to bottom, pausing for about half a second every few rows to avoid motion blur.",
  },
  {
    title: "3. Drop Video into GI Helper",
    description:
      "Open the 'Video' tab in GI Helper and drop your .mp4, .webm, or .mov file. If you used the live screen share tool, processing begins automatically the moment you stop recording.",
  },
  {
    title: "4. Frame Extraction & Automatic Deduplication",
    description:
      "GI Helper extracts frames, detects vertical scroll displacement, and automatically eliminates duplicate item rows, stitching the full grid seamlessly.",
  },
  {
    title: "5. Batch Confirmation & Export",
    description:
      "Review the parsed items in the summary modal, confirm any unverified quantities, and add them to your local inventory or export immediately to GOOD format.",
  },
];

export default function VideoInventoryScannerGuide() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HowTo",
        name: "How to Scan Genshin Inventory from Video or Screen Recording",
        description:
          "Guide on bulk scanning Genshin Impact inventory items rapidly using screen recordings or live screen sharing in your browser.",
        step: VIDEO_STEPS.map((s, idx) => ({
          "@type": "HowToStep",
          position: idx + 1,
          name: s.title,
          text: s.description,
        })),
      },
      {
        "@type": "Article",
        headline: "Scan Genshin Inventory from Video & Screen Recording Guide",
        description:
          "Rapid bulk inventory scanning using video screen recordings and client-side frame stitching.",
        url: `${SITE.url}/guides/video-inventory-scanner`,
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
          <span className="text-white/80">Video Scanner</span>
        </nav>

        {/* Header Hero */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-semibold text-cyan-300">
            <Video className="h-3.5 w-3.5" />
            <span>Video &amp; Live Stream Capture</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-3xl md:text-4xl">
            Scan Genshin Inventory from Video: Rapid Bulk Screen Recording Scanner
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-white/80 sm:text-base">
            Taking dozens of individual screenshots to document hundreds of local specialties, talent
            books, and weapon ascension materials is tedious. Learn how GI Helper lets you capture
            your entire inventory in a single 15-second screen recording or live browser screen share.
          </p>
        </header>

        {/* Why Video Scanning is Faster */}
        <section className="glass-card glass-card--lg p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-white sm:text-xl">
            Why Video Scanning Changes the Game
          </h2>
          <div className="grid gap-4 sm:grid-cols-3 pt-2">
            <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
              <span className="glass-chip h-8 w-8 justify-center rounded-xl text-cyan-300 font-bold text-xs">
                10x
              </span>
              <h3 className="text-sm font-bold text-white">10x Faster Than Screenshots</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Record your screen while scrolling smoothly through your bag once. A 20-second video
                captures over 200 distinct items with zero manual cropping.
              </p>
            </div>

            <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
              <span className="glass-chip h-8 w-8 justify-center rounded-xl text-emerald-300 font-bold text-xs">
                AI
              </span>
              <h3 className="text-sm font-bold text-white">Automatic Frame Stitching</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                GI Helper analyzes inter-frame optical flow to detect exactly how far the grid
                scrolled, ensuring no items are missed or duplicated.
              </p>
            </div>

            <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
              <span className="glass-chip h-8 w-8 justify-center rounded-xl text-amber-300 font-bold text-xs">
                Live
              </span>
              <h3 className="text-sm font-bold text-white">In-Browser Screen Sharing</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Desktop and mobile browsers can share their Genshin game window directly to GI Helper
                with WebRTC screen sharing—no video files to save or transfer!
              </p>
            </div>
          </div>
        </section>

        {/* Step-by-Step Instructions */}
        <section aria-labelledby="steps-section" className="space-y-4">
          <h2 id="steps-section" className="text-xl font-bold text-white">
            How to Record &amp; Scan in 5 Easy Steps
          </h2>
          <div className="space-y-3">
            {VIDEO_STEPS.map((s, idx) => (
              <div key={s.title} className="glass-card p-5 flex items-start gap-4">
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

        {/* Mobile & Console Recording Tips */}
        <section className="glass-card glass-card--lg p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-white sm:text-xl">
            Platform-Specific Video Scanning Tips
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-cyan-300">
                <Smartphone className="h-4 w-4" />
                <h3 className="text-sm font-bold text-white">iPhone, iPad &amp; Android</h3>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Swipe down to open Control Center / Quick Settings, tap <strong>Screen Recording</strong>,
                scroll through your bag in Genshin, stop recording, and open GI Helper in mobile
                Safari or Chrome. Upload the video directly from your camera roll.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-300">
                <Laptop className="h-4 w-4" />
                <h3 className="text-sm font-bold text-white">PC &amp; Mac</h3>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Click <strong>Live Screen Studio</strong> right on the GI Helper scanner tab! Click
                &quot;Share Screen&quot;, select the Genshin window, and start scrolling. The video
                is analyzed in real time with zero temporary files created.
              </p>
            </div>
          </div>
        </section>

        {/* Pro Tips for Clean Scans */}
        <section className="glass-card p-6 space-y-3">
          <div className="flex items-center gap-2 text-cyan-300">
            <Sparkles className="h-5 w-5" />
            <h3 className="text-base font-bold text-white">Best Practices for Maximum Accuracy</h3>
          </div>
          <ul className="space-y-2 text-xs text-white/75 sm:text-sm leading-relaxed">
            <li className="flex gap-2">
              <span className="text-cyan-300">•</span>
              <span>
                <strong>Scroll steadily:</strong> Don&apos;t flick your scroll wheel rapidly. A smooth,
                steady scroll gives the frame extractor clean, unblurred item counts.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-300">•</span>
              <span>
                <strong>Resolution:</strong> 1080p (1920x1080) or higher provides the sharpest font
                clarity for item quantity digits.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-300">•</span>
              <span>
                <strong>Supported formats:</strong> GI Helper accepts .mp4, .webm, and .mov screen
                recordings natively.
              </span>
            </li>
          </ul>
        </section>

        {/* CTA Bar */}
        <div className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-white">Try the Video Scanner</h3>
            <p className="text-xs text-white/70">
              Switch to the Video tab or Live Screen Studio on the home page.
            </p>
          </div>
          <div className="flex gap-3">
            <ShellLink href="/" className="glass-btn glass-btn--primary px-5 py-2 text-xs font-bold">
              <Scan className="h-4 w-4" />
              Open Scanner
            </ShellLink>
            <ShellLink href="/guides" className="glass-btn px-4 py-2 text-xs font-medium">
              All Guides →
            </ShellLink>
          </div>
        </div>
      </article>
    </div>
  );
}
