"use client";

import React from "react";
import { MATERIAL_CATEGORIES, MaterialCategory } from "@/lib/materials/ui";
import { PillTabs } from "@/components/ui/PillTabs";

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

/** "Category:" row of glass tabs with counts, scrolling sideways on narrow screens. */
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
        <PillTabs
          ariaLabel="Category"
          value={selected}
          onChange={onSelect}
          options={MATERIAL_CATEGORIES.flatMap((cat) => {
            const count = cat.id === "ALL" ? total : counts[cat.id] || 0;
            if (hideEmpty && count === 0 && selected !== cat.id) return [];
            return [
              {
                value: cat.id,
                label: cat.shortLabel,
                count,
                // Explicit accent: the card's pale cyan would make the fill read as white
                accent: cat.accent,
                title: `${cat.label} (sortRank: ${cat.sortRankRange})`,
              },
            ];
          })}
        />
      </div>
    </div>
  );
}
