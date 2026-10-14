"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Film, Scan, Sparkles } from "lucide-react";
import { BrandIcon } from "@/components/layout/BrandIcon";
import { ScannerTabs, TabItem } from "./ScannerTabs";
import { ClassicScannerView } from "./ClassicScannerView";

/** Same footprint as a tab's drop zone, so nothing jumps while a tab's code loads. */
function PanelPlaceholder() {
  return <div className="glass-pane min-h-[360px] w-full motion-safe:animate-pulse" aria-busy="true" />;
}

// The Video and AI Vision tabs load on demand: most visits only use the
// screenshot scanner, so their code and setup stay out of the first load.
const loadVideoScanner = () => import("./VideoScannerView");
const loadAiScanner = () => import("./AiScannerView");
const VideoScannerView = dynamic(() => loadVideoScanner().then((m) => m.VideoScannerView), {
  ssr: false,
  loading: PanelPlaceholder,
});
const AiScannerView = dynamic(() => loadAiScanner().then((m) => m.AiScannerView), {
  ssr: false,
  loading: PanelPlaceholder,
});
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

const SCANNER_TABS: TabItem[] = [
  {
    id: "scanner",
    label: "Scanner",
    icon: <Scan className="h-4 w-4" />,
    panelId: "scanner-panel",
  },
  {
    id: "video",
    label: "Video",
    icon: <Film className="h-4 w-4" />,
    panelId: "video-panel",
  },
  {
    id: "ai",
    label: "AI Vision",
    icon: <Sparkles className="h-4 w-4" />,
    panelId: "ai-panel",
  },
];

/**
 * Main Scanner Page Orchestrator
 * Houses the single common title & description (no badges) and animated pill tabs with:
 * - Tab 0: Standard Scanner (default active)
 * - Tab 1: Video Scanner (screen recordings)
 * - Tab 2: AI Vision Scanner
 */
export function Scanner() {
  const [activeTab, setActiveTab] = useState<number>(0);
  // Tabs opened so far: each mounts on first visit and then stays mounted
  const [visited, setVisited] = useState<ReadonlySet<number>>(() => new Set([0]));
  const panelsRef = useRef<HTMLDivElement>(null);
  const prevTabRef = useRef(activeTab);
  const reducedMotion = usePrefersReducedMotion();

  // Drop zone echoes the tab thumb's squash-and-stretch, nudged in the direction of travel.
  useEffect(() => {
    const prevTab = prevTabRef.current;
    prevTabRef.current = activeTab;
    if (prevTab === activeTab || reducedMotion) return;

    const dir = activeTab > prevTab ? 1 : -1;
    const panelId = SCANNER_TABS[activeTab].panelId;
    panelsRef.current?.querySelector<HTMLElement>(`#${panelId} .glass-pane`)?.animate(
      [
        { transform: `translateX(${14 * dir}px) scale(0.97)` },
        { transform: `translateX(${-3 * dir}px) scale(1.012, 0.985)`, offset: 0.45 },
        { transform: "translateX(0) scale(0.996, 1.006)", offset: 0.75 },
        { transform: "translateX(0) scale(1)" },
      ],
      { duration: 600, easing: "ease-out" },
    );
  }, [activeTab, reducedMotion]);

  useEffect(() => {
    setVisited((prev) => (prev.has(activeTab) ? prev : new Set(prev).add(activeTab)));
  }, [activeTab]);

  // Fetch the other tabs' code once the page is idle, so switching is instant
  useEffect(() => {
    const prefetch = () => {
      loadVideoScanner().catch(() => {});
      loadAiScanner().catch(() => {});
    };
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(prefetch, { timeout: 5000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = setTimeout(prefetch, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const index = SCANNER_TABS.findIndex((t) => t.id === params.get("tab"));
      if (index >= 0) setActiveTab(index);
    }
  }, []);

  const handleTabChange = (index: number) => {
    setActiveTab(index);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", SCANNER_TABS[index].id);
      window.history.replaceState({}, "", url.toString());
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center space-y-6 pt-2 sm:pt-4">
      {/* Header: mode-neutral Icon + Title & Description shared by all tabs */}
      <div className="space-y-2 text-center">
        {/* Icon flows inline so it stays beside the first word when the title wraps */}
        <h1 className="text-balance text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.7)]">
          Extract Materials from Screenshots
        </h1>
        <p className="mx-auto max-w-xl text-xs sm:text-sm text-cyan-100/75 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
          Upload screenshots or a screen recording of your Genshin Impact inventory to instantly extract materials.
        </p>
      </div>

      {/* Animated Pill Tabs Navigation */}
      <div className="flex w-full justify-center">
        <ScannerTabs
          tabs={SCANNER_TABS}
          activeIndex={activeTab}
          onTabChange={handleTabChange}
          ariaLabel="Scanner mode selection"
        />
      </div>

      {/* Content Panels with Entry Animation.
          Each mounts the first time its tab opens and then stays mounted, so
          switching tabs keeps each one's state (last review, a scan in
          progress; results live on /inventory); the inactive ones are just
          hidden, and its entry animation replays when it is shown again. */}
      <div ref={panelsRef} className="w-full">
        <div hidden={activeTab !== 0}>
          <ClassicScannerView id="scanner-panel" ariaLabelledBy="scanner-tab" />
        </div>
        <div hidden={activeTab !== 1}>
          {visited.has(1) && <VideoScannerView id="video-panel" ariaLabelledBy="video-tab" />}
        </div>
        <div hidden={activeTab !== 2}>
          {visited.has(2) && <AiScannerView id="ai-panel" ariaLabelledBy="ai-tab" />}
        </div>
      </div>
    </div>
  );
}
