import React from "react";
import { CheckCircle2, Download, Trash2, Edit2 } from "lucide-react";
import { DetectedItem } from "@/lib/types";
import { getRarityStyles } from "@/lib/materials";

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
    <div className="glass-card glass-card--lg animate-in fade-in space-y-5 overflow-hidden p-5 duration-500 sm:p-8">
      <div className="relative z-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="flex items-center gap-2 text-xl font-bold text-white sm:text-2xl">
          <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          Scanned Inventory
          <span className="glass-chip ml-2 px-3 py-1 text-sm font-semibold text-cyan-200">
            {items.length} items
          </span>
        </h2>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <button
            onClick={onClear}
            className="glass-btn glass-btn--danger flex-1 justify-center px-4 py-2 text-sm sm:flex-none"
          >
            <Trash2 className="h-4 w-4" /> Clear All
          </button>
          <button
            onClick={onExport}
            className="glass-btn glass-btn--primary flex-1 justify-center px-5 py-2 text-sm sm:flex-none"
          >
            <Download className="h-4 w-4" /> Export .GOOD
          </button>
        </div>
      </div>

      <div className="glass-divider" />

      <div className="relative z-10 -m-2 grid max-h-[60vh] grid-cols-2 gap-4 overflow-y-auto p-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((item) => {
          const rarityStyles = getRarityStyles(item.rarity || 1);

          return (
            <div
              key={item.id}
              // Rarity colour tints the glass rim and edge glow
              style={{ "--glass-accent": rarityStyles.accent } as React.CSSProperties}
              className="glass-card glass-card--hover group flex flex-col items-center p-4 text-center"
            >
              <button
                onClick={() => onRemoveItem(item.id)}
                className="glass-icon-btn absolute right-2 top-2 z-10 h-7 w-7 rounded-lg opacity-0 transition-opacity hover:text-rose-300 group-hover:opacity-100 focus-visible:opacity-100"
                title="Remove item"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>

              <div className="glass-well glass-well--tinted relative mb-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl">
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
                <div className={`mb-1.5 flex items-center justify-center gap-0.5 text-xs font-bold drop-shadow ${rarityStyles.starColor}`}>
                  {Array.from({ length: item.rarity }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
              ) : (
                <div className="mb-1 h-4" />
              )}

              <span
                className="line-clamp-2 min-h-[40px] w-full text-sm font-semibold text-white"
                title={item.name}
              >
                {item.name}
              </span>
              <div className="glass-well mt-3 flex w-full items-center overflow-hidden rounded-full">
                <button
                  onClick={() =>
                    onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
                  }
                  className="px-2.5 py-1 font-bold text-white/70 transition-colors hover:bg-white/10 hover:text-cyan-200"
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
                  className="w-full border-none bg-transparent p-1 text-center text-sm font-semibold text-cyan-100 focus:outline-none focus:ring-0"
                />
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="px-2.5 py-1 font-bold text-white/70 transition-colors hover:bg-white/10 hover:text-cyan-200"
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
