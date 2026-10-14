"use client";

import React, { memo, useState } from "react";
import Image from "next/image";
import { Copy, Check, Info } from "lucide-react";
import { MaterialItem } from "@/lib/types";
import { bagOrder, getRarityStyles, getMaterialCategoryLabel } from "@/lib/material-ui";
import { toast } from "sonner";
import { MaterialThumb } from "@/components/ui/MaterialThumb";

interface MaterialCardProps {
  material: MaterialItem;
  /** Should be stable (e.g. a state setter) so the memoized card can skip re-renders. */
  onSelect: (material: MaterialItem) => void;
}

export const MaterialCard = memo(function MaterialCard({
  material,
  onSelect,
}: MaterialCardProps) {
  const [copied, setCopied] = useState(false);
  const onClick = () => onSelect(material);
  const rarity = material.rarity || 1;
  const styles = getRarityStyles(rarity);
  const categoryLabel = getMaterialCategoryLabel(material);

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(material.id);
    setCopied(true);
    toast.success(`Copied ID: "${material.id}"`);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      // Rarity colour tints the glass rim and edge glow
      style={{ "--glass-accent": styles.accent } as React.CSSProperties}
      className="glass-card glass-card--hover group flex cursor-pointer flex-col items-center justify-between p-3.5 text-center hover:transform-none motion-safe:hover:animate-squish"
    >
      {/* Top Bar: Order Badge & Copy Button */}
      <div className="relative z-10 flex w-full items-center justify-between">
        <span
          className="glass-chip gap-0.5 px-2 py-0.5 font-mono text-[11px] font-bold tracking-tight text-white/90"
          title={`In-game bag order (${bagOrder(material).tab} tab): #${bagOrder(material).position}`}
        >
          <span className="text-white/50">#</span>
          {bagOrder(material).position}
        </span>

        <button
          onClick={handleCopyId}
          className="glass-icon-btn h-6 w-6 rounded-lg opacity-60 hover:opacity-100 group-hover:opacity-100"
          title="Copy Material ID"
          aria-label="Copy Material ID"
        >
          {copied ? (
            <Check className="h-3 w-3 text-emerald-400" />
          ) : (
            <Copy className="h-3 w-3 text-white/70" />
          )}
        </button>
      </div>

      {/* Material Thumbnail with Rarity Glow Frame */}
      <div className="glass-well glass-well--tinted relative my-2.5 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl">
        <MaterialThumb
          id={material.id}
          alt={material.name}
          size={64}
          className="h-16 w-16 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
          fallback={
            <div className="flex flex-col items-center justify-center text-[10px] text-white/50">
              <span>No Icon</span>
            </div>
          }
        />
      </div>

      {/* Rarity Stars */}
      <div className="mb-1 flex items-center justify-center gap-0.5 text-xs drop-shadow">
        {Array.from({ length: rarity }).map((_, i) => (
          <span key={i} className={styles.starColor}>
            ★
          </span>
        ))}
      </div>

      {/* Material Name */}
      <h3
        className="line-clamp-2 min-h-[38px] w-full text-xs font-semibold leading-snug text-white drop-shadow-sm transition-colors group-hover:text-cyan-100 sm:text-sm"
        title={material.name}
      >
        {material.name}
      </h3>

      {/* Category Pill */}
      <div className="glass-divider mt-2 w-full" />
      <div className="flex w-full items-center justify-between pt-2 text-[10px]">
        <span
          className="truncate font-medium text-white/60"
          title={categoryLabel}
        >
          {categoryLabel}
        </span>
        <span
          className="font-mono text-white/40"
          title={`SortRank: ${material.sortRank ?? "N/A"}`}
        >
          r:{material.sortRank ?? "—"}
        </span>
      </div>
    </div>
  );
});
