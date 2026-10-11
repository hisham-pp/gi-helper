"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Hash,
  Tag,
  Layers,
  Bookmark,
} from "lucide-react";
import { MaterialItem } from "@/lib/types";
import { getRarityStyles, getMaterialCategoryLabel } from "@/lib/materials";
import { toast } from "sonner";

interface MaterialModalProps {
  material: MaterialItem | null;
  onClose: () => void;
  onNavigateNext?: () => void;
  onNavigatePrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export function MaterialModal({
  material,
  onClose,
  onNavigateNext,
  onNavigatePrev,
  hasNext,
  hasPrev,
}: MaterialModalProps) {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setCopied(false);
    setImgError(false);
  }, [material]);

  // Handle keyboard events (Escape, Left, Right)
  useEffect(() => {
    if (!material) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" && hasNext && onNavigateNext) {
        onNavigateNext();
      } else if (e.key === "ArrowLeft" && hasPrev && onNavigatePrev) {
        onNavigatePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [material, hasNext, hasPrev, onNavigateNext, onNavigatePrev, onClose]);

  if (!material) return null;

  const rarity = material.rarity || 1;
  const styles = getRarityStyles(rarity);
  const categoryLabel = getMaterialCategoryLabel(material);

  const handleCopyId = () => {
    navigator.clipboard.writeText(material.id);
    setCopied(true);
    toast.success(`Copied ID: "${material.id}"`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md duration-200"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b ${styles.cardBg} animate-in zoom-in-95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Actions */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full border border-white/15 bg-black/40 px-3 py-1 font-mono text-xs font-bold text-white shadow-sm">
              <span className="font-bold text-primary">#</span>
              {material.order}
              <span className="ml-0.5 text-[10px] text-white/40">/ 475</span>
            </span>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles.badgeBg}`}
            >
              {rarity}★ Rarity
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Prev / Next controls */}
            <button
              onClick={onNavigatePrev}
              disabled={!hasPrev}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/15 disabled:pointer-events-none disabled:opacity-30"
              title="Previous Material (Left Arrow)"
              aria-label="Previous Material"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={onNavigateNext}
              disabled={!hasNext}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/15 disabled:pointer-events-none disabled:opacity-30"
              title="Next Material (Right Arrow)"
              aria-label="Next Material"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="ml-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/20"
              title="Close (Escape)"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Material Main Content */}
        <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          {/* Big Item Frame */}
          <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-black/40 shadow-[inset_0_4px_16px_rgba(0,0,0,0.6)]">
            {!imgError ? (
              <img
                src={material.image}
                alt={material.name}
                className="h-24 w-24 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-xs text-white/50">No Image</span>
            )}
          </div>

          {/* Title & Core Metadata */}
          <div className="flex flex-1 flex-col items-center sm:items-start">
            <div className="flex items-center gap-1 text-sm font-bold drop-shadow">
              {Array.from({ length: rarity }).map((_, i) => (
                <span key={i} className={styles.starColor}>
                  ★
                </span>
              ))}
            </div>

            <h2 className="mt-1 text-center text-xl font-bold tracking-tight text-white drop-shadow-md sm:text-left sm:text-2xl">
              {material.name}
            </h2>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/80">
                <Tag className="h-3 w-3 text-primary" />
                {categoryLabel}
              </span>

              {material.sortRank !== undefined && (
                <span
                  className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-white/70"
                  title="In-Game sortRank field"
                >
                  <Layers className="h-3 w-3 text-secondary" />
                  SortRank: {material.sortRank}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Item ID Bar */}
        <div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-black/30 p-2.5 px-3">
          <div className="flex items-center gap-2 overflow-hidden text-xs">
            <span className="font-mono text-white/40">ID:</span>
            <code className="truncate font-mono font-semibold text-primary">
              {material.id}
            </code>
          </div>
          <button
            onClick={handleCopyId}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-white/20 active:scale-95"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy ID</span>
              </>
            )}
          </button>
        </div>

        {/* In-Game Lore / Description */}
        <div className="mt-4">
          <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/50">
            <Bookmark className="h-3.5 w-3.5 text-primary" />
            In-Game Description & Lore
          </h4>
          <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-3.5 text-xs leading-relaxed text-white/80 shadow-inner">
            {material.description ? (
              material.description.split("\n").map((line, idx) => (
                <p key={idx} className={idx > 0 ? "mt-2" : ""}>
                  {line}
                </p>
              ))
            ) : (
              <span className="italic text-white/40">
                No description available.
              </span>
            )}
          </div>
        </div>

        {/* Footer Navigation Tip */}
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-white/40">
          <span>Tip: Use Arrow keys to browse materials in order</span>
          <span className="font-mono">Esc to close</span>
        </div>
      </div>
    </div>
  );
}
