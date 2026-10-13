"use client";

import React from "react";
import { GridConfig, GridDetectionResult, SessionImage } from "@/lib/grid-detector";

interface DetectionMetricsProps {
  activeImage: SessionImage;
  gridConfig: GridConfig;
  detectionMeta: GridDetectionResult | null;
}

export function DetectionMetrics({
  activeImage,
  gridConfig,
  detectionMeta,
}: DetectionMetricsProps) {
  const isHighConf = activeImage.confidence >= 90;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-white/70">
          Grid Detection Result
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
            isHighConf
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-amber-500/20 text-amber-400"
          }`}
        >
          {activeImage.confidence}% Confidence
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl bg-white/5 p-2">
          <span className="text-white/50">Grid Layout:</span>
          <div className="text-sm font-bold text-primary">
            {gridConfig.columns} × {gridConfig.rows}
          </div>
        </div>
        <div className="rounded-xl bg-white/5 p-2">
          <span className="text-white/50">Total Cells:</span>
          <div className="text-sm font-bold text-white">
            {gridConfig.columns * gridConfig.rows}
          </div>
        </div>
        <div className="rounded-xl bg-white/5 p-2">
          <span className="text-white/50">Cell Dimensions:</span>
          <div className="font-mono text-white">
            {gridConfig.cellWidth} × {gridConfig.cellHeight}px
          </div>
        </div>
        <div className="rounded-xl bg-white/5 p-2">
          <span className="text-white/50">Offsets (X, Y):</span>
          <div className="font-mono text-white">
            {gridConfig.startX}, {gridConfig.startY}px
          </div>
        </div>
      </div>

      {detectionMeta?.explanation && (
        <p className="mt-3 text-[11px] leading-relaxed text-white/60">
          {detectionMeta.explanation}
        </p>
      )}
    </div>
  );
}
