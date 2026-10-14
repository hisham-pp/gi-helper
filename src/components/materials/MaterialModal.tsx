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
import { usePauseBackground } from "@/lib/use-pause-background";
import { useModalMotion } from "@/lib/use-modal-motion";

interface MaterialModalProps {
  material: MaterialItem;
  onClose: () => void;
  onNavigateNext?: () => void;
  onNavigatePrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  /** Number of materials in the dataset, shown as "#order / total". */
  total?: number;
}

/** Material details. MaterialList loads it on demand and mounts it only while a material is selected. */
export function MaterialModal({
  material,
  onClose,
  onNavigateNext,
  onNavigatePrev,
  hasNext,
  hasPrev,
  total,
}: MaterialModalProps) {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  usePauseBackground();
  const { dialogRef, backdropRef, close } = useModalMotion(onClose);

  useEffect(() => {
    setCopied(false);
    setImgError(false);
  }, [material]);

  // Handle keyboard events (Escape, Left, Right)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      } else if (e.key === "ArrowRight" && hasNext && onNavigateNext) {
        onNavigateNext();
      } else if (e.key === "ArrowLeft" && hasPrev && onNavigatePrev) {
        onNavigatePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasNext, hasPrev, onNavigateNext, onNavigatePrev, close]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop: a sibling of the dialog, so its fade doesn't fade the dialog */}
      <div
        ref={backdropRef}
        className="fixed inset-0 bg-black/55 backdrop-blur-sm"
        onClick={close}
      />

      <div
        ref={dialogRef}
        style={{ "--glass-accent": styles.accent } as React.CSSProperties}
        className="glass-card glass-card--lg glass-card--raised relative z-10 w-full max-w-lg overflow-hidden p-6"
      >
        {/* Top Header Actions */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <span className="glass-chip gap-1 px-3 py-1 font-mono text-xs font-bold text-white">
              <span className="font-bold text-cyan-300">#</span>
              {material.order}
              {total !== undefined && (
                <span className="ml-0.5 text-[10px] text-white/40">/ {total}</span>
              )}
            </span>
            <span className={`glass-chip px-2.5 py-1 text-xs font-semibold ${styles.starColor}`}>
              {rarity}★ Rarity
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Prev / Next controls */}
            <button
              onClick={onNavigatePrev}
              disabled={!hasPrev}
              className="glass-icon-btn h-8 w-8 rounded-full"
              title="Previous Material (Left Arrow)"
              aria-label="Previous Material"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={onNavigateNext}
              disabled={!hasNext}
              className="glass-icon-btn h-8 w-8 rounded-full"
              title="Next Material (Right Arrow)"
              aria-label="Next Material"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={close}
              className="glass-icon-btn ml-2 h-8 w-8 rounded-full"
              title="Close (Escape)"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="glass-divider" />

        {/* Material Main Content */}
        <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          {/* Big Item Frame */}
          <div className="glass-well glass-well--tinted relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl">
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
              <span className="glass-chip gap-1.5 px-3 py-1 text-xs font-medium text-white/85">
                <Tag className="h-3 w-3 text-cyan-300" />
                {categoryLabel}
              </span>

              {material.sortRank !== undefined && (
                <span
                  className="glass-chip gap-1.5 px-3 py-1 font-mono text-xs text-white/70"
                  title="In-Game sortRank field"
                >
                  <Layers className="h-3 w-3 text-cyan-300/80" />
                  SortRank: {material.sortRank}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Item ID Bar */}
        <div className="glass-well mt-5 flex items-center justify-between rounded-2xl p-2 pl-3.5">
          <div className="flex items-center gap-2 overflow-hidden text-xs">
            <span className="font-mono text-white/40">ID:</span>
            <code className="truncate font-mono font-semibold text-cyan-300">
              {material.id}
            </code>
          </div>
          <button
            onClick={handleCopyId}
            className="glass-btn shrink-0 gap-1.5 px-3 py-1.5 text-xs"
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
            <Bookmark className="h-3.5 w-3.5 text-cyan-300" />
            In-Game Description & Lore
          </h4>
          <div className="glass-well mt-2 max-h-48 overflow-y-auto rounded-2xl p-3.5 text-xs leading-relaxed text-white/80">
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
        <div className="glass-divider mt-4" />
        <div className="flex items-center justify-between pt-3 text-[11px] text-white/40">
          <span>Tip: Use Arrow keys to browse materials in order</span>
          <span className="font-mono">Esc to close</span>
        </div>
      </div>
    </div>
  );
}
