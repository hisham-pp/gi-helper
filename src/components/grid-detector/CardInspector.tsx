"use client";

import React, { useEffect, useState } from "react";
import { Download, MousePointerClick, Trash2 } from "lucide-react";
import {
  cropToBlob,
  type CardEdit,
  type DetectedCard,
  type DetectedGrid,
  type PixelRect,
} from "@gi/grid-detector";
import { useObjectUrl } from "@gi/grid-detector/react";

interface CardInspectorProps {
  selection: { grid: DetectedGrid; card: DetectedCard } | null;
  bitmap: ImageBitmap | null;
  imageName: string;
  onEdit: (edit: CardEdit) => void;
}

const FIELDS: { key: keyof PixelRect; label: string }[] = [
  { key: "x", label: "X" },
  { key: "y", label: "Y" },
  { key: "width", label: "W" },
  { key: "height", label: "H" },
];

export function CardInspector({ selection, bitmap, imageName, onEdit }: CardInspectorProps) {
  const card = selection?.card ?? null;
  const [crop, setCrop] = useState<Blob | null>(null);
  const cropUrl = useObjectUrl(crop);

  // Original-resolution crop of the selected card.
  useEffect(() => {
    setCrop(null);
    if (!card || !bitmap) return;
    let stale = false;
    cropToBlob(bitmap, card)
      .then((b) => {
        if (!stale) setCrop(b);
      })
      .catch(() => {
        if (!stale) setCrop(null);
      });
    return () => {
      stale = true;
    };
  }, [card, bitmap]);

  if (!selection || !card) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-white/50">
        <MousePointerClick className="h-4 w-4 text-primary" />
        Select a card to see its coordinates, adjust it or remove it.
      </div>
    );
  }

  const setField = (key: keyof PixelRect, value: number) => {
    if (!Number.isFinite(value)) return;
    const rect: PixelRect = { x: card.x, y: card.y, width: card.width, height: card.height };
    rect[key] = value;
    onEdit({ type: "update", cardId: card.id, rect });
  };

  const downloadName = `${imageName.replace(/\.[^.]+$/, "")}-${card.id}.png`;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-white/70">
          Selected Card
        </span>
        <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[11px] text-white/70">
          {card.row !== null && card.column !== null
            ? `row ${card.row + 1} · col ${card.column + 1}`
            : "no row/column"}
        </span>
      </div>

      <div className="mt-3 flex gap-3">
        <div className="flex h-28 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/40">
          {cropUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cropUrl} alt="Selected card crop" className="max-h-full max-w-full object-contain" />
          ) : (
            <span className="text-[10px] text-white/40">…</span>
          )}
        </div>
        <div className="grid flex-1 grid-cols-2 gap-1.5">
          {FIELDS.map(({ key, label }) => (
            <label key={key} className="text-[10px] text-white/50">
              {label}
              <input
                type="number"
                value={card[key]}
                min={key === "width" || key === "height" ? 1 : 0}
                onChange={(e) => setField(key, Number(e.target.value))}
                className="mt-0.5 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1 font-mono text-xs text-white"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/60">
        <span>
          Confidence{" "}
          <span className="font-bold text-white">{Math.round(card.confidence * 100)}%</span>
        </span>
        <span>
          Source <span className="font-bold capitalize text-white">{card.source}</span>
        </span>
        {card.clipped && <span className="font-bold text-violet-300">Cut off</span>}
        <span className="text-white/40">{selection.grid.id}</span>
      </div>

      <div className="mt-3 flex gap-2">
        <a
          href={cropUrl ?? undefined}
          download={downloadName}
          aria-disabled={!cropUrl}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/10 py-1.5 text-xs font-semibold text-white hover:bg-white/20 ${
            cropUrl ? "" : "pointer-events-none opacity-50"
          }`}
        >
          <Download className="h-3.5 w-3.5" />
          Crop (PNG)
        </a>
        <button
          type="button"
          onClick={() => onEdit({ type: "remove", cardId: card.id })}
          className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove
        </button>
      </div>
    </div>
  );
}
