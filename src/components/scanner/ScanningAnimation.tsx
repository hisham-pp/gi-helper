"use client";

import React from "react";
import { Sparkles, CheckCircle2, Loader2 } from "lucide-react";

export interface ScanningFileItem {
  file?: File;
  previewUrl: string;
  name: string;
  status: "pending" | "scanning" | "completed";
  itemCount?: number;
}

export interface ScanningAnimationProps {
  isScanning: boolean;
  progress: number;
  statusMessage?: string;
  activeImageSrc?: string | null;
  activeFileName?: string;
  fileIndex?: number;
  totalFiles?: number;
  providerDisplayName?: string;
  modelName?: string;
  scanningFiles?: ScanningFileItem[];
  onSelectThumbnail?: (index: number) => void;
}

export function ScanningAnimation({
  progress,
  statusMessage,
  activeImageSrc,
  activeFileName = "Inventory_Screenshot.png",
  fileIndex = 1,
  totalFiles = 1,
  providerDisplayName = "Vision AI",
  modelName,
  scanningFiles = [],
  onSelectThumbnail,
}: ScanningAnimationProps) {
  return (
    <div className="animate-in fade-in flex w-full flex-col justify-between space-y-3.5 duration-300">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2 text-xs">
        {/* Left: Active Status & File */}
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500" />
          </span>
          <div className="flex min-w-0 items-center gap-2">
            <span className="max-w-xs truncate font-semibold text-white md:max-w-md">
              {activeFileName}
            </span>
            {totalFiles > 1 && (
              <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/80">
                {fileIndex} of {totalFiles}
              </span>
            )}
          </div>
        </div>

        {/* Right: Model Badge */}
        <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300 backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span className="font-medium">{providerDisplayName}</span>
          {modelName && (
            <span className="hidden text-white/50 sm:inline">
              ({modelName})
            </span>
          )}
        </div>
      </div>

      {/* Image Scan Viewport - Matches Dropzone Size (always a dark screen, so on-dark) */}
      <div className="on-dark relative h-56 w-full overflow-hidden rounded-2xl border border-cyan-500/30 bg-black/80 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] sm:h-64 md:h-72">
        {activeImageSrc ? (
          <img
            src={activeImageSrc}
            alt={activeFileName}
            className="h-full w-full select-none object-cover brightness-95 contrast-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-white/50">
            <Loader2 className="mb-2 h-8 w-8 animate-spin text-cyan-400" />
            <span className="text-sm font-medium">
              Preparing screenshot buffer...
            </span>
          </div>
        )}

        {/* Subtle Cyber Grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(6, 182, 212, 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(6, 182, 212, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Subtle Vignette Gradient */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_65%,rgba(0,0,0,0.6)_100%)]" />

        {/* Minimal Corner Brackets */}
        <div className="pointer-events-none absolute inset-0 p-3">
          <div className="absolute left-3 top-3 h-3.5 w-3.5 border-l-2 border-t-2 border-cyan-400" />
          <div className="absolute right-3 top-3 h-3.5 w-3.5 border-r-2 border-t-2 border-cyan-400" />
          <div className="absolute bottom-3 left-3 h-3.5 w-3.5 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute bottom-3 right-3 h-3.5 w-3.5 border-b-2 border-r-2 border-cyan-400" />
        </div>

        {/* The Sweeping Laser Beam */}
        <div className="animate-scan-laser pointer-events-none absolute inset-x-0 z-20">
          {/* Luminous Trailing Light Wash */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-cyan-400/20 via-cyan-500/5 to-transparent" />

          {/* High-Intensity Laser Line */}
          <div className="relative h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-300 via-white to-transparent shadow-[0_0_14px_#22d3ee,0_0_28px_#06b6d4]" />

          {/* Center Glowing Point */}
          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
            <div className="h-5 w-5 animate-ping rounded-full bg-cyan-200 opacity-70 blur-sm" />
            <div className="absolute h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_12px_#fff]" />
          </div>
        </div>
      </div>

      {/* Multi-Image Thumbnail Queue (If more than 1 image) */}
      {scanningFiles && scanningFiles.length > 1 && (
        <div className="scrollbar-none flex items-center gap-2 overflow-x-auto pb-0.5">
          {scanningFiles.map((item, idx) => {
            const isCurrent = idx === fileIndex - 1;
            const isDone = item.status === "completed";
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectThumbnail?.(idx)}
                className={`relative h-9 w-14 shrink-0 overflow-hidden rounded-lg border transition-all ${
                  isCurrent
                    ? "scale-105 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                    : isDone
                      ? "border-emerald-500/50 opacity-80 hover:opacity-100"
                      : "border-white/10 opacity-40 hover:opacity-75"
                }`}
              >
                {item.previewUrl && (
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                )}
                {isDone && (
                  <div className="absolute inset-0 flex items-center justify-center bg-emerald-950/60">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Progress & Status Row */}
      <div className="space-y-2 pt-1">
        {/* Progress Bar */}
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 shadow-[0_0_12px_#22d3ee] transition-all duration-300 ease-out"
            style={{ width: `${Math.max(5, progress)}%` }}
          />
        </div>

        {/* Status Text & Percentage */}
        <div className="flex items-center justify-between text-xs text-white/80">
          <span className="truncate pr-2 font-medium">
            {statusMessage || "Analyzing materials with Vision AI..."}
          </span>
          <span className="shrink-0 font-semibold text-cyan-300">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
}
