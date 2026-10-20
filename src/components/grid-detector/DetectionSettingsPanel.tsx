"use client";

import React from "react";
import { RefreshCw, RotateCcw, Scan, SlidersHorizontal, X } from "lucide-react";
import type { DetectionSettings } from "@gi/grid-detector";

interface DetectionSettingsPanelProps {
  settings: DetectionSettings;
  onChange: (patch: Partial<DetectionSettings>) => void;
  onResetDefaults: () => void;
  onRerun: () => void;
  onSelectRegion: () => void;
  busy: boolean;
  /** Settings differ from the ones used for the displayed result. */
  dirty: boolean;
}

function Slider({
  label,
  hint,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block" title={hint}>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-white/80">{label}</span>
        <span className="font-mono text-white/60">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-primary"
      />
    </label>
  );
}

const pct = (v: number) => `${Math.round(v * 100)}%`;

export function DetectionSettingsPanel({
  settings,
  onChange,
  onResetDefaults,
  onRerun,
  onSelectRegion,
  busy,
  dirty,
}: DetectionSettingsPanelProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-white/70">
          Detection Settings
        </span>
        <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
      </div>

      <div className="space-y-3">
        <Slider
          label="Sensitivity"
          hint="Higher finds faint card borders but considers more false candidates."
          value={settings.sensitivity}
          min={0}
          max={1}
          step={0.05}
          format={pct}
          onChange={(v) => onChange({ sensitivity: v })}
        />
        <Slider
          label="Minimum confidence"
          hint="Cards below this confidence are dropped."
          value={settings.minConfidence}
          min={0}
          max={0.95}
          step={0.05}
          format={pct}
          onChange={(v) => onChange({ minConfidence: v })}
        />
        <Slider
          label="Minimum card size"
          hint="Smallest card side, in original pixels."
          value={settings.minCardSize}
          min={8}
          max={240}
          step={4}
          format={(v) => `${v}px`}
          onChange={(v) => onChange({ minCardSize: v })}
        />

        <label className="flex items-center justify-between text-[11px] text-white/80">
          <span title="Fill gaps in a grid whose borders are faint but consistent with the grid.">
            Recover missed cards
          </span>
          <input
            type="checkbox"
            checked={settings.recoverMissedCards}
            onChange={(e) => onChange({ recoverMissedCards: e.target.checked })}
            className="h-4 w-4 accent-primary"
          />
        </label>

        <details className="group">
          <summary className="cursor-pointer list-none text-[11px] font-bold text-white/50 hover:text-white/80">
            Advanced
          </summary>
          <div className="mt-2 space-y-3">
            <Slider
              label="Card size variation"
              hint="How much card sizes may differ within one grid."
              value={settings.sizeTolerance}
              min={0.04}
              max={0.3}
              step={0.01}
              format={(v) => `±${Math.round(v * 100)}%`}
              onChange={(v) => onChange({ sizeTolerance: v })}
            />
            <Slider
              label="Alignment tolerance"
              hint="Allowed misalignment from the grid, as a share of the card spacing."
              value={settings.alignmentTolerance}
              min={0.03}
              max={0.2}
              step={0.01}
              format={pct}
              onChange={(v) => onChange({ alignmentTolerance: v })}
            />
            <div className="grid grid-cols-2 gap-2 text-[11px] text-white/80">
              <label title="Narrowest accepted card (width ÷ height)">
                Min aspect
                <input
                  type="number"
                  step={0.05}
                  min={0.1}
                  max={10}
                  value={settings.minAspectRatio}
                  onChange={(e) => onChange({ minAspectRatio: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1 font-mono text-white"
                />
              </label>
              <label title="Widest accepted card (width ÷ height)">
                Max aspect
                <input
                  type="number"
                  step={0.05}
                  min={0.1}
                  max={10}
                  value={settings.maxAspectRatio}
                  onChange={(e) => onChange({ maxAspectRatio: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1 font-mono text-white"
                />
              </label>
            </div>
            <label className="flex items-center justify-between text-[11px] text-white/80">
              <span title="Keep cards cut off by the image edge or a scroll viewport.">
                Include cut-off cards
              </span>
              <input
                type="checkbox"
                checked={settings.includeClippedCards}
                onChange={(e) => onChange({ includeClippedCards: e.target.checked })}
                className="h-4 w-4 accent-primary"
              />
            </label>
          </div>
        </details>

        <div className="flex items-center justify-between rounded-xl bg-white/5 px-2.5 py-2 text-[11px]">
          <span className="text-white/70">
            Region:{" "}
            <span className="font-mono text-white/90">
              {settings.region
                ? `${settings.region.width}×${settings.region.height} @ ${settings.region.x},${settings.region.y}`
                : "whole image"}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <button
              type="button"
              onClick={onSelectRegion}
              className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 font-semibold text-white hover:bg-white/20"
              title="Drag on the image to limit detection to a region"
            >
              <Scan className="h-3 w-3 text-cyan-400" />
              Select
            </button>
            {settings.region && (
              <button
                type="button"
                onClick={() => onChange({ region: null })}
                className="rounded-lg bg-white/10 p-1 text-white hover:bg-white/20"
                aria-label="Clear region"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        </div>
      </div>

      <div className="mt-4 flex gap-2 border-t border-white/10 pt-3">
        <button
          type="button"
          onClick={onRerun}
          disabled={busy}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition-all disabled:opacity-50 ${
            dirty
              ? "border-primary/60 bg-primary/30 text-primary"
              : "border-white/20 bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} />
          Re-run detection
        </button>
        <button
          type="button"
          onClick={onResetDefaults}
          className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white/80 hover:bg-white/10"
          title="Restore default settings"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Defaults
        </button>
      </div>
    </div>
  );
}
