"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import type { SessionImage } from "@/lib/grid-detector";
import { useObjectUrl } from "@/lib/grid-detector/react";

interface SessionGalleryProps {
  images: SessionImage[];
  selectedImageId: string | null;
  detectingIds: ReadonlySet<string>;
  onSelectImage: (id: string) => void;
}

function GalleryItem({
  img,
  isSelected,
  isDetecting,
  onSelect,
}: {
  img: SessionImage;
  isSelected: boolean;
  isDetecting: boolean;
  onSelect: () => void;
}) {
  const url = useObjectUrl(img.blob);
  const grids = img.grids ?? [];
  const cards = grids.reduce((s, g) => s + g.cards.length, 0);
  const main = grids[0];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex w-48 flex-shrink-0 flex-col overflow-hidden rounded-2xl border text-left transition-all ${
        isSelected
          ? "border-primary bg-primary/10 shadow-lg ring-2 ring-primary/50"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
      }`}
    >
      <div className="relative h-24 w-full overflow-hidden bg-black/40">
        {url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={img.name} className="h-full w-full object-cover" />
        )}
        <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1.5 py-0.5 font-mono text-[10px] text-white/80">
          {img.width}×{img.height}
        </span>
        {isDetecting && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </span>
        )}
      </div>

      <div className="w-full p-2.5">
        <div className="truncate text-xs font-bold text-white">{img.name}</div>
        <div className="mt-1 flex items-center justify-between">
          <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[11px] font-bold text-primary">
            {img.grids === null
              ? "Not detected"
              : main
                ? `${grids.length > 1 ? `${grids.length} grids · ` : ""}${main.columns}×${main.rows}`
                : "No grid"}
          </span>
          {img.grids !== null && (
            <span className="text-[10px] font-bold text-white/70">{cards} {cards === 1 ? "card" : "cards"}</span>
          )}
        </div>
        {img.isManuallyAdjusted && (
          <div className="mt-1 text-[10px] text-sky-300/90">✓ Manually edited</div>
        )}
      </div>
    </button>
  );
}

export function SessionGallery({
  images,
  selectedImageId,
  detectingIds,
  onSelectImage,
}: SessionGalleryProps) {
  if (images.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-white/70">
        <span>SESSION IMAGES ({images.length})</span>
        <span>Click to review and correct detected cards</span>
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
        {images.map((img) => (
          <GalleryItem
            key={img.id}
            img={img}
            isSelected={img.id === selectedImageId}
            isDetecting={detectingIds.has(img.id)}
            onSelect={() => onSelectImage(img.id)}
          />
        ))}
      </div>
    </div>
  );
}
