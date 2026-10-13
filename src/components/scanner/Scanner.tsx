"use client";

import React, { useState, useEffect } from "react";
import { Scan, Sparkles } from "lucide-react";
import { ScannerTabs, TabItem } from "./ScannerTabs";
import { ClassicScannerView } from "./ClassicScannerView";
import { AiScannerView } from "./AiScannerView";

const SCANNER_TABS: TabItem[] = [
  {
    id: "scanner",
    label: "Scanner",
    icon: <Scan className="h-4 w-4" />,
    panelId: "scanner-panel",
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
 * - Tab 1: AI Vision Scanner
 */
export function Scanner() {
  const [activeTab, setActiveTab] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "ai") {
        setActiveTab(1);
      } else if (tabParam === "scanner") {
        setActiveTab(0);
      }
    }
  }, []);

  const handleTabChange = (index: number) => {
    setActiveTab(index);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", index === 1 ? "ai" : "scanner");
      window.history.replaceState({}, "", url.toString());
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center space-y-6 pt-2 sm:pt-4">
      {/* Single Common Header: Same Title & Description across both views, No Badges */}
      <div className="space-y-1.5 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
          Inventory Scanner
        </h1>
        <p className="mx-auto max-w-xl text-xs sm:text-sm text-white/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          Upload screenshots of your Genshin Impact inventory to instantly extract materials.
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

      {/* Content Panels with Entry Animation */}
      <div className="w-full">
        {activeTab === 0 ? (
          <ClassicScannerView
            key="scanner-panel"
            id="scanner-panel"
            ariaLabelledBy="scanner-tab"
          />
        ) : (
          <AiScannerView
            key="ai-panel"
            id="ai-panel"
            ariaLabelledBy="ai-tab"
          />
        )}
      </div>
    </div>
  );
}
