import React from "react";
import { CheckCircle2, Download, Trash2, Edit2 } from "lucide-react";
import { DetectedItem } from "@/lib/types";

interface ResultGridProps {
  items: DetectedItem[];
  onClear: () => void;
  onExport: () => void;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onRemoveItem: (id: string) => void;
}

export function ResultGrid({
  items,
  onClear,
  onExport,
  onUpdateQuantity,
  onRemoveItem,
}: ResultGridProps) {
  if (items.length === 0) return null;

  return (
    <div className="animate-in fade-in relative space-y-6 overflow-hidden rounded-[2rem] border-[0.5px] border-b-white/5 border-l-white/20 border-r-white/5 border-t-white/30 bg-gradient-to-br from-white/10 via-white/5 to-black/20 p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-2xl duration-500">
      <div className="relative z-10 flex flex-col items-start justify-between gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center">
        <h2 className="text-on-surface flex items-center gap-2 text-2xl font-bold">
          <CheckCircle2 className="h-6 w-6 text-success" />
          Scanned Inventory
          <span className="ml-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
            {items.length} items
          </span>
        </h2>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <button
            onClick={onClear}
            className="flex flex-1 items-center justify-center rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-error transition-colors hover:border-error/20 hover:bg-error/10 sm:flex-none"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Clear All
          </button>
          <button
            onClick={onExport}
            className="flex flex-1 items-center justify-center rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow sm:flex-none"
          >
            <Download className="mr-2 h-4 w-4" /> Export .GOOD
          </button>
        </div>
      </div>

      <div className="relative z-10 grid max-h-[60vh] grid-cols-2 gap-4 overflow-y-auto p-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((item) => {
          const rarity = item.rarity || 1;
          const rarityBorder =
            rarity === 5
              ? "border-amber-500/50 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
              : rarity === 4
                ? "border-purple-500/50 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                : rarity === 3
                  ? "border-blue-500/40 hover:border-blue-400"
                  : rarity === 2
                    ? "border-emerald-500/40 hover:border-emerald-400"
                    : "border-white/10 hover:border-white/30";

          return (
            <div
              key={item.id}
              className={`group flex flex-col rounded-xl border-[0.5px] bg-gradient-to-br from-white/10 to-transparent p-4 ${rarityBorder} relative items-center text-center shadow-[0_4px_16px_rgba(0,0,0,0.2)] backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]`}
            >
              <button
                onClick={() => onRemoveItem(item.id)}
                className="text-on-surface-variant absolute right-2 top-2 z-10 rounded-md p-1 opacity-0 transition-opacity hover:bg-error/10 hover:text-error group-hover:opacity-100"
                title="Remove item"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <div className="relative mb-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/30 shadow-[inset_0_2px_10px_rgba(0,0,0,0.4)]">
                <img
                  src={`/images/materials/${item.id}.png`}
                  alt={item.name}
                  className="h-12 w-12 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement!.innerHTML =
                      '<span class="text-xs text-on-surface-variant">No Img</span>';
                  }}
                />
              </div>

              {/* Rarity Star Badges */}
              {item.rarity && item.rarity >= 1 ? (
                <div className="mb-1.5 flex items-center justify-center gap-0.5 text-xs font-bold text-amber-400 drop-shadow">
                  {Array.from({ length: item.rarity }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
              ) : (
                <div className="mb-1 h-4" />
              )}

              <span
                className="text-on-surface line-clamp-2 min-h-[40px] w-full text-sm font-semibold"
                title={item.name}
              >
                {item.name}
              </span>
              <div className="mt-3 flex w-full items-center overflow-hidden rounded-lg border-[0.5px] border-white/10 border-t-black/50 bg-black/30 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] transition-colors group-hover:border-primary/50">
                <button
                  onClick={() =>
                    onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
                  }
                  className="text-on-surface bg-white/5 px-2 py-1 font-bold transition-colors hover:bg-white/20 hover:text-primary"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    onUpdateQuantity(item.id, parseInt(e.target.value) || 1)
                  }
                  className="text-on-surface w-full border-none bg-transparent p-1 text-center text-sm font-medium drop-shadow-md focus:outline-none focus:ring-0"
                />
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="text-on-surface bg-white/5 px-2 py-1 font-bold transition-colors hover:bg-white/20 hover:text-primary"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
