"use client";

import React, { useEffect, useState } from "react";
import { cropToBlob, type DetectedGrid } from "@gi/grid-detector";

interface CardCropsStripProps {
  bitmap: ImageBitmap | null;
  grids: DetectedGrid[];
  selectedCardId: string | null;
  onSelectCard: (id: string) => void;
}

/** Thumbnails show at most this many cards; crops are generated lazily in order. */
const MAX_CROPS = 80;

/**
 * Original-quality crops of every detected card — a quick visual check that
 * boxes are tight before the crops are used for recognition.
 */
export function CardCropsStrip({ bitmap, grids, selectedCardId, onSelectCard }: CardCropsStripProps) {
  const cards = grids.flatMap((g) => g.cards);
  const [urls, setUrls] = useState<Record<string, string>>({});

  // Re-crop when boxes change; revoke every URL created by the previous run.
  const key = cards.map((c) => `${c.id}:${c.x},${c.y},${c.width},${c.height}`).join("|");
  useEffect(() => {
    setUrls({});
    if (!bitmap) return;
    let cancelled = false;
    const created: string[] = [];
    (async () => {
      for (const card of cards.slice(0, MAX_CROPS)) {
        if (cancelled) return;
        try {
          const blob = await cropToBlob(bitmap, card, "image/webp");
          if (cancelled) return;
          const url = URL.createObjectURL(blob);
          created.push(url);
          setUrls((prev) => ({ ...prev, [card.id]: url }));
        } catch {
          // A failed crop only hides its thumbnail.
        }
      }
    })();
    return () => {
      cancelled = true;
      created.forEach((u) => URL.revokeObjectURL(u));
    };
    // `key` captures every box change; `cards` itself is a new array each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bitmap, key]);

  if (cards.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-2 flex items-center justify-between text-xs font-bold text-white/80">
        <span>CARD CROPS</span>
        <span className="text-[11px] font-normal text-white/50">
          {Math.min(cards.length, MAX_CROPS)} of {cards.length} · original resolution
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {cards.slice(0, MAX_CROPS).map((card) => (
          <button
            type="button"
            key={card.id}
            onClick={() => onSelectCard(card.id)}
            className={`flex h-24 w-16 flex-shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl border bg-black/40 p-1 shadow ${
              card.id === selectedCardId ? "border-white ring-2 ring-white/40" : "border-cyan-500/30"
            }`}
          >
            {urls[card.id] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={urls[card.id]} alt={card.id} className="h-16 w-auto object-contain" />
            ) : (
              <span className="h-16" />
            )}
            <span className="mt-1 font-mono text-[9px] text-white/60">
              {card.row !== null && card.column !== null ? `${card.row + 1}·${card.column + 1}` : "–"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
