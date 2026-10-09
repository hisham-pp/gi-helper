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

export function ResultGrid({ items, onClear, onExport, onUpdateQuantity, onRemoveItem }: ResultGridProps) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-outline-variant pb-4 gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-on-surface">
          <CheckCircle2 className="h-6 w-6 text-success" />
          Scanned Inventory
          <span className="bg-primary/10 text-primary text-sm py-1 px-3 rounded-full ml-2">
            {items.length} items
          </span>
        </h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={onClear} 
            className="flex-1 sm:flex-none text-error hover:bg-error/10 flex items-center justify-center px-4 py-2 rounded-lg font-medium text-sm transition-colors border border-transparent hover:border-error/20"
          >
            <Trash2 className="h-4 w-4 mr-2" /> Clear All
          </button>
          <button 
            onClick={onExport} 
            className="flex-1 sm:flex-none bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center px-5 py-2 rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow"
          >
            <Download className="h-4 w-4 mr-2" /> Export .GOOD
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-outline-variant scrollbar-track-transparent">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="group flex flex-col p-4 rounded-xl bg-surface-variant/30 border border-outline-variant hover:border-primary/50 hover:bg-surface-variant/50 transition-all items-center text-center relative shadow-sm hover:shadow"
          >
            <button 
              onClick={() => onRemoveItem(item.id)}
              className="absolute top-2 right-2 p-1 rounded-md text-on-surface-variant hover:bg-error/10 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <div className="w-16 h-16 mb-3 rounded-lg overflow-hidden bg-surface flex items-center justify-center shadow-inner relative">
              <img 
                src={`/images/materials/${item.id}.png`} 
                alt={item.name} 
                className="w-12 h-12 object-contain" 
                onError={(e) => { 
                  e.currentTarget.style.display = 'none'; 
                  e.currentTarget.parentElement!.innerHTML = '<span class="text-xs text-on-surface-variant">No Img</span>';
                }} 
              />
            </div>
            <span className="font-semibold text-sm line-clamp-2 text-on-surface w-full min-h-[40px]" title={item.name}>
              {item.name}
            </span>
            <div className="mt-3 flex items-center w-full bg-surface rounded-lg border border-outline-variant overflow-hidden group-hover:border-primary/30 transition-colors">
              <button 
                onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                className="px-2 py-1 bg-surface-variant/50 hover:bg-surface-variant hover:text-primary transition-colors font-bold"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                className="w-full text-center text-sm font-medium bg-transparent border-none focus:outline-none focus:ring-0 p-1"
              />
              <button 
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                className="px-2 py-1 bg-surface-variant/50 hover:bg-surface-variant hover:text-primary transition-colors font-bold"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
