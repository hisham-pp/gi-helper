"use client";

import React, { useState, useMemo } from "react";
import { CellDebugData, DebugHyperparams } from "@/lib/cv/debug-types";
import { BitmapPreview } from "./BitmapPreview";
import { createBinarizedQuantityDataUrl } from "@/lib/cv/debug-runner";
import {
  Sparkles,
  Copy,
  Check,
  Cpu,
  Layers,
  BarChart3,
  Hash,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import Tesseract from "tesseract.js";

interface CellInspectorProps {
  cellData: CellDebugData | null;
  hyperparams: DebugHyperparams;
  ocrWorker: Tesseract.Worker | null;
  onRunCellAnalysis: (row: number, col: number) => void;
  isAnalyzing?: boolean;
}

export function CellInspector({
  cellData,
  hyperparams,
  ocrWorker,
  onRunCellAnalysis,
  isAnalyzing,
}: CellInspectorProps) {
  const [copiedHash, setCopiedHash] = useState(false);
  const [pixelatedIcon, setPixelatedIcon] = useState(false);
  const [binarizeThreshold, setBinarizeThreshold] = useState(140);

  // Generate binarized quantity preview
  const binarizedQtyUrl = useMemo(() => {
    if (!cellData?.slice.quantityBitmap) return "";
    return createBinarizedQuantityDataUrl(
      cellData.slice.quantityBitmap,
      binarizeThreshold,
    );
  }, [cellData?.slice.quantityBitmap, binarizeThreshold]);

  if (!cellData) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2 rounded-3xl border border-white/10 bg-black/20 p-12 text-center backdrop-blur-xl">
        <Layers className="text-on-surface/40 h-8 w-8" />
        <p className="text-on-surface/80 font-bold">No Cell Selected</p>
        <p className="text-on-surface/50 max-w-xs text-xs">
          Click any cell in the Interactive Grid Overlay to inspect its visual
          slices, dHash, color histogram, and matcher ranking.
        </p>
      </div>
    );
  }

  const {
    slice,
    stats,
    rarity,
    fingerprint,
    topCandidates,
    matched,
    ocr,
    timings,
  } = cellData;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(fingerprint.dHash);
    setCopiedHash(true);
    toast.success("dHash copied to clipboard!");
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="relative space-y-6 rounded-3xl border-[0.5px] border-b-white/5 border-l-white/20 border-r-white/5 border-t-white/30 bg-gradient-to-br from-white/10 via-white/5 to-black/30 p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-on-surface text-lg font-extrabold">
              Cell [{slice.row}, {slice.col}]
            </span>
            <span className="text-on-surface/70 rounded-full bg-white/10 px-2 py-0.5 font-mono text-xs">
              #{slice.index} • x:{slice.cellRect.x} y:{slice.cellRect.y} (
              {slice.cellRect.width}×{slice.cellRect.height}px)
            </span>
          </div>

          <div className="mt-1 flex items-center gap-2">
            {stats.isEmpty ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-500/30 bg-slate-500/20 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                <XCircle className="h-3 w-3" /> Empty Slot
              </span>
            ) : matched ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                <CheckCircle2 className="h-3 w-3" /> Matched: {matched.name} (
                {matched.confidence}%)
                {ocr && (
                  <span className="ml-1 border-l border-emerald-500/40 pl-1.5 font-mono text-emerald-200">
                    x{ocr.quantity}
                  </span>
                )}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                <AlertTriangle className="h-3 w-3" /> Low Confidence (&lt;
                {hyperparams.minConfidence}%)
                {ocr && (
                  <span className="ml-1 border-l border-amber-500/40 pl-1.5 font-mono text-amber-200">
                    x{ocr.quantity}
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Re-analyze cell button */}
        <button
          onClick={() => onRunCellAnalysis(slice.row, slice.col)}
          disabled={isAnalyzing}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isAnalyzing ? "animate-spin" : ""}`}
          />
          <span>Analyze This Cell</span>
        </button>
      </div>

      {/* Slices Visualization Section */}
      <div className="space-y-3">
        <div className="text-on-surface flex items-center justify-between text-xs font-bold">
          <span className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-primary" /> Visual Slices & Crops
          </span>
          <button
            onClick={() => setPixelatedIcon(!pixelatedIcon)}
            className="text-[11px] text-primary hover:underline"
          >
            {pixelatedIcon ? "Smooth Preview" : "Pixelated Zoom"}
          </button>
        </div>

        {/* Row 1: Scanned vs Matched comparison */}
        <div className="grid grid-cols-[auto_auto_1fr] items-center gap-4 rounded-2xl border border-white/10 bg-black/30 p-3">
          {/* Scanned cell */}
          <div className="flex flex-col items-center">
            <span className="text-on-surface/60 mb-1.5 text-[10px] font-semibold uppercase tracking-wide">
              Scanned
            </span>
            <div className="flex h-28 w-24 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-inner">
              <BitmapPreview
                bitmap={slice.cellBitmap}
                pixelated={pixelatedIcon}
                alt="Full Cell Crop"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <span className="text-on-surface/40 mt-1 font-mono text-[10px]">
              {slice.cellRect.width}×{slice.cellRect.height}
            </span>
          </div>

          {/* Arrow + matched image */}
          <div className="flex items-center gap-3">
            <span className="text-lg text-white/20">→</span>
            <div className="flex flex-col items-center">
              <span className="text-on-surface/60 mb-1.5 text-[10px] font-semibold uppercase tracking-wide">
                {stats.isEmpty ? "Empty" : matched ? "Result" : "No Match"}
              </span>
              <div
                className={`flex h-28 w-24 items-center justify-center overflow-hidden rounded-xl border shadow-inner ${
                  matched
                    ? "border-emerald-500/40 bg-white/5"
                    : "border-white/10 bg-white/5"
                }`}
              >
                {matched ? (
                  <img
                    src={`/images/materials/${matched.id}.png`}
                    alt={matched.name}
                    className="max-h-full max-w-full object-contain p-2"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span className="text-on-surface/30 text-[10px]">—</span>
                )}
              </div>
              <span className="text-on-surface/40 mt-1 font-mono text-[10px]">
                {matched ? `${matched.confidence}% conf` : "—"}
              </span>
            </div>
          </div>

          {/* Match details */}
          <div className="flex min-w-0 flex-col gap-1.5 pl-1">
            {stats.isEmpty ? (
              <span className="text-sm text-slate-400">Empty slot</span>
            ) : matched ? (
              <>
                <span
                  className="text-on-surface text-sm font-bold leading-tight"
                  title={matched.name}
                >
                  {matched.name}
                </span>
                <span className="font-mono text-[11px] text-emerald-400">
                  {matched.confidence}% confidence
                </span>
                {ocr && (
                  <span className="font-mono text-[11px] text-primary">
                    Qty: x{ocr.quantity}
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-amber-400">
                No match above {hyperparams.minConfidence}% threshold
              </span>
            )}
          </div>
        </div>

        {/* Row 2: Image part breakdown */}
        <div className="grid grid-cols-3 gap-3">
          {/* Icon Crop Slice */}
          <div className="flex flex-col items-center rounded-2xl border border-blue-500/20 bg-black/30 p-2.5">
            <span className="mb-2 text-[11px] font-semibold text-blue-300">
              Icon Crop (Blue)
            </span>
            <div className="flex h-28 w-24 items-center justify-center overflow-hidden rounded-xl border border-blue-500/30 bg-black/40 shadow-inner">
              <BitmapPreview
                bitmap={slice.iconBitmap}
                pixelated={pixelatedIcon}
                alt="Icon Crop"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <span className="text-on-surface/50 mt-1 font-mono text-[10px]">
              {slice.iconRect.width}×{slice.iconRect.height}
            </span>
          </div>

          {/* Star Crop Slice */}
          <div className="flex flex-col items-center rounded-2xl border border-amber-500/20 bg-black/30 p-2.5">
            <span className="mb-2 text-[11px] font-semibold text-amber-300">
              Star Crop (Gold)
            </span>
            <div className="flex h-28 w-24 items-center justify-center overflow-hidden rounded-xl border border-amber-500/30 bg-black/40 p-1 shadow-inner">
              {slice.starBitmap ? (
                <BitmapPreview
                  bitmap={slice.starBitmap}
                  pixelated={pixelatedIcon}
                  alt="Star Crop"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-on-surface/40 text-[10px]">N/A</span>
              )}
            </div>
            <span className="text-on-surface/50 mt-1 font-mono text-[10px]">
              {slice.starRect
                ? `${slice.starRect.width}×${slice.starRect.height}`
                : ""}
            </span>
          </div>

          {/* Number Crop Slice */}
          <div className="flex flex-col items-center rounded-2xl border border-green-500/20 bg-black/30 p-2.5">
            <span className="mb-2 text-[11px] font-semibold text-green-300">
              Number Strip (Green)
            </span>
            <div className="flex h-28 w-24 flex-col items-center justify-around overflow-hidden rounded-xl border border-green-500/30 bg-black/40 p-1 shadow-inner">
              {/* Raw + OCR result side by side */}
              <div className="flex w-full items-center gap-1 rounded bg-black/60 p-0.5">
                <BitmapPreview
                  bitmap={slice.quantityBitmap}
                  alt="Raw Quantity Strip"
                  className="min-w-0 flex-1 object-contain"
                />
                {ocr && (
                  <span className="shrink-0 font-mono text-[10px] font-bold text-green-400">
                    ={ocr.quantity}
                  </span>
                )}
              </div>
              {/* Binarized */}
              {binarizedQtyUrl && (
                <div className="flex w-full items-center justify-center rounded border border-white/10 bg-black/90 p-0.5">
                  <img
                    src={binarizedQtyUrl}
                    alt="Binarized Quantity"
                    className="h-4 max-w-full object-contain"
                  />
                </div>
              )}
            </div>
            <span className="text-on-surface/50 mt-1 font-mono text-[10px]">
              {slice.quantityRect.width}×{slice.quantityRect.height}
            </span>
          </div>
        </div>
      </div>

      {/* Empty Slot Diagnosis */}
      <div className="space-y-2.5 rounded-2xl border border-white/10 bg-black/30 p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-on-surface flex items-center gap-1.5 font-bold">
            <BarChart3 className="h-3.5 w-3.5 text-primary" /> Empty Slot
            Detection Contrast
          </span>
          <span className="font-mono text-xs">
            StdDev:{" "}
            <strong
              className={stats.isEmpty ? "text-slate-400" : "text-emerald-400"}
            >
              {stats.stddev}
            </strong>{" "}
            (Threshold: {hyperparams.emptyThreshold})
          </span>
        </div>

        {/* StdDev Progress Bar */}
        <div className="relative h-3 w-full overflow-hidden rounded-full border border-white/10 bg-black/60">
          {/* Threshold mark line */}
          <div
            className="absolute bottom-0 top-0 z-10 w-0.5 bg-red-400 shadow"
            style={{
              left: `${Math.min(100, (hyperparams.emptyThreshold / 50) * 100)}%`,
            }}
            title={`Threshold: ${hyperparams.emptyThreshold}`}
          />
          {/* Active bar */}
          <div
            className={`h-full transition-all duration-500 ${
              stats.isEmpty ? "bg-slate-500" : "bg-emerald-500"
            }`}
            style={{ width: `${Math.min(100, (stats.stddev / 50) * 100)}%` }}
          />
        </div>

        <div className="text-on-surface/60 flex items-center justify-between text-[11px]">
          <span>0 (Flat gray/dark)</span>
          <span>Mean Brightness: {stats.mean}</span>
          <span>50+ (High detail icon)</span>
        </div>
      </div>

      {/* Rarity & Star Detection Diagnosis */}
      {!stats.isEmpty && rarity && (
        <div className="space-y-3 rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface flex items-center gap-1.5 font-bold">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{" "}
              Detected Rarity &amp; Star Analysis
            </span>
            <span className="text-on-surface/80 rounded-full bg-white/10 px-2 py-0.5 font-mono text-xs">
              {rarity.method} ({rarity.confidence}% conf)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-black/40 p-3 text-center">
              <span className="text-on-surface/60 mb-1 text-[10px]">
                Detected Stars
              </span>
              <div className="flex items-center gap-0.5 text-sm font-bold text-amber-400">
                {rarity.starsCount > 0 ? (
                  Array.from({ length: rarity.starsCount }).map((_, i) => (
                    <span key={i}>★</span>
                  ))
                ) : (
                  <span className="text-on-surface/40 text-xs">0 Stars</span>
                )}
              </div>
              <span className="text-on-surface/50 mt-1 font-mono text-[10px]">
                {rarity.starsCount} Star{rarity.starsCount === 1 ? "" : "s"}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-black/40 p-3 text-center">
              <span className="text-on-surface/60 mb-1 text-[10px]">
                Background Gradient
              </span>
              <span className="font-mono text-xs font-bold">
                {rarity.bgRarity === 5 ? (
                  <span className="text-amber-400">5★ (Gold/Amber)</span>
                ) : rarity.bgRarity === 4 ? (
                  <span className="text-purple-400">4★ (Royal Purple)</span>
                ) : rarity.bgRarity === 3 ? (
                  <span className="text-blue-400">3★ (Sky Blue)</span>
                ) : rarity.bgRarity === 2 ? (
                  <span className="text-emerald-400">2★ (Emerald Green)</span>
                ) : rarity.bgRarity === 1 ? (
                  <span className="text-slate-400">1★ (Slate Gray)</span>
                ) : (
                  <span className="text-on-surface/40">Indeterminate</span>
                )}
              </span>
              <span className="text-on-surface/50 mt-1 text-[10px]">
                Upper arch HSV
              </span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-black/40 p-3 text-center">
              <span className="text-on-surface/60 mb-1 text-[10px]">
                Matcher Consensus
              </span>
              <span className="font-mono text-sm font-extrabold text-primary">
                {rarity.rarity ? `${rarity.rarity}★ Tier` : "Unknown"}
              </span>
              <span className="mt-1 text-[10px] font-semibold text-emerald-400">
                Weighted Scoring Active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Perceptual dHash & Color Histogram */}
      {!stats.isEmpty && (
        <div className="space-y-4">
          {/* dHash */}
          <div className="space-y-3 rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="flex items-center justify-between">
              <span className="text-on-surface flex items-center gap-1.5 text-xs font-bold">
                <Hash className="h-3.5 w-3.5 text-primary" /> 256-Bit Difference
                Hash (dHash)
              </span>
              <button
                onClick={handleCopyHash}
                className="flex items-center gap-1 font-mono text-[11px] text-primary hover:underline"
              >
                {copiedHash ? (
                  <Check className="h-3 w-3 text-success" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                Copy Hex
              </button>
            </div>

            <div className="select-all break-all rounded-xl border border-white/10 bg-black/60 p-2.5 font-mono text-[11px] text-primary">
              {fingerprint.dHash}
            </div>

            {/* 16x16 Bit Heatmap Grid */}
            <div className="space-y-1.5">
              <span className="text-on-surface/60 block text-[10px] font-semibold">
                Visual Structural Bit-Matrix (16×16 gradients)
              </span>
              <div className="grid-cols-16 mx-auto grid w-fit gap-[2px] rounded-xl border border-white/10 bg-black/70 p-2">
                {fingerprint.bitString.split("").map((bit, idx) => (
                  <div
                    key={idx}
                    className={`h-2 w-2 rounded-[1px] transition-colors ${
                      bit === "1"
                        ? "bg-primary shadow-[0_0_4px_rgba(var(--md-sys-color-primary),0.8)]"
                        : "bg-white/10"
                    }`}
                    title={`Bit ${idx}: ${bit}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Color Histogram */}
          <div className="space-y-3 rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-on-surface flex items-center gap-1.5 font-bold">
                <BarChart3 className="h-3.5 w-3.5 text-primary" /> Normalized
                RGB Color Histogram (8 bins/channel)
              </span>
            </div>

            {/* RGB Bars */}
            <div className="space-y-2">
              {/* Red */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-red-400">
                  Red Channel
                </span>
                <div className="grid h-8 grid-cols-8 gap-1 rounded-lg border border-red-500/20 bg-black/50 p-1">
                  {fingerprint.colorHist.slice(0, 8).map((val, i) => (
                    <div key={i} className="flex h-full flex-col justify-end">
                      <div
                        className="w-full rounded-t-[1px] bg-red-500"
                        style={{ height: `${Math.round(val * 100)}%` }}
                        title={`R Bin ${i}: ${(val * 100).toFixed(1)}%`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Green */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-green-400">
                  Green Channel
                </span>
                <div className="grid h-8 grid-cols-8 gap-1 rounded-lg border border-green-500/20 bg-black/50 p-1">
                  {fingerprint.colorHist.slice(8, 16).map((val, i) => (
                    <div key={i} className="flex h-full flex-col justify-end">
                      <div
                        className="w-full rounded-t-[1px] bg-green-500"
                        style={{ height: `${Math.round(val * 100)}%` }}
                        title={`G Bin ${i}: ${(val * 100).toFixed(1)}%`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Blue */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-blue-400">
                  Blue Channel
                </span>
                <div className="grid h-8 grid-cols-8 gap-1 rounded-lg border border-blue-500/20 bg-black/50 p-1">
                  {fingerprint.colorHist.slice(16, 24).map((val, i) => (
                    <div key={i} className="flex h-full flex-col justify-end">
                      <div
                        className="w-full rounded-t-[1px] bg-blue-500"
                        style={{ height: `${Math.round(val * 100)}%` }}
                        title={`B Bin ${i}: ${(val * 100).toFixed(1)}%`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top 5 Candidates Comparison Table */}
          <div className="space-y-3 rounded-2xl border border-white/10 bg-black/30 p-4">
            <span className="text-on-surface flex items-center gap-1.5 text-xs font-bold">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Top 5 Matching
              Candidates in Database
            </span>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-on-surface/60 border-b border-white/10 text-[11px]">
                    <th className="pb-2 font-medium">Rank</th>
                    <th className="pb-2 font-medium">Candidate</th>
                    <th className="pb-2 font-medium">Tier</th>
                    <th className="pb-2 font-medium">Total Score</th>
                    <th className="pb-2 font-medium">Shape Sim (dHash)</th>
                    <th className="pb-2 font-medium">Color Sim</th>
                    <th className="pb-2 font-medium">Distance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {topCandidates.map((c, idx) => {
                    const isWinner =
                      idx === 0 && c.confidence >= hyperparams.minConfidence;
                    return (
                      <tr
                        key={c.id}
                        className={`transition-colors ${
                          isWinner
                            ? "bg-emerald-500/10 font-medium"
                            : "hover:bg-white/5"
                        }`}
                      >
                        <td className="py-2.5 pl-1 font-mono">
                          {idx === 0
                            ? "🥇"
                            : idx === 1
                              ? "🥈"
                              : idx === 2
                                ? "🥉"
                                : `#${idx + 1}`}
                        </td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded border border-white/10 bg-black/40 p-0.5">
                              <img
                                src={`/images/materials/${c.id}.png`}
                                alt={c.name}
                                className="h-6 w-6 object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            </div>
                            <span
                              className="text-on-surface line-clamp-1"
                              title={c.name}
                            >
                              {c.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            <span className="font-bold text-amber-400">
                              {c.rarity ? `${c.rarity}★` : "-"}
                            </span>
                            {c.rarityMatch === true && (
                              <span className="rounded border border-emerald-500/30 bg-emerald-500/20 px-1.5 py-0.5 text-[9px] text-emerald-300">
                                Match
                              </span>
                            )}
                            {c.rarityMatch === false && (
                              <span className="rounded border border-red-500/30 bg-red-500/20 px-1.5 py-0.5 text-[9px] text-red-300">
                                Penalty
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 font-mono font-bold">
                          <span
                            className={
                              c.confidence >= 75
                                ? "text-emerald-400"
                                : c.confidence >= 55
                                  ? "text-amber-400"
                                  : "text-red-400"
                            }
                          >
                            {c.confidence}%
                          </span>
                        </td>
                        <td className="text-on-surface/80 py-2.5 font-mono">
                          {c.hashSim}%
                        </td>
                        <td className="text-on-surface/80 py-2.5 font-mono">
                          {c.colorSim}%
                        </td>
                        <td className="text-on-surface/60 py-2.5 font-mono">
                          {c.hammingDist} / 256
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* OCR Result Details */}
          {ocr && (
            <div className="space-y-2 rounded-2xl border border-white/10 bg-black/30 p-4">
              <span className="text-on-surface flex items-center gap-1.5 text-xs font-bold">
                <Cpu className="h-3.5 w-3.5 text-primary" /> Tesseract Quantity
                OCR Result
              </span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-xl border border-white/5 bg-black/40 p-2">
                  <span className="text-on-surface/60 block text-[10px]">
                    Raw Recognized Text
                  </span>
                  <span className="text-on-surface font-mono font-bold">
                    "{ocr.rawText || "(empty)"}"
                  </span>
                </div>
                <div className="rounded-xl border border-white/5 bg-black/40 p-2">
                  <span className="text-on-surface/60 block text-[10px]">
                    Parsed Quantity
                  </span>
                  <span className="font-mono text-sm font-bold text-primary">
                    x{ocr.quantity}
                  </span>
                </div>
                <div className="rounded-xl border border-white/5 bg-black/40 p-2">
                  <span className="text-on-surface/60 block text-[10px]">
                    Execution Time
                  </span>
                  <span className="text-on-surface font-mono">
                    {ocr.elapsedMs} ms
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
