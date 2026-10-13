"use client";

import React from "react";

interface CellSlicesPreviewProps {
  slices: string[];
}

export function CellSlicesPreview({ slices }: CellSlicesPreviewProps) {
  if (slices.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-2 flex items-center justify-between text-xs font-bold text-white/80">
        <span>SLICED CELLS REAL-TIME VERIFICATION</span>
        <span className="text-[11px] text-white/50">
          First {slices.length} items extracted from grid
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {slices.map((sliceData, idx) => (
          <div
            key={idx}
            className="flex h-20 w-16 flex-shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl border border-cyan-500/30 bg-black/40 p-1 shadow"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sliceData}
              alt={`Cell ${idx}`}
              className="h-14 w-auto object-contain"
            />
            <span className="text-[9px] font-mono text-white/60">
              #{idx + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
