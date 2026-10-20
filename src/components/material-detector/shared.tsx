"use client";

import React from "react";
import type { CardRecognition, CardRecognitionStatus } from "@gi/image-scanner";

export const STATUS_STYLE: Record<CardRecognitionStatus, { label: string; chip: string; border: string; stroke: string }> = {
  matched: {
    label: "Matched",
    chip: "bg-emerald-500/20 text-emerald-300",
    border: "border-emerald-400/40",
    stroke: "#34d399",
  },
  uncertain: {
    label: "Check",
    chip: "bg-amber-500/20 text-amber-200",
    border: "border-amber-400/50",
    stroke: "#fbbf24",
  },
  unknown: {
    label: "Unknown",
    chip: "bg-rose-500/20 text-rose-300",
    border: "border-rose-400/50",
    stroke: "#fb7185",
  },
};

export const pct = (v: number) => `${Math.round(v * 100)}%`;

/** Catalog icon of a material (the same image the recognizer matched against). */
export function MaterialIcon({ id, size = 40, className = "" }: { id: string; size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/images/materials/${id}.png`}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function Stars({ count, className = "" }: { count: number | null; className?: string }) {
  if (!count) return <span className={`text-white/40 ${className}`}>–</span>;
  return (
    <span className={`tracking-tight text-amber-300 ${className}`} aria-label={`${count} stars`}>
      {"★".repeat(count)}
    </span>
  );
}

/** Short label drawn on the screenshot over a recognised card. */
export function cardLabel(card: CardRecognition): string {
  if (!card.material) return "?";
  const qty = card.quantity.value !== null ? ` ×${card.quantity.value}` : " ×?";
  const name = card.material.name.length > 18 ? `${card.material.name.slice(0, 17)}…` : card.material.name;
  return `${name}${qty}`;
}
