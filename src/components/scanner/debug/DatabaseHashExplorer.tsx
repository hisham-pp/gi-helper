"use client";

import React, { useState, useMemo } from "react";
import materialsData from "@/data/materials.json";
import materialHashes from "@/data/material-hashes.json";
import { CellDebugData, DebugHyperparams } from "@/lib/cv/debug-types";
import { hammingDistance, histogramIntersection } from "@/lib/cv/image-hasher";
import {
  Search,
  Database,
  ArrowRightLeft,
  Copy,
  Check,
  Hash,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

interface DatabaseHashExplorerProps {
  selectedCellData: CellDebugData | null;
  hyperparams: DebugHyperparams;
}

export function DatabaseHashExplorer({
  selectedCellData,
  hyperparams,
}: DatabaseHashExplorerProps) {
  const [search, setSearch] = useState("");
  const [selectedMatId, setSelectedMatId] =
    useState<string>("slime-condensate");
  const [copiedHash, setCopiedHash] = useState(false);

  // Filter materials
  const filteredMaterials = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return materialsData.slice(0, 40);
    return materialsData
      .filter(
        (m) =>
          m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q),
      )
      .slice(0, 40);
  }, [search]);

  // Selected Material Data
  const matInfo = useMemo(() => {
    const mat = materialsData.find((m) => m.id === selectedMatId);
    const hashesRecord = materialHashes as Record<
      string,
      string | { dHash: string; colorHist: number[] }
    >;
    const stored = hashesRecord[selectedMatId];
    const dHash = typeof stored === "string" ? stored : stored?.dHash || "";
    const colorHist = typeof stored === "object" ? stored.colorHist || [] : [];
    return { mat, dHash, colorHist };
  }, [selectedMatId]);

  // Comparison with current cell
  const comparison = useMemo(() => {
    if (!selectedCellData || selectedCellData.stats.isEmpty || !matInfo.dHash) {
      return null;
    }

    const cellFp = selectedCellData.fingerprint;
    const dist = hammingDistance(cellFp.dHash, matInfo.dHash);
    const hashSim = 1 - dist / 256;

    let colorSim = 0.5;
    if (matInfo.colorHist.length > 0 && cellFp.colorHist.length > 0) {
      colorSim = histogramIntersection(cellFp.colorHist, matInfo.colorHist);
    }

    const score =
      hyperparams.hashWeight * hashSim + hyperparams.colorWeight * colorSim;
    const confidence = Math.round(score * 100);

    return {
      dist,
      hashSim: Math.round(hashSim * 1000) / 10,
      colorSim: Math.round(colorSim * 1000) / 10,
      confidence,
      score,
    };
  }, [selectedCellData, matInfo, hyperparams]);

  const handleCopyHash = () => {
    if (!matInfo.dHash) return;
    navigator.clipboard.writeText(matInfo.dHash);
    setCopiedHash(true);
    toast.success("Reference dHash copied to clipboard!");
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="relative space-y-5 rounded-3xl border-[0.5px] border-b-white/5 border-l-white/20 border-r-white/5 border-t-white/30 bg-gradient-to-br from-white/10 via-white/5 to-black/30 p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-2xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <span className="text-on-surface text-sm font-bold sm:text-base">
            Material Database Hash Explorer
          </span>
        </div>
        <span className="text-on-surface/60 font-mono text-xs">
          {materialsData.length} reference items
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Left: Search & Material Picker */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="text-on-surface/50 absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference material (e.g. Slime, Ballad)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-on-surface placeholder:text-on-surface/40 w-full rounded-xl border border-white/10 bg-black/40 py-2 pl-9 pr-3 text-xs focus:border-primary/50 focus:outline-none"
            />
          </div>

          <div className="max-h-72 space-y-1 divide-y divide-white/5 overflow-y-auto pr-1">
            {filteredMaterials.map((m) => {
              const isSelected = m.id === selectedMatId;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMatId(m.id)}
                  className={`flex w-full items-center justify-between rounded-xl p-2 text-left transition-all ${
                    isSelected
                      ? "border border-primary/40 bg-primary/20 font-bold text-primary shadow-sm"
                      : "text-on-surface hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border border-white/10 bg-black/40 p-1">
                      <img
                        src={`/images/materials/${m.id}.png`}
                        alt={m.name}
                        className="h-6 w-6 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                    <div>
                      <span className="line-clamp-1 text-xs">{m.name}</span>
                      <span className="text-on-surface/50 block font-mono text-[10px]">
                        {m.id}
                      </span>
                    </div>
                  </div>
                  {m.rarity && (
                    <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-300">
                      ★{m.rarity}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Reference Details & Direct Comparison */}
        <div className="space-y-4 rounded-2xl border border-white/10 bg-black/30 p-4">
          {matInfo.mat ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/50 p-1 shadow-inner">
                  <img
                    src={`/images/materials/${matInfo.mat.id}.png`}
                    alt={matInfo.mat.name}
                    className="h-10 w-10 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
                <div>
                  <h4 className="text-on-surface text-sm font-bold">
                    {matInfo.mat.name}
                  </h4>
                  <p className="text-on-surface/60 font-mono text-xs">
                    {matInfo.mat.id}
                  </p>
                </div>
              </div>

              {/* Reference dHash */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface flex items-center gap-1 font-bold">
                    <Hash className="h-3 w-3 text-primary" /> Stored Reference
                    dHash
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
                    Copy
                  </button>
                </div>
                <div className="select-all break-all rounded-xl border border-white/10 bg-black/60 p-2 font-mono text-[10px] text-primary">
                  {matInfo.dHash || "No stored hash"}
                </div>
              </div>

              {/* Direct Comparison Box */}
              <div className="space-y-2 border-t border-white/10 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface flex items-center gap-1.5 font-bold">
                    <ArrowRightLeft className="h-3.5 w-3.5 text-primary" /> Live
                    Comparison with Selected Cell
                  </span>
                  {selectedCellData && (
                    <span className="font-mono text-xs font-bold text-primary">
                      [{selectedCellData.slice.row},{" "}
                      {selectedCellData.slice.col}]
                    </span>
                  )}
                </div>

                {comparison ? (
                  <div className="space-y-2.5 rounded-xl border border-white/10 bg-black/50 p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-on-surface/80">
                        Overall Match Confidence:
                      </span>
                      <span
                        className={`font-mono text-sm font-bold ${
                          comparison.confidence >= 75
                            ? "text-emerald-400"
                            : comparison.confidence >= 55
                              ? "text-amber-400"
                              : "text-red-400"
                        }`}
                      >
                        {comparison.confidence}%
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                      <div className="rounded-lg border border-white/5 bg-black/40 p-2">
                        <span className="text-on-surface/50 block">
                          Shape Sim
                        </span>
                        <span className="text-on-surface font-mono font-bold">
                          {comparison.hashSim}%
                        </span>
                      </div>
                      <div className="rounded-lg border border-white/5 bg-black/40 p-2">
                        <span className="text-on-surface/50 block">
                          Color Sim
                        </span>
                        <span className="text-on-surface font-mono font-bold">
                          {comparison.colorSim}%
                        </span>
                      </div>
                      <div className="rounded-lg border border-white/5 bg-black/40 p-2">
                        <span className="text-on-surface/50 block">
                          Hamming Dist
                        </span>
                        <span className="text-on-surface font-mono font-bold">
                          {comparison.dist} / 256
                        </span>
                      </div>
                    </div>

                    <p className="text-on-surface/60 text-[11px]">
                      Formula: ({Math.round(hyperparams.hashWeight * 100)}% ×{" "}
                      {comparison.hashSim}%) + (
                      {Math.round(hyperparams.colorWeight * 100)}% ×{" "}
                      {comparison.colorSim}%) ={" "}
                      <strong>{comparison.confidence}%</strong>
                    </p>
                  </div>
                ) : (
                  <div className="text-on-surface/50 rounded-xl border border-white/5 bg-black/40 p-4 text-center text-xs">
                    Select an occupied cell in the grid above to see live
                    comparison metrics against this material.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-on-surface/50 p-8 text-center text-xs">
              Select a material from the left
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
