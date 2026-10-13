"use client";

import React from "react";
import { GridConfig } from "@/lib/grid-detector";
import { Sliders, Layers } from "lucide-react";

interface TuningControlsProps {
  gridConfig: GridConfig;
  onUpdateGrid: (delta: Partial<GridConfig>) => void;
  onApplyToAll: () => void;
}

export function TuningControls({
  gridConfig,
  onUpdateGrid,
  onApplyToAll,
}: TuningControlsProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-white/70">
          Fine-Tuning Controls
        </span>
        <Sliders className="h-3.5 w-3.5 text-primary" />
      </div>

      <div className="space-y-3 text-xs">
        {/* Columns & Rows Steppers */}
        <div className="flex items-center justify-between">
          <span className="text-white/80">Columns</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onUpdateGrid({ columns: gridConfig.columns - 1 })}
              className="h-6 w-6 rounded bg-white/10 font-bold text-white hover:bg-white/20 active:scale-95"
            >
              -
            </button>
            <span className="w-8 text-center font-mono font-bold text-white">
              {gridConfig.columns}
            </span>
            <button
              onClick={() => onUpdateGrid({ columns: gridConfig.columns + 1 })}
              className="h-6 w-6 rounded bg-white/10 font-bold text-white hover:bg-white/20 active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-white/80">Rows</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onUpdateGrid({ rows: gridConfig.rows - 1 })}
              className="h-6 w-6 rounded bg-white/10 font-bold text-white hover:bg-white/20 active:scale-95"
            >
              -
            </button>
            <span className="w-8 text-center font-mono font-bold text-white">
              {gridConfig.rows}
            </span>
            <button
              onClick={() => onUpdateGrid({ rows: gridConfig.rows + 1 })}
              className="h-6 w-6 rounded bg-white/10 font-bold text-white hover:bg-white/20 active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        {/* Position Nudges */}
        <div className="pt-2">
          <span className="text-[11px] font-bold text-white/50">
            POSITION OFFSET (startX / startY)
          </span>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between rounded-lg bg-white/5 px-2 py-1">
              <span className="text-[11px] text-white/70">X:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => onUpdateGrid({ startX: gridConfig.startX - 5 })}
                  className="rounded bg-white/10 px-1.5 text-[10px] text-white hover:bg-white/20"
                >
                  -5
                </button>
                <button
                  onClick={() => onUpdateGrid({ startX: gridConfig.startX + 5 })}
                  className="rounded bg-white/10 px-1.5 text-[10px] text-white hover:bg-white/20"
                >
                  +5
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-white/5 px-2 py-1">
              <span className="text-[11px] text-white/70">Y:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => onUpdateGrid({ startY: gridConfig.startY - 5 })}
                  className="rounded bg-white/10 px-1.5 text-[10px] text-white hover:bg-white/20"
                >
                  -5
                </button>
                <button
                  onClick={() => onUpdateGrid({ startY: gridConfig.startY + 5 })}
                  className="rounded bg-white/10 px-1.5 text-[10px] text-white hover:bg-white/20"
                >
                  +5
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cell Dimensions */}
        <div className="pt-2">
          <span className="text-[11px] font-bold text-white/50">
            CELL SIZE (cellWidth / cellHeight)
          </span>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between rounded-lg bg-white/5 px-2 py-1">
              <span className="text-[11px] text-white/70">W:</span>
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    onUpdateGrid({ cellWidth: gridConfig.cellWidth - 2 })
                  }
                  className="rounded bg-white/10 px-1.5 text-[10px] text-white hover:bg-white/20"
                >
                  -2
                </button>
                <button
                  onClick={() =>
                    onUpdateGrid({ cellWidth: gridConfig.cellWidth + 2 })
                  }
                  className="rounded bg-white/10 px-1.5 text-[10px] text-white hover:bg-white/20"
                >
                  +2
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-white/5 px-2 py-1">
              <span className="text-[11px] text-white/70">H:</span>
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    onUpdateGrid({ cellHeight: gridConfig.cellHeight - 2 })
                  }
                  className="rounded bg-white/10 px-1.5 text-[10px] text-white hover:bg-white/20"
                >
                  -2
                </button>
                <button
                  onClick={() =>
                    onUpdateGrid({ cellHeight: gridConfig.cellHeight + 2 })
                  }
                  className="rounded bg-white/10 px-1.5 text-[10px] text-white hover:bg-white/20"
                >
                  +2
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Gaps */}
        <div className="pt-2">
          <span className="text-[11px] font-bold text-white/50">
            CELL GAPS (gapX / gapY)
          </span>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between rounded-lg bg-white/5 px-2 py-1">
              <span className="text-[11px] text-white/70">gapX:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => onUpdateGrid({ gapX: gridConfig.gapX - 1 })}
                  className="rounded bg-white/10 px-1.5 text-[10px] text-white hover:bg-white/20"
                >
                  -1
                </button>
                <button
                  onClick={() => onUpdateGrid({ gapX: gridConfig.gapX + 1 })}
                  className="rounded bg-white/10 px-1.5 text-[10px] text-white hover:bg-white/20"
                >
                  +1
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-white/5 px-2 py-1">
              <span className="text-[11px] text-white/70">gapY:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => onUpdateGrid({ gapY: gridConfig.gapY - 1 })}
                  className="rounded bg-white/10 px-1.5 text-[10px] text-white hover:bg-white/20"
                >
                  -1
                </button>
                <button
                  onClick={() => onUpdateGrid({ gapY: gridConfig.gapY + 1 })}
                  className="rounded bg-white/10 px-1.5 text-[10px] text-white hover:bg-white/20"
                >
                  +1
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Batch Action: Apply To All */}
      <div className="mt-4 border-t border-white/10 pt-3">
        <button
          onClick={onApplyToAll}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 py-2 text-xs font-bold text-white transition-all hover:bg-white/20 active:scale-95"
        >
          <Layers className="h-3.5 w-3.5 text-primary" />
          <span>Apply Grid to All in Session</span>
        </button>
      </div>
    </div>
  );
}
