"use client";

import React from "react";
import { AlertTriangle, ChevronDown, Grid3X3 } from "lucide-react";
import type { DetectedGrid, GridDetectionResult } from "@gi/grid-detector";

interface DetectionSummaryProps {
  result: GridDetectionResult | null;
  /** Current grids, including manual edits. */
  grids: DetectedGrid[];
  isEdited: boolean;
  error: string | null;
}

function pct(v: number) {
  return `${Math.round(v * 100)}%`;
}

export function DetectionSummary({ result, grids, isEdited, error }: DetectionSummaryProps) {
  const cardCount = grids.reduce((s, g) => s + g.cards.length, 0);
  const lowCount = grids.reduce(
    (s, g) => s + g.cards.filter((c) => c.source !== "manual" && c.confidence < 0.75).length,
    0,
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-white/70">
          Detection Summary
        </span>
        {isEdited && (
          <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[11px] font-bold text-sky-300">
            Edited
          </span>
        )}
      </div>

      {error ? (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-xl bg-white/5 p-2">
              <div className="text-white/50">Grids</div>
              <div className="text-lg font-bold text-primary">{grids.length}</div>
            </div>
            <div className="rounded-xl bg-white/5 p-2">
              <div className="text-white/50">Cards</div>
              <div className="text-lg font-bold text-white">{cardCount}</div>
            </div>
            <div className="rounded-xl bg-white/5 p-2">
              <div className="text-white/50">Time</div>
              <div className="text-lg font-bold text-white">
                {result ? `${Math.round(result.processingTimeMs)}` : "–"}
                <span className="text-[10px] font-normal text-white/50"> ms</span>
              </div>
            </div>
          </div>

          {grids.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {grids.map((g) => (
                <li
                  key={g.id}
                  className="flex items-center justify-between rounded-xl bg-white/5 px-2.5 py-1.5 text-xs"
                >
                  <span className="flex items-center gap-1.5 text-white/80">
                    <Grid3X3 className="h-3.5 w-3.5 text-primary" />
                    {g.id === "manual" ? (
                      "Manual cards"
                    ) : (
                      <>
                        {g.columns} × {g.rows}
                        <span className="text-white/40">
                          · {g.cardWidth}×{g.cardHeight}px
                        </span>
                      </>
                    )}
                  </span>
                  <span className="font-mono text-white/70">
                    {g.cards.length} · {pct(g.confidence)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {lowCount > 0 && (
            <p className="mt-2 text-[11px] text-amber-300/90">
              {lowCount} low-confidence card{lowCount > 1 ? "s" : ""} (dashed) — worth a check.
            </p>
          )}

          {result?.warnings.map((w) => (
            <p key={w} className="mt-2 flex items-start gap-1.5 text-[11px] text-amber-300/90">
              <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0" />
              {w}
            </p>
          ))}

          {result && (
            <details className="group mt-3 text-[11px] text-white/50">
              <summary className="flex cursor-pointer list-none items-center gap-1 hover:text-white/80">
                <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" />
                Diagnostics
              </summary>
              <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 font-mono">
                <dt>Image</dt>
                <dd className="text-right text-white/70">
                  {result.imageWidth}×{result.imageHeight}
                </dd>
                <dt>Analysis</dt>
                <dd className="text-right text-white/70">
                  {result.diagnostics.analysisWidth}×{result.diagnostics.analysisHeight}
                </dd>
                <dt>Edge threshold</dt>
                <dd className="text-right text-white/70">{result.diagnostics.edgeThreshold}</dd>
                <dt>Candidates</dt>
                <dd className="text-right text-white/70">
                  {result.diagnostics.filteredCandidateCount} / {result.diagnostics.rawCandidateCount}
                </dd>
                {Object.entries(result.diagnostics.stageTimingsMs).map(([stage, ms]) => (
                  <React.Fragment key={stage}>
                    <dt>{stage}</dt>
                    <dd className="text-right text-white/70">{ms} ms</dd>
                  </React.Fragment>
                ))}
              </dl>
            </details>
          )}
        </>
      )}
    </div>
  );
}
