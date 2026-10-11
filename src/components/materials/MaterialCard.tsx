"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Copy, Check, Info } from "lucide-react";
import { MaterialItem } from "@/lib/types";
import { getRarityStyles, getMaterialCategoryLabel } from "@/lib/materials";
import { toast } from "sonner";

interface MaterialCardProps {
  material: MaterialItem;
  onClick: () => void;
}

export function MaterialCard({ material, onClick }: MaterialCardProps) {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);
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
      className={`group relative flex flex-col items-center justify-between overflow-hidden rounded-2xl border-[0.5px] bg-gradient-to-br ${styles.cardBg} cursor-pointer p-3.5 text-center shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.35)] focus:outline-none focus:ring-2 focus:ring-primary/50 ${styles.border}`}
    >
      {/* Top Bar: Order Badge & Copy Button */}
      <div className="relative z-10 flex w-full items-center justify-between">
        <span
          className="flex items-center gap-1 rounded-md border border-white/10 bg-black/40 px-2 py-0.5 font-mono text-[11px] font-bold tracking-tight text-white/90 shadow-sm backdrop-blur-md"
          title={`Canonical In-Game Bag Order: #${material.order}`}
        >
          <span className="text-white/50">#</span>
          {material.order}
        </span>

        <button
          onClick={handleCopyId}
          className="text-on-surface-variant flex h-6 w-6 items-center justify-center rounded-md border border-transparent opacity-60 transition-all hover:border-white/15 hover:bg-white/10 hover:opacity-100 group-hover:opacity-100"
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
      <div className="relative my-2.5 flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-black/35 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105">
        {!imgError ? (
          <img
            src={material.image}
            alt={material.name}
            className="h-16 w-16 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-[10px] text-white/50">
            <span>No Icon</span>
          </div>
        )}
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
        className="text-on-surface line-clamp-2 min-h-[38px] w-full text-xs font-semibold leading-snug drop-shadow-sm transition-colors group-hover:text-primary sm:text-sm"
        title={material.name}
      >
        {material.name}
      </h3>

      {/* Category Pill */}
      <div className="mt-2 flex w-full items-center justify-between border-t border-white/10 pt-2 text-[10px]">
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
}
