"use client";

import React, { useState, useMemo } from "react";
import { CellDebugData, ScanBenchmark } from "@/lib/cv/debug-types";
import { GridConfig } from "@/lib/cv/grid-detector";
import { BitmapPreview } from "./BitmapPreview";
import {
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
} from "lucide-react";

interface GridMatrixViewProps {
  gridConfig: GridConfig;
  analyzedCells: Map<string, CellDebugData>;
  selectedCellKey: string | null;
  onSelectCell: (row: number, col: number) => void;
  benchmark: ScanBenchmark | null;
}

type FilterType = "all" | "matched" | "borderline" | "unmatched" | "empty";

export function GridMatrixView({
  gridConfig,
  analyzedCells,
  selectedCellKey,
  onSelectCell,
  benchmark,
}: GridMatrixViewProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Collect all cells
  const allCells = useMemo(() => {
    const list: {
      key: string;
      row: number;
      col: number;
      data?: CellDebugData;
    }[] = [];
    for (let r = 0; r < gridConfig.rows; r++) {
      for (let c = 0; c < gridConfig.columns; c++) {
        const key = `${r}-${c}`;
        list.push({
          key,
          row: r,
          col: c,
          data: analyzedCells.get(key),
        });
      }
    }
    return list;
  }, [gridConfig, analyzedCells]);

  // Counts
  const counts = useMemo(() => {
    let matched = 0;
    let borderline = 0;
    let unmatched = 0;
    let empty = 0;

    for (const item of allCells) {
      if (!item.data) continue;
      if (item.data.stats.isEmpty) {
        empty++;
      } else if (item.data.matched) {
        if (item.data.matched.confidence >= 75) matched++;
        else borderline++;
      } else {
        unmatched++;
      }
    }

    return { matched, borderline, unmatched, empty, total: allCells.length };
  }, [allCells]);

  // Filtered cells
  const filteredCells = useMemo(() => {
    return allCells.filter(({ data }) => {
      if (!data) return filter === "all";

      // Filter category
      let matchesCat = true;
      if (filter === "matched")
        matchesCat = !!data.matched && data.matched.confidence >= 75;
      else if (filter === "borderline")
        matchesCat = !!data.matched && data.matched.confidence < 75;
      else if (filter === "unmatched")
        matchesCat = !data.stats.isEmpty && !data.matched;
      else if (filter === "empty") matchesCat = data.stats.isEmpty;

      if (!matchesCat) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (data.matched?.name.toLowerCase().includes(q)) return true;
        if (data.matched?.id.toLowerCase().includes(q)) return true;
        return false;
      }

      return true;
    });
  }, [allCells, filter, searchQuery]);

  return (
    <div className="relative space-y-5 rounded-3xl border-[0.5px] border-b-white/5 border-l-white/20 border-r-white/5 border-t-white/30 bg-gradient-to-br from-white/10 via-white/5 to-black/30 p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-2xl">
      {/* Benchmark summary cards */}
      {benchmark && (
        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
          <div className="flex flex-col rounded-2xl border border-white/5 bg-black/30 p-3">
            <span className="text-on-surface/60 text-[11px] font-medium">
              Total Runtime
            </span>
            <span className="mt-0.5 flex items-center gap-1 font-mono text-base font-bold text-primary">
              <Clock className="h-3.5 w-3.5" /> {benchmark.totalElapsedMs} ms
            </span>
            <span className="text-on-surface/40 mt-1 text-[10px]">
              Hash: {benchmark.hashTotalMs}ms • OCR: {benchmark.ocrTotalMs}ms
            </span>
          </div>

          <div className="flex flex-col rounded-2xl border border-white/5 bg-black/30 p-3">
            <span className="text-on-surface/60 text-[11px] font-medium">
              Items Identified
            </span>
            <span className="mt-0.5 font-mono text-base font-bold text-emerald-400">
              {benchmark.matchedItems} / {benchmark.occupiedCells}
            </span>
            <span className="text-on-surface/40 mt-1 text-[10px]">
              Empty: {benchmark.emptyCells} slots
            </span>
          </div>

          <div className="flex flex-col rounded-2xl border border-white/5 bg-black/30 p-3">
            <span className="text-on-surface/60 text-[11px] font-medium">
              Total Quantity
            </span>
            <span className="mt-0.5 font-mono text-base font-bold text-amber-400">
              x{benchmark.totalQuantity.toLocaleString()}
            </span>
            <span className="text-on-surface/40 mt-1 text-[10px]">
              Across all detected slots
            </span>
          </div>

          <div className="flex flex-col rounded-2xl border border-white/5 bg-black/30 p-3">
            <span className="text-on-surface/60 text-[11px] font-medium">
              Average Confidence
            </span>
            <span className="mt-0.5 font-mono text-base font-bold text-primary">
              {benchmark.avgConfidence}%
            </span>
            <span className="text-on-surface/40 mt-1 text-[10px]">
              Across successful matches
            </span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-xl px-3 py-1 font-semibold transition-all ${
              filter === "all"
                ? "bg-primary text-primary-foreground shadow"
                : "text-on-surface/70 bg-white/5 hover:bg-white/10"
            }`}
          >
            All ({counts.total})
          </button>
          <button
            onClick={() => setFilter("matched")}
            className={`flex items-center gap-1 rounded-xl px-3 py-1 font-semibold transition-all ${
              filter === "matched"
                ? "bg-emerald-500 text-white shadow"
                : "bg-white/5 text-emerald-400 hover:bg-white/10"
            }`}
          >
            <CheckCircle2 className="h-3 w-3" /> Matched ({counts.matched})
          </button>
          <button
            onClick={() => setFilter("borderline")}
            className={`flex items-center gap-1 rounded-xl px-3 py-1 font-semibold transition-all ${
              filter === "borderline"
                ? "bg-amber-500 text-white shadow"
                : "bg-white/5 text-amber-400 hover:bg-white/10"
            }`}
          >
            <AlertTriangle className="h-3 w-3" /> Borderline (
            {counts.borderline})
          </button>
          <button
            onClick={() => setFilter("unmatched")}
            className={`flex items-center gap-1 rounded-xl px-3 py-1 font-semibold transition-all ${
              filter === "unmatched"
                ? "bg-red-500 text-white shadow"
                : "bg-white/5 text-red-400 hover:bg-white/10"
            }`}
          >
            <XCircle className="h-3 w-3" /> Unmatched ({counts.unmatched})
          </button>
          <button
            onClick={() => setFilter("empty")}
            className={`rounded-xl px-3 py-1 font-semibold transition-all ${
              filter === "empty"
                ? "bg-slate-600 text-white shadow"
                : "text-on-surface/50 bg-white/5 hover:bg-white/10"
            }`}
          >
            Empty ({counts.empty})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="text-on-surface/50 absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search material..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-on-surface placeholder:text-on-surface/40 rounded-xl border border-white/10 bg-black/40 py-1 pl-8 pr-3 text-xs focus:border-primary/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid of Cells */}
      <div
        className="grid max-h-[500px] gap-2.5 overflow-y-auto p-1"
        style={{
          gridTemplateColumns: `repeat(${gridConfig.columns}, minmax(0, 1fr))`,
        }}
      >
        {filteredCells.map(({ key, row, col, data }) => {
          const isSelected = selectedCellKey === key;
          const isOccupied = data && !data.stats.isEmpty;
          const isMatched = data?.matched;
          const conf = data?.matched?.confidence ?? 0;

          return (
            <button
              key={key}
              onClick={() => onSelectCell(row, col)}
              className={`group relative flex flex-col items-center overflow-hidden rounded-2xl border p-2 text-left backdrop-blur-md transition-all ${
                isSelected
                  ? "scale-[1.02] border-primary bg-primary/20 shadow-[0_0_15px_rgba(var(--md-sys-color-primary),0.5)]"
                  : isMatched && conf >= 75
                    ? "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/80"
                    : isMatched && conf >= 55
                      ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/80"
                      : isOccupied
                        ? "border-red-500/40 bg-red-500/5 hover:border-red-500/80"
                        : "border-white/5 bg-black/20 opacity-60 hover:opacity-100"
              }`}
            >
              {/* Coordinates badge */}
              <span className="text-on-surface/60 absolute left-1.5 top-1 font-mono text-[9px]">
                [{row},{col}]
              </span>

              {/* Confidence badge */}
              {isMatched && (
                <span
                  className={`absolute right-1.5 top-1 rounded px-1 font-mono text-[9px] font-bold ${
                    conf >= 75
                      ? "bg-emerald-500/80 text-white"
                      : "bg-amber-500/80 text-white"
                  }`}
                >
                  {conf}%
                </span>
              )}

              {/* Thumbnail */}
              <div className="relative mt-3 flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/40">
                {data?.slice.iconBitmap ? (
                  <BitmapPreview
                    bitmap={data.slice.iconBitmap}
                    alt={`Cell ${row},${col}`}
                    className="h-10 w-10 object-contain"
                  />
                ) : (
                  <span className="text-on-surface/40 text-[10px]">Empty</span>
                )}
              </div>

              {/* Label */}
              <div className="mt-1.5 w-full text-center">
                {data?.stats.isEmpty ? (
                  <span className="text-on-surface/40 block text-[10px]">
                    Empty
                  </span>
                ) : isMatched ? (
                  <>
                    <span className="text-on-surface line-clamp-1 block text-[10px] font-semibold">
                      {data.matched?.name}
                    </span>
                    <span className="block font-mono text-[10px] font-bold text-amber-400">
                      {data.ocr ? `x${data.ocr.quantity}` : "x1"}
                    </span>
                  </>
                ) : isOccupied ? (
                  <span className="block text-[10px] font-semibold text-red-400">
                    Unmatched
                  </span>
                ) : (
                  <span className="text-on-surface/40 block text-[10px]">
                    -
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
