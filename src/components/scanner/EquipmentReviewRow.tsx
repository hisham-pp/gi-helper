"use client";

import React, { memo } from "react";
import { AlertTriangle, ArrowRight, Lock, LockOpen, Pencil, Trash2 } from "lucide-react";
import { GameIcon } from "@/components/ui/GameIcon";
import { mainStatValue } from "@/lib/artifact-panel/engine/stats";
import { characterAvatarUrl } from "@/lib/characters";
import { artifactIconUrl, describeCharacter, weaponIconUrl } from "@/lib/good/catalog";
import { isPercentStat, MAIN_STATS_BY_SLOT, STAT_NAMES, type SlotKey, type StatKey } from "@/lib/good/types";
import { getRarityStyles } from "@/lib/material-ui";
import { splitArtifactItem } from "@/lib/scan-equipment";
import type { EquipmentReviewItem, ReviewCandidate } from "@/lib/types";
import { ArtifactStatsEditor } from "./ArtifactStatsEditor";
import { artifactPieceDetail, isTraveler, TRAVELER_ELEMENTS } from "./equipment-review";

interface EquipmentReviewRowProps {
  item: EquipmentReviewItem;
  onEdit: (rowId: string) => void;
  onSelect: (rowId: string, candidate: ReviewCandidate) => void;
  onChange: (rowId: string, patch: Partial<EquipmentReviewItem>) => void;
  onRemove: (rowId: string) => void;
}

const MAX_LEVEL = { weapon: 90, artifact: 20, character: 100 } as const;

/** One weapon or artifact of the scan review. Memoized: editing one row re-renders only that row. */
export const EquipmentReviewRow = memo(function EquipmentReviewRow({
  item,
  onEdit,
  onSelect,
  onChange,
  onRemove,
}: EquipmentReviewRowProps) {
  const styles = getRarityStyles(item.rarity || 1);
  const slot: SlotKey | null = item.kind === "artifact" && item.item ? splitArtifactItem(item.item).slot : null;
  const icon = !item.item
    ? null
    : item.kind === "weapon"
      ? weaponIconUrl(item.item)
      : item.kind === "character"
        ? characterAvatarUrl(item.item)
        : artifactIconUrl(splitArtifactItem(item.item).setId, slot!);
  // Alternatives the scanner gave no chance (0%) are noise next to a clear match
  const suggestions = item.candidates?.filter((c) => c.id !== item.item && c.confidence > 0).slice(0, 3) ?? [];
  const mainStats = slot ? MAIN_STATS_BY_SLOT[slot] : [];
  // GOOD keeps only the key: the value follows from rarity and level.
  const mainValue = slot && item.mainStatKey && item.rarity ? mainStatValue(item.rarity, item.mainStatKey, item.level) : null;

  return (
    <div
      style={{ "--glass-accent": styles.accent } as React.CSSProperties}
      className="glass-card flex flex-col items-start justify-between gap-3 p-3 sm:flex-row sm:items-center sm:p-4"
    >
      <div className="flex w-full items-center gap-3 sm:w-auto">
        <div className="glass-well relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl">
          {item.imageSnippet ? (
            <img src={item.imageSnippet} alt="Card from the screenshot" decoding="async" className="h-full w-full object-contain" />
          ) : (
            <span className="text-[10px] text-white/40">No Crop</span>
          )}
        </div>
        <span className="block max-w-[110px] truncate text-left text-[11px] text-white/55 sm:hidden">{item.sourceImageName}</span>
      </div>

      <div className="hidden text-white/30 sm:flex">
        <ArrowRight className="h-4 w-4" />
      </div>

      <div className="flex w-full flex-1 flex-col gap-1.5 sm:w-auto">
        <div className="flex items-center gap-3">
          <div className="glass-well glass-well--tinted flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl">
            <GameIcon
              src={icon}
              alt={item.name}
              size={48}
              className="h-12 w-12"
              fallback={<span className="text-[10px] text-white/40">?</span>}
            />
          </div>
          <div className="min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-white drop-shadow-sm">{item.name}</span>
              <button
                onClick={() => onEdit(item.id)}
                className="glass-chip gap-1 px-2.5 py-0.5 text-[11px] font-medium"
                title={`Choose another ${item.kind === "artifact" ? "piece" : item.kind}`}
              >
                <Pencil className="h-3 w-3" />
                <span>Change</span>
              </button>
              {item.reviewReason && (
                <span className="glass-chip gap-1 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-200">
                  <AlertTriangle className="h-3 w-3" />
                  {item.reviewReason}
                </span>
              )}
            </div>
            <span className="block text-[11px] text-white/55">
              {item.rarity ? <span className={`font-bold ${styles.starColor}`}>{item.rarity}★</span> : null}
              {item.kind === "artifact" && item.item ? ` · ${artifactPieceDetail(item.item)}` : ""}
              {item.location ? ` · on ${describeCharacter(item.location).name}` : ""}
            </span>
          </div>
        </div>
        {suggestions.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-semibold text-white/40">Suggestions:</span>
            {suggestions.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelect(item.id, c)}
                className="glass-chip gap-1.5 px-2.5 py-0.5 text-[10px]"
                title={`Switch to ${c.name} (${c.confidence}%)`}
              >
                <span className="max-w-[130px] truncate">{c.name}</span>
                <span className="font-mono text-[9px] font-semibold text-cyan-300">{c.confidence}%</span>
              </button>
            ))}
          </div>
        )}
        {item.kind === "artifact" && item.item && (
          <ArtifactStatsEditor
            substats={item.substats ?? []}
            unactivated={item.unactivatedSubstats}
            mainStatKey={item.mainStatKey}
            rarity={item.rarity}
            level={item.level}
            onChange={(substats) => onChange(item.id, { substats })}
          />
        )}
      </div>

      <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
        <label className="glass-well flex items-center gap-1 rounded-full px-3 py-1 text-[11px] text-white/60">
          {item.kind === "artifact" ? "+" : "Lv."}
          <input
            type="number"
            min={item.kind === "artifact" ? 0 : 1}
            max={MAX_LEVEL[item.kind]}
            value={item.level}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!Number.isNaN(v)) onChange(item.id, { level: Math.min(MAX_LEVEL[item.kind], Math.max(0, v)) });
            }}
            aria-label="Level"
            className="w-9 bg-transparent text-center text-sm font-bold text-cyan-100 outline-none"
          />
        </label>
        {item.kind === "weapon" && (
          <select
            value={item.refinement}
            onChange={(e) => onChange(item.id, { refinement: Number(e.target.value) })}
            aria-label="Refinement"
            className="glass-well rounded-full px-3 py-1.5 text-[11px] font-bold text-white outline-none"
          >
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r} className="bg-slate-900">
                R{r}
              </option>
            ))}
          </select>
        )}
        {item.kind === "character" && isTraveler(item.item) && (
          <select
            value={item.element ?? "Anemo"}
            onChange={(e) => onChange(item.id, { element: e.target.value })}
            aria-label="Traveler's element"
            title="GOOD keeps one Traveler per element: choose the one you play"
            className="glass-well rounded-full px-3 py-1.5 text-[11px] font-bold text-white outline-none"
          >
            {TRAVELER_ELEMENTS.map((el) => (
              <option key={el} value={el} className="bg-slate-900">
                {el}
              </option>
            ))}
          </select>
        )}
        {mainStats.length === 1 && item.mainStatKey && (
          <span className="glass-well rounded-full px-3 py-1.5 text-[11px] font-bold text-white">
            {STAT_NAMES[item.mainStatKey as StatKey]}
            {mainValue !== null ? ` ${mainValue.toLocaleString("en-US")}` : ""}
          </span>
        )}
        {mainStats.length > 1 && (
          <select
            value={item.mainStatKey}
            onChange={(e) => onChange(item.id, { mainStatKey: e.target.value })}
            aria-label="Main stat"
            className={`glass-well max-w-[150px] rounded-full px-3 py-1.5 text-[11px] font-bold outline-none ${item.mainStatKey ? "text-white" : "text-amber-200"}`}
          >
            <option value="" className="bg-slate-900">
              Main stat?
            </option>
            {mainStats.map((k) => (
              <option key={k} value={k} className="bg-slate-900">
                {STAT_NAMES[k]}
                {item.rarity && mainStatValue(item.rarity, k, item.level) !== null
                  ? ` ${mainStatValue(item.rarity, k, item.level)}${isPercentStat(k) ? "%" : ""}`
                  : ""}
              </option>
            ))}
          </select>
        )}
        {item.kind !== "character" && (
          <button
            onClick={() => onChange(item.id, { locked: !item.locked })}
            aria-pressed={item.locked}
            className="glass-icon-btn h-9 w-9 rounded-xl"
            title={item.locked ? "Locked (click to unlock)" : "Not locked (click to lock)"}
          >
            {item.locked ? <Lock className="h-4 w-4 text-rose-300" /> : <LockOpen className="h-4 w-4 text-white/40" />}
          </button>
        )}
        <button
          onClick={() => onRemove(item.id)}
          className="glass-icon-btn h-9 w-9 rounded-xl text-white/50 hover:bg-rose-500/20 hover:text-rose-300"
          title="Leave this out"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});
