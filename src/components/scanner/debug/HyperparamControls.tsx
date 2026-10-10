"use client";

import React from "react";
import { DebugHyperparams } from "@/lib/cv/debug-types";
import { Gauge, RefreshCw, Cpu, CheckCircle } from "lucide-react";

interface HyperparamControlsProps {
  hyperparams: DebugHyperparams;
  onChange: (newParams: DebugHyperparams) => void;
  onReevaluate: () => void;
  enableOCR: boolean;
  onToggleOCR: (enabled: boolean) => void;
  isEvaluating?: boolean;
}

export function HyperparamControls({
  hyperparams,
  onChange,
  onReevaluate,
  enableOCR,
  onToggleOCR,
  isEvaluating,
}: HyperparamControlsProps) {
  const handleUpdate = (field: keyof DebugHyperparams, val: number) => {
    onChange({
      ...hyperparams,
      [field]: val,
    });
  };

  return (
    <div className="relative space-y-4 rounded-3xl border-[0.5px] border-b-white/5 border-l-white/20 border-r-white/5 border-t-white/30 bg-gradient-to-br from-white/10 via-white/5 to-black/30 p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-primary" />
          <span className="text-on-surface text-sm font-bold sm:text-base">
            Algorithm Hyperparameters
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* OCR Toggle */}
          <button
            onClick={() => onToggleOCR(!enableOCR)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
              enableOCR
                ? "border-primary/40 bg-primary/20 text-primary shadow-sm"
                : "text-on-surface/50 border-white/10 bg-white/5"
            }`}
            title="Toggle Tesseract OCR for quantity reading"
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>OCR {enableOCR ? "Enabled" : "Off (Faster)"}</span>
          </button>

          {/* Re-evaluate button */}
          <button
            onClick={onReevaluate}
            disabled={isEvaluating}
            className="text-on-surface flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold shadow-sm transition-all hover:bg-white/20 active:scale-95 disabled:opacity-50"
            title="Recalculate matches and thresholds immediately across all analyzed cells"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-primary ${isEvaluating ? "animate-spin" : ""}`}
            />
            <span>Re-evaluate</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 border-t border-white/10 pt-2 sm:grid-cols-2 lg:grid-cols-4">
        {/* Min Confidence Threshold */}
        <div className="space-y-1.5 rounded-2xl border border-white/5 bg-black/20 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface/80 font-medium">
              Confidence Cutoff
            </span>
            <span className="font-mono font-bold text-primary">
              {hyperparams.minConfidence}%
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={90}
            step={1}
            value={hyperparams.minConfidence}
            onChange={(e) =>
              handleUpdate("minConfidence", parseInt(e.target.value))
            }
            className="h-1.5 w-full cursor-pointer rounded-lg bg-black/40 accent-primary"
          />
          <p className="text-on-surface/50 text-[11px]">
            Matches below this score are rejected as unidentified.
          </p>
        </div>

        {/* Empty Slot StdDev Threshold */}
        <div className="space-y-1.5 rounded-2xl border border-white/5 bg-black/20 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface/80 font-medium">
              Empty Cell StdDev
            </span>
            <span className="font-mono font-bold text-primary">
              {hyperparams.emptyThreshold}
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={40}
            step={1}
            value={hyperparams.emptyThreshold}
            onChange={(e) =>
              handleUpdate("emptyThreshold", parseInt(e.target.value))
            }
            className="h-1.5 w-full cursor-pointer rounded-lg bg-black/40 accent-primary"
          />
          <p className="text-on-surface/50 text-[11px]">
            Contrast variance below this value flags the slot as empty.
          </p>
        </div>

        {/* dHash Weight */}
        <div className="space-y-1.5 rounded-2xl border border-white/5 bg-black/20 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface/80 font-medium">
              Shape Weight (dHash)
            </span>
            <span className="font-mono font-bold text-primary">
              {Math.round(hyperparams.hashWeight * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={Math.round(hyperparams.hashWeight * 100)}
            onChange={(e) =>
              handleUpdate("hashWeight", parseInt(e.target.value) / 100)
            }
            className="h-1.5 w-full cursor-pointer rounded-lg bg-black/40 accent-primary"
          />
          <p className="text-on-surface/50 text-[11px]">
            Structural outline & shape similarity importance.
          </p>
        </div>

        {/* Color Histogram Weight */}
        <div className="space-y-1.5 rounded-2xl border border-white/5 bg-black/20 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface/80 font-medium">
              Color Hist Weight
            </span>
            <span className="font-mono font-bold text-primary">
              {Math.round(hyperparams.colorWeight * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={Math.round(hyperparams.colorWeight * 100)}
            onChange={(e) =>
              handleUpdate("colorWeight", parseInt(e.target.value) / 100)
            }
            className="h-1.5 w-full cursor-pointer rounded-lg bg-black/40 accent-primary"
          />
          <p className="text-on-surface/50 text-[11px]">
            RGB color distribution similarity (separates gem tiers).
          </p>
        </div>
      </div>
    </div>
  );
}
