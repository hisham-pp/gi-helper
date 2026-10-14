"use client";

import React from "react";
import { MATERIAL_CATEGORIES, MaterialCategory } from "@/lib/material-ui";

interface CategoryFilterPillsProps {
  selected: MaterialCategory;
  onSelect: (category: MaterialCategory) => void;
  /** Count shown on the "All" pill. */
  total: number;
  /** Count per category id. */
  counts: Record<string, number>;
  /** Leave out categories with nothing in them (the selected one always shows). */
  hideEmpty?: boolean;
}

/** "Category:" row of glass pills with counts, scrolling sideways on narrow screens. */
export function CategoryFilterPills({
  selected,
  onSelect,
  total,
  counts,
  hideEmpty = false,
}: CategoryFilterPillsProps) {
  return (
    // A horizontal scroller also clips vertically: its padding (cancelled by
    // negative margins) leaves room for the selected chip's glow. The wrapper
    // takes the card's space-y margin, so those can collapse.
    <div>
      <div className="no-scrollbar -mx-4 -my-3 flex items-center gap-2 overflow-x-auto px-4 py-5">
        <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-white/40">
          Category:
        </span>
        {MATERIAL_CATEGORIES.map((cat) => {
          const isSelected = selected === cat.id;
          const count = cat.id === "ALL" ? total : counts[cat.id] || 0;
          if (hideEmpty && count === 0 && !isSelected) return null;

          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              aria-pressed={isSelected}
              // Explicit accent: the card's pale cyan would make the fill read as white
              style={
                { "--glass-accent": "34, 211, 238" } as React.CSSProperties
              }
              className="glass-chip glass-chip--fill shrink-0 px-3 py-1.5 text-xs font-semibold"
              title={`${cat.label} (sortRank: ${cat.sortRankRange})`}
            >
              <span>{cat.shortLabel}</span>
              <span
                className={`rounded-full px-1.5 text-[10px] ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-white/10 text-white/60"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
