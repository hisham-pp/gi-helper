"use client";

import React from "react";
import { SessionImage } from "@/lib/grid-detector";

interface SessionGalleryProps {
  images: SessionImage[];
  selectedImageId: string | null;
  onSelectImage: (id: string) => void;
}

export function SessionGallery({
  images,
  selectedImageId,
  onSelectImage,
}: SessionGalleryProps) {
  if (images.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-white/70">
        <span>SESSION IMAGES ({images.length})</span>
        <span>Click to view and calibrate detected grid</span>
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
        {images.map((img) => {
          const isSelected = img.id === selectedImageId;
          return (
            <div
              key={img.id}
              onClick={() => onSelectImage(img.id)}
              className={`group relative flex w-48 flex-shrink-0 cursor-pointer flex-col overflow-hidden rounded-2xl border transition-all ${
                isSelected
                  ? "border-primary bg-primary/10 shadow-lg ring-2 ring-primary/50"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              <div className="relative h-24 w-full overflow-hidden bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.dataUrl}
                  alt={img.name}
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-mono text-white/80">
                  {img.width}×{img.height}
                </span>
              </div>

              <div className="p-2.5">
                <div className="truncate text-xs font-bold text-white">
                  {img.name}
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[11px] font-bold text-primary">
                    {img.detectedGrid.columns}×{img.detectedGrid.rows} Grid
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      img.confidence >= 90
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    {img.confidence}%
                  </span>
                </div>
                {img.isManuallyAdjusted && (
                  <div className="mt-1 text-[10px] text-primary/80">
                    ✓ Calibrated
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
