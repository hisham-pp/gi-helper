"use client";

import React from "react";
import { AlertTriangle, ChevronDown, Loader2, RefreshCw, ScanSearch, Tags } from "lucide-react";
import type { MaterialRecognitionResult } from "@/lib/material-detector";
import { MaterialIcon, pct, STATUS_STYLE } from "./shared";

interface RecognitionPanelProps {
  result: MaterialRecognitionResult | null;
  busy: boolean;
  error: string | null;
  selectedCardId: string | null;
  onSelectCard: (id: string) => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  onRerun: () => void;
}

/**
 * Material recognition for the current image: every card with its matched
 * material and quantity, in reading order. Updates after detection and after
 * each manual box edit.
 */
export function RecognitionPanel({
  result,
  busy,
  error,
  selectedCardId,
  onSelectCard,
  showLabels,
  onToggleLabels,
  onRerun,
}: RecognitionPanelProps) {
  const cards = result?.cards ?? [];
  const count = (s: string) => cards.filter((c) => c.status === s).length;
  const unreadable = cards.filter((c) => c.material && c.quantity.value === null).length;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/80">
          <ScanSearch className="h-4 w-4 text-primary" />
          Material Recognition
          {busy && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" aria-label="Recognising" />}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleLabels}
            aria-pressed={showLabels}
            className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold transition-colors ${
              showLabels ? "border-primary/40 bg-primary/20 text-white" : "border-white/10 bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            <Tags className="h-3.5 w-3.5" />
            Labels
          </button>
          <button
            type="button"
            onClick={onRerun}
            disabled={busy}
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold text-white/70 hover:text-white disabled:opacity-40"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Re-run
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      ) : !result ? (
        <p className="mt-3 text-xs text-white/50">
          {busy ? "Identifying cards…" : "Cards are identified automatically once they are detected."}
        </p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
            <Stat label="Matched" value={count("matched")} tone="text-emerald-300" />
            <Stat label="Check" value={count("uncertain")} tone="text-amber-200" />
            <Stat label="Unknown" value={count("unknown")} tone="text-rose-300" />
            <Stat label="ms" value={Math.round(result.processingTimeMs)} tone="text-white" />
          </div>

          {result.mora && result.mora.value !== null && (
            <div className="mt-2.5 flex items-center justify-between rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-amber-200">
                <span className="text-sm">🪙</span>
                Header Mora
              </span>
              <span className="font-mono text-xs font-bold text-amber-300">
                {result.mora.value.toLocaleString()}
              </span>
            </div>
          )}

          {cards.length > 0 && (
            <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-1.5">
              {cards.map((c) => {
                const style = STATUS_STYLE[c.status];
                const selected = c.cardId === selectedCardId;
                return (
                  <button
                    type="button"
                    key={c.cardId}
                    onClick={() => onSelectCard(c.cardId)}
                    className={`flex items-center gap-2 rounded-xl border bg-black/30 p-1.5 text-left transition-colors hover:bg-white/10 ${
                      selected ? "border-white ring-2 ring-white/30" : style.border
                    }`}
                    title={`${c.material?.name ?? "Not recognised"} · ${pct(c.confidence)}`}
                  >
                    {c.material ? (
                      <MaterialIcon id={c.material.id} size={32} className="flex-shrink-0" />
                    ) : (
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/40">
                        ?
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-semibold text-white">
                        {c.material?.name ?? "Not recognised"}
                      </span>
                      <span className="flex items-center gap-1.5 font-mono text-[10px] text-white/60">
                        <span className="text-white/80">×{c.quantity.value ?? "?"}</span>
                        <span className={c.status === "matched" ? "text-white/50" : "text-amber-200"}>{pct(c.confidence)}</span>
                        {c.row !== null && c.column !== null && (
                          <span className="text-white/30">
                            {c.row + 1}·{c.column + 1}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {unreadable > 0 && (
            <p className="mt-2 text-[11px] text-amber-300/90">
              {unreadable} quantit{unreadable > 1 ? "ies" : "y"} could not be read.
            </p>
          )}
          {result.warnings.map((w) => (
            <p key={w} className="mt-2 flex items-start gap-1.5 text-[11px] text-amber-300/90">
              <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0" />
              {w}
            </p>
          ))}

          <details className="group mt-3 text-[11px] text-white/50">
            <summary className="flex cursor-pointer list-none items-center gap-1 hover:text-white/80">
              <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" />
              Diagnostics
            </summary>
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 font-mono">
              <dt>References</dt>
              <dd className="text-right text-white/70">{result.diagnostics.referenceCount}</dd>
              <dt>Bank</dt>
              <dd className="text-right text-white/70">{result.diagnostics.bankVersion}</dd>
              <dt>Align evals / card</dt>
              <dd className="text-right text-white/70">{result.diagnostics.alignmentEvaluations}</dd>
              {Object.entries(result.diagnostics.stageTimingsMs).map(([stage, ms]) => (
                <React.Fragment key={stage}>
                  <dt>{stage}</dt>
                  <dd className="text-right text-white/70">{ms} ms</dd>
                </React.Fragment>
              ))}
            </dl>
          </details>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl bg-black/30 p-2">
      <div className="text-white/50">{label}</div>
      <div className={`text-lg font-bold ${tone}`}>{value}</div>
    </div>
  );
}
