"use client";

import React, { memo, useCallback, useDeferredValue, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { MaterialItem, ScannedReviewItem } from "@/lib/types";
import {
  getAllMaterials,
  MATERIAL_CATEGORIES,
  MaterialCategory,
  getMaterialCategoryId,
  getRarityStyles,
} from "@/lib/materials";
import { MaterialThumb } from "@/components/ui/MaterialThumb";
import { useModalMotion } from "@/lib/use-modal-motion";

/** Most options rendered at once; narrowing the search shows the rest. */
const MAX_OPTIONS = 100;

interface MaterialPickerModalProps {
  /** Review slot being reassigned (its crop and current material are shown). */
  item: ScannedReviewItem;
  onSelect: (slotId: string, material: MaterialItem) => void;
  onClose: () => void;
}

/**
 * Material picker opened from the scan review modal's "Change" button.
 * Kept separate (and loaded on demand) so its filter state re-renders only
 * the picker, not every review row behind it.
 */
export function MaterialPickerModal({ item, onSelect, onClose }: MaterialPickerModalProps) {
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerCategory, setPickerCategory] = useState<MaterialCategory>("ALL");
  const [pickerRarity, setPickerRarity] = useState<number | null>(item.rarity ?? null);

  const allMaterials = useMemo(() => getAllMaterials(), []);

  // Typing stays responsive; the grid catches up in a background render
  const deferredSearch = useDeferredValue(pickerSearch);

  const filteredMaterials = useMemo(() => {
    const q = deferredSearch.toLowerCase().trim();
    return allMaterials.filter((m) => {
      if (pickerCategory !== "ALL" && getMaterialCategoryId(m) !== pickerCategory) {
        return false;
      }
      if (pickerRarity !== null && m.rarity !== pickerRarity) {
        return false;
      }
      if (q) {
        return (
          m.name.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          (m.family && m.family.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allMaterials, deferredSearch, pickerCategory, pickerRarity]);

  const { dialogRef, backdropRef, close, closeThen } = useModalMotion(onClose);

  // Picking closes the picker too, so assign once its exit has played
  const handleSelect = useCallback(
    (material: MaterialItem) => closeThen(() => onSelect(item.id, material)),
    [closeThen, onSelect, item.id],
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6">
      <div
        ref={backdropRef}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={close}
      />
      <div
        ref={dialogRef}
        className="glass-card glass-card--lg glass-card--raised relative z-10 flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="glass-well relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl">
              {item.imageSnippet ? (
                <img
                  src={item.imageSnippet}
                  alt="Target crop"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-[10px] text-white/40">Crop</span>
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Select Material
              </h3>
              <p className="text-xs text-white/60">
                Comparing against detected crop. Currently:{" "}
                <span className="font-semibold text-white/90">
                  {item.name}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={close}
            className="glass-icon-btn h-8 w-8 rounded-full"
            aria-label="Close picker"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-2 border-b border-white/10 p-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
            <input
              type="text"
              placeholder="Search material by name, category, or type..."
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              autoFocus
              className="glass-input w-full rounded-full py-2 pl-10 pr-3 text-xs"
            />
          </div>

          {/* Category Pills & Rarity Stars Filter */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex flex-wrap items-center gap-1">
              {MATERIAL_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setPickerCategory(cat.id)}
                  aria-pressed={pickerCategory === cat.id}
                  className="glass-chip px-2.5 py-1 text-[11px] font-semibold"
                >
                  {cat.shortLabel}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPickerRarity(null)}
                aria-pressed={pickerRarity === null}
                className="glass-chip px-2.5 py-0.5 text-[11px] font-semibold"
              >
                All ★
              </button>
              {[5, 4, 3, 2, 1].map((r) => (
                <button
                  key={r}
                  onClick={() => setPickerRarity(pickerRarity === r ? null : r)}
                  aria-pressed={pickerRarity === r}
                  style={{ "--glass-accent": getRarityStyles(r).accent } as React.CSSProperties}
                  className="glass-chip px-2.5 py-0.5 text-[11px] font-bold"
                >
                  <span className={getRarityStyles(r).starColor}>{r}★</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Material Grid / List */}
        <div className="max-h-[55vh] flex-1 overflow-y-auto p-4">
          {filteredMaterials.length === 0 ? (
            <div className="py-12 text-center text-xs text-white/50">
              No materials found matching your filters.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 p-1 sm:grid-cols-3 md:grid-cols-4">
              {filteredMaterials.slice(0, MAX_OPTIONS).map((mat) => (
                <PickerOption
                  key={mat.id}
                  material={mat}
                  isSelected={mat.id === item.materialId}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface PickerOptionProps {
  material: MaterialItem;
  isSelected: boolean;
  onSelect: (material: MaterialItem) => void;
}

const PickerOption = memo(function PickerOption({ material, isSelected, onSelect }: PickerOptionProps) {
  const styles = getRarityStyles(material.rarity);
  return (
    <button
      onClick={() => onSelect(material)}
      aria-pressed={isSelected}
      data-active={isSelected}
      style={{ "--glass-accent": styles.accent } as React.CSSProperties}
      className="glass-card glass-card--hover flex flex-col items-center gap-2 rounded-2xl p-2.5 text-center hover:transform-none active:scale-95 motion-safe:hover:animate-squish"
    >
      <div className="glass-well glass-well--tinted relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl">
        <MaterialThumb id={material.id} alt={material.name} size={40} className="h-10 w-10" />
      </div>
      <div className="w-full">
        <div className="line-clamp-2 text-[11px] font-bold text-white/90">
          {material.name}
        </div>
        {material.rarity && (
          <div className={`text-[10px] font-bold ${styles.starColor}`}>
            {"★".repeat(material.rarity)}
          </div>
        )}
      </div>
    </button>
  );
});
