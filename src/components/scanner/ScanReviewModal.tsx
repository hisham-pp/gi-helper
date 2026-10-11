"use client";

import React, { useState, useEffect } from "react";
import { ScannedReviewItem, DetectedItem } from "@/lib/types";
import {
  CheckCircle2,
  Trash2,
  X,
  Plus,
  Minus,
  Check,
  ArrowRight,
  Sparkles,
  Search,
} from "lucide-react";
import { toast } from "sonner";

interface ScanReviewModalProps {
  isOpen: boolean;
  reviewItems: ScannedReviewItem[];
  onClose: () => void;
  onConfirm: (confirmedItems: DetectedItem[]) => void;
}

export function ScanReviewModal({
  isOpen,
  reviewItems,
  onClose,
  onConfirm,
}: ScanReviewModalProps) {
  const [items, setItems] = useState<ScannedReviewItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      setItems(reviewItems);
      setSearchQuery("");
    }
  }, [isOpen, reviewItems]);

  if (!isOpen) return null;

  const handleUpdateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }),
    );
  };

  const handleSetQuantity = (id: string, qty: number) => {
    const safeQty = Math.max(1, isNaN(qty) ? 1 : qty);
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: safeQty } : item,
      ),
    );
  };

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleConfirm = () => {
    if (items.length === 0) {
      toast.info("No items to add.");
      onClose();
      return;
    }

    // Aggregate duplicates across items into final DetectedItem[]
    const aggregatedMap = new Map<string, DetectedItem>();

    for (const item of items) {
      if (aggregatedMap.has(item.materialId)) {
        aggregatedMap.get(item.materialId)!.quantity += item.quantity;
      } else {
        aggregatedMap.set(item.materialId, {
          id: item.materialId,
          name: item.name,
          quantity: item.quantity,
          rarity: item.rarity,
        });
      }
    }

    const finalItems = Array.from(aggregatedMap.values());
    onConfirm(finalItems);
    toast.success(`Successfully confirmed ${finalItems.length} materials!`);
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border-[0.5px] border-b-white/5 border-l-white/20 border-r-white/5 border-t-white/30 bg-gradient-to-br from-neutral-900/95 via-neutral-900/90 to-black/95 text-white shadow-[0_20px_50px_0_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-2xl">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/10 bg-emerald-500/20 p-2 text-emerald-400 shadow-inner">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white drop-shadow-sm">
                Review Scan Results
              </h2>
              <p className="text-xs text-white/60">
                Compare screenshot snippets against matched items and adjust
                quantities before saving.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search & Stats Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 bg-black/20 px-6 py-3">
          <div className="relative min-w-[200px] max-w-sm flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search detected items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-1.5 pl-9 pr-3 text-xs text-white placeholder-white/40 outline-none transition-colors focus:border-primary/50"
            />
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="rounded-full bg-white/10 px-3 py-1 font-semibold text-white/80">
              {items.length} detected slots
            </span>
            <span className="rounded-full bg-primary/20 px-3 py-1 font-semibold text-primary">
              Total Qty: {totalQuantity}
            </span>
          </div>
        </div>

        {/* Items List Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {items.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center text-white/60">
              <Sparkles className="mb-2 h-8 w-8 text-white/30" />
              <p className="text-sm font-semibold">All items were removed</p>
              <p className="text-xs text-white/40">
                You can close this window or scan again.
              </p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-white/50">
              No items matching "{searchQuery}"
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const rarity = item.rarity || 1;
                const rarityColor =
                  rarity === 5
                    ? "border-amber-500/40 bg-amber-500/5 shadow-[0_0_12px_rgba(245,158,11,0.1)]"
                    : rarity === 4
                      ? "border-purple-500/40 bg-purple-500/5 shadow-[0_0_12px_rgba(168,85,247,0.1)]"
                      : rarity === 3
                        ? "border-blue-500/30 bg-blue-500/5"
                        : rarity === 2
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : "border-white/10 bg-white/[0.03]";

                return (
                  <div
                    key={item.id}
                    className={`flex flex-col items-center justify-between gap-4 rounded-2xl border p-3 transition-all hover:bg-white/[0.06] sm:flex-row sm:p-4 ${rarityColor}`}
                  >
                    {/* Left: Image Part (Screenshot Crop) */}
                    <div className="flex w-full items-center gap-3 sm:w-auto">
                      <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-black/60 shadow-inner">
                        {item.imageSnippet ? (
                          <img
                            src={item.imageSnippet}
                            alt="Screenshot crop"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] text-white/40">
                            No Crop
                          </span>
                        )}
                        <span className="absolute bottom-0.5 right-1 text-[9px] font-bold text-white/50">
                          Raw
                        </span>
                      </div>

                      <div className="space-y-0.5 text-left">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-white/40">
                          Detected Crop
                        </span>
                        <span className="block max-w-[140px] truncate text-xs text-white/70">
                          {item.sourceImageName}
                        </span>
                        {item.row !== undefined && item.col !== undefined && (
                          <span className="text-[10px] text-white/40">
                            R{item.row + 1} : C{item.col + 1}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle: Arrow indicator */}
                    <div className="hidden text-white/30 sm:flex">
                      <ArrowRight className="h-4 w-4" />
                    </div>

                    {/* Right: Matched Material Result */}
                    <div className="flex w-full flex-1 items-center gap-3 sm:w-auto">
                      <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-black/40 shadow-inner">
                        <img
                          src={`/images/materials/${item.materialId}.png`}
                          alt={item.name}
                          className="h-11 w-11 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement!.innerHTML =
                              '<span class="text-[10px] text-white/40">No Img</span>';
                          }}
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-sm font-bold text-white drop-shadow-sm">
                          {item.name}
                        </span>
                        {item.rarity && item.rarity >= 1 ? (
                          <div className="flex items-center gap-0.5 text-[11px] font-bold text-amber-400">
                            {Array.from({ length: item.rarity }).map((_, i) => (
                              <span key={i}>★</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-white/40">
                            Common
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Adjustment Controls & Remove Button */}
                    <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
                      <div className="flex items-center rounded-xl border border-white/15 bg-black/40 p-1">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                          className="rounded-lg p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
                          title="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleSetQuantity(
                              item.id,
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="w-14 bg-transparent text-center text-sm font-bold text-primary outline-none"
                        />
                        <button
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="rounded-lg p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                          title="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemove(item.id)}
                        className="rounded-xl border border-transparent p-2 text-white/40 transition-colors hover:border-red-500/30 hover:bg-red-500/20 hover:text-red-400"
                        title="Remove item from batch"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 items-center justify-between border-t border-white/10 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition-all hover:bg-white/10 hover:text-white"
          >
            Discard
          </button>
          <button
            onClick={handleConfirm}
            disabled={items.length === 0}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-lg active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            <Check className="h-4 w-4 stroke-[3]" />
            <span>Confirm & Add to Inventory</span>
          </button>
        </div>
      </div>
    </div>
  );
}
