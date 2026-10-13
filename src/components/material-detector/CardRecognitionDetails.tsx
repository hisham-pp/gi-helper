"use client";

import React from "react";
import { ArrowDownUp, BadgeInfo, Hash, Sparkles } from "lucide-react";
import type { CardRecognition } from "@/lib/material-detector";
import { MaterialIcon, pct, Stars, STATUS_STYLE } from "./shared";

interface CardRecognitionDetailsProps {
  recognition: CardRecognition | null;
  busy: boolean;
}

/**
 * Why the selected card was recognised as it was: the candidates with their
 * fit errors, both rarity signals and the quantity reading.
 */
export function CardRecognitionDetails({ recognition: rec, busy }: CardRecognitionDetailsProps) {
  if (!rec) {
    return busy ? (
      <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-white/50">Identifying…</div>
    ) : null;
  }
  const style = STATUS_STYLE[rec.status];
  const rarityAgrees = rec.rarity.stars !== null && rec.rarity.background !== null && rec.rarity.stars === rec.rarity.background;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-white/70">Recognition</span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${style.chip}`}>
          {style.label} · {pct(rec.confidence)}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl border bg-black/40 ${style.border}`}>
          {rec.material ? <MaterialIcon id={rec.material.id} size={52} /> : <span className="text-white/40">?</span>}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-white">{rec.material?.name ?? "Not in the catalog"}</div>
          {rec.material && <Stars count={rec.material.rarity} className="text-xs" />}
          <div className="mt-0.5 flex flex-wrap gap-1.5 text-[10px]">
            {rec.hasNewBadge && (
              <span className="flex items-center gap-1 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-amber-200" title="Masked while matching">
                <Sparkles className="h-3 w-3" /> New badge
              </span>
            )}
            {rec.orderAdjusted && (
              <span
                className="flex items-center gap-1 rounded-md bg-sky-500/15 px-1.5 py-0.5 text-sky-200"
                title="Picked by inventory order among near-identical candidates"
              >
                <ArrowDownUp className="h-3 w-3" /> Order
              </span>
            )}
          </div>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[11px]">
        <dt className="flex items-center gap-1 text-white/50">
          <BadgeInfo className="h-3 w-3" /> Rarity
        </dt>
        <dd className="text-right text-white/80">
          <Stars count={rec.rarity.value} />{" "}
          <span className="text-white/40">
            (stars {rec.rarity.stars ?? "–"} · background {rec.rarity.background ?? "–"}
            {rarityAgrees ? " ✓" : ""}) {pct(rec.rarity.confidence)}
          </span>
        </dd>
        <dt className="flex items-center gap-1 text-white/50">
          <Hash className="h-3 w-3" /> Quantity
        </dt>
        <dd className="text-right font-mono text-white/80">
          {rec.quantity.value ?? "unreadable"}
          {rec.quantity.text && rec.quantity.text !== String(rec.quantity.value) && (
            <span className="text-white/40"> (“{rec.quantity.text}”)</span>
          )}{" "}
          <span className="text-white/40">{pct(rec.quantity.confidence)}</span>
        </dd>
        <dt className="text-white/50">Matched box</dt>
        <dd className="text-right font-mono text-white/60">
          {Math.round(rec.matchedBox.x)}, {Math.round(rec.matchedBox.y)} · {Math.round(rec.matchedBox.width)}×
          {Math.round(rec.matchedBox.height)}
        </dd>
      </dl>

      {rec.candidates.length > 0 && (
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-[10px] font-bold uppercase tracking-wider text-white/40">
            <span>Candidates</span>
            <span title="Mean colour error of the icon composited on the card (lower is better)">error · conf</span>
          </div>
          <ul className="space-y-1">
            {rec.candidates.map((c, k) => (
              <li
                key={c.id}
                className={`flex items-center gap-2 rounded-lg px-1.5 py-1 text-[11px] ${k === 0 ? "bg-white/10" : "bg-white/[0.03]"}`}
              >
                <MaterialIcon id={c.id} size={24} className="flex-shrink-0" />
                <span className="min-w-0 flex-1 truncate text-white/80">{c.name}</span>
                <Stars count={c.rarity} className="text-[9px]" />
                <span className="w-24 text-right font-mono text-white/60">
                  {c.error.toFixed(3)} · {pct(c.confidence)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
