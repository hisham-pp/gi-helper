"use client";

import React from "react";
import { AlertTriangle, Plus, X } from "lucide-react";
import { checkSubstats, SUBSTAT_KEYS } from "@/lib/artifact-panel/engine/stats";
import { isPercentStat, STAT_NAMES, type StatKey } from "@/lib/good/types";

type Substat = { key: string; value: number };

interface ArtifactStatsEditorProps {
  substats: Substat[];
  unactivated?: Substat[];
  mainStatKey: string;
  rarity?: number;
  level: number;
  onChange: (substats: Substat[]) => void;
}

/** Short names: the chips are narrow. */
const LABEL: Partial<Record<string, string>> = {
  eleMas: "EM",
  enerRech_: "ER",
};
const label = (key: string) => LABEL[key] ?? STAT_NAMES[key as StatKey] ?? key;

/**
 * An artifact's substats in the scan review: each one's stat and value can
 * be changed or removed, and one added (up to four). Values the game can't
 * roll for the rarity and level are pointed out.
 */
export function ArtifactStatsEditor({ substats, unactivated = [], mainStatKey, rarity, level, onChange }: ArtifactStatsEditorProps) {
  const check = rarity && substats.length > 0 ? checkSubstats(rarity, level, substats) : null;
  const set = (i: number, patch: Partial<Substat>) => onChange(substats.map((s, k) => (k === i ? { ...s, ...patch } : s)));
  const free = SUBSTAT_KEYS.filter((k) => k !== mainStatKey && !substats.some((s) => s.key === k));

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[10px] font-semibold text-white/40">Substats:</span>
      {substats.map((s, i) => (
        <span
          key={i}
          className={`glass-well flex items-center gap-0.5 rounded-full py-0.5 pl-2 pr-1 text-[10px] ${check && !check.possible[i] ? "ring-1 ring-amber-300/60" : ""}`}
        >
          <select
            value={s.key}
            onChange={(e) => set(i, { key: e.target.value })}
            aria-label={`Substat ${i + 1}`}
            className="max-w-[78px] bg-transparent font-semibold text-white outline-none"
          >
            {SUBSTAT_KEYS.filter((k) => k === s.key || (k !== mainStatKey && !substats.some((o) => o.key === k))).map((k) => (
              <option key={k} value={k} className="bg-slate-900">
                {label(k)}
              </option>
            ))}
          </select>
          <span className="text-white/40">+</span>
          <input
            type="number"
            min={0}
            step={isPercentStat(s.key) ? 0.1 : 1}
            value={s.value}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!Number.isNaN(v)) set(i, { value: v });
            }}
            aria-label={`${label(s.key)} value`}
            className="w-10 bg-transparent text-right font-mono font-semibold text-cyan-100 outline-none"
          />
          {isPercentStat(s.key) && <span className="text-white/50">%</span>}
          <button
            onClick={() => onChange(substats.filter((_, k) => k !== i))}
            className="ml-0.5 rounded-full p-0.5 text-white/40 hover:text-rose-300"
            title="Remove this substat"
            aria-label={`Remove ${label(s.key)}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      {unactivated.map((s, i) => (
        <span key={`u${i}`} className="glass-chip px-2 py-0.5 text-[10px] text-white/45" title="Shown in game but not active yet">
          {label(s.key)} +{s.value}
          {isPercentStat(s.key) ? "%" : ""}
        </span>
      ))}
      {substats.length < 4 && free.length > 0 && (
        <button
          onClick={() => onChange([...substats, { key: free[0], value: 0 }])}
          className="glass-chip gap-1 px-2 py-0.5 text-[10px]"
          title="Add a substat"
        >
          <Plus className="h-3 w-3" />
          {substats.length === 0 && <span>Add</span>}
        </button>
      )}
      {check && !check.consistent && (
        <span className="flex items-center gap-1 text-[10px] text-amber-200" title="Each substat is a sum of rolls: these values can't all be right">
          <AlertTriangle className="h-3 w-3" />
          {rarity}★ +{level} can&apos;t roll these
        </span>
      )}
    </div>
  );
}
