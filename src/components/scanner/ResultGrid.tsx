import React, { memo } from "react";
import { Trash2 } from "lucide-react";
import { DetectedItem } from "@/lib/types";
import { getRarityStyles } from "@/lib/material-ui";
import { MaterialThumb } from "@/components/ui/MaterialThumb";

interface ResultGridProps {
  items: DetectedItem[];
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onRemoveItem: (id: string) => void;
}

/**
 * The scanned inventory's cards (the /inventory page; its header holds the
 * count, Clear All and export). Memoized: pass stable callbacks so typing
 * elsewhere on the page doesn't re-render every card.
 */
export const ResultGrid = memo(function ResultGrid({
  items,
  onUpdateQuantity,
  onRemoveItem,
}: ResultGridProps) {
  if (items.length === 0) return null;

  return (
    <div className="glass-card glass-card--lg p-5 sm:p-8">
      <div className="relative z-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((item) => (
          <ResultCard
            key={item.id}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
          />
        ))}
      </div>
    </div>
  );
});

interface ResultCardProps {
  item: DetectedItem;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onRemoveItem: (id: string) => void;
}

/** One inventory card; re-renders only when its own item changes. */
const ResultCard = memo(function ResultCard({ item, onUpdateQuantity, onRemoveItem }: ResultCardProps) {
  const rarityStyles = getRarityStyles(item.rarity || 1);

  return (
    <div
      // Rarity colour tints the glass rim and edge glow
      style={{ "--glass-accent": rarityStyles.accent } as React.CSSProperties}
      // Squishes on hover like the material cards, instead of lifting
      className="glass-card glass-card--hover group flex flex-col items-center p-4 text-center hover:transform-none motion-safe:hover:animate-squish"
    >
      <button
        onClick={() => onRemoveItem(item.id)}
        className="glass-icon-btn absolute right-2 top-2 z-10 h-7 w-7 rounded-lg opacity-0 transition-opacity hover:text-rose-300 group-hover:opacity-100 focus-visible:opacity-100"
        title="Remove item"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      <div className="glass-well glass-well--tinted relative mb-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl">
        <MaterialThumb
          id={item.id}
          alt={item.name}
          size={48}
          className="h-12 w-12"
          fallback={<span className="text-xs text-on-surface-variant">No Img</span>}
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
});
