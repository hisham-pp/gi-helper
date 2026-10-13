"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Grid, Cpu, Sparkles } from "lucide-react";

// Dynamically import the heavy client debuggers with ssr: false to prevent SSR hydration or canvas mismatches
const GridSessionStudio = dynamic(
  () =>
    import("@/components/grid-detector/GridSessionStudio").then(
      (m) => m.GridSessionStudio,
    ),
  { ssr: false },
);

const ScannerDebugger = dynamic(
  () =>
    import("@/components/scanner/debug/ScannerDebugger").then(
      (m) => m.ScannerDebugger,
    ),
  { ssr: false },
);

export function DebugViewManager() {
  const [activeMode, setActiveMode] = useState<
    "grid-sessions" | "pipeline-inspector"
  >("grid-sessions");

  return (
    <div className="w-full max-w-7xl space-y-6">
      {/* Mode Switcher Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-3 px-5 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-white/80">
            Debug Studio Mode:
          </span>
        </div>

        <div className="flex items-center rounded-2xl border border-white/10 bg-black/40 p-1">
          <button
            onClick={() => setActiveMode("grid-sessions")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeMode === "grid-sessions"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-white/70 hover:text-white"
            }`}
          >
            <Grid className="h-4 w-4" />
            <span>Grid Auto-Detector Sessions</span>
          </button>

          <button
            onClick={() => setActiveMode("pipeline-inspector")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeMode === "pipeline-inspector"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-white/70 hover:text-white"
            }`}
          >
            <Cpu className="h-4 w-4" />
            <span>Legacy CV / OCR Inspector</span>
          </button>
        </div>
      </div>

      {/* Active Mode View */}
      {activeMode === "grid-sessions" ? (
        <GridSessionStudio />
      ) : (
        <ScannerDebugger />
      )}
    </div>
  );
}
