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
    <div className="relative rounded-[2rem] border-[0.5px] border-t-white/30 border-l-white/20 border-b-white/5 border-r-white/5 bg-gradient-to-br from-white/10 via-white/5 to-black/20 p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-2xl space-y-6 animate-in fade-in duration-500 overflow-hidden">
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
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
      
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[60vh] overflow-y-auto p-2">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="group flex flex-col p-4 rounded-xl bg-gradient-to-br from-white/10 to-transparent border-[0.5px] border-t-white/30 border-l-white/20 border-b-white/5 border-r-white/5 hover:border-primary/50 transition-all items-center text-center relative shadow-[0_4px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] backdrop-blur-md hover:-translate-y-1"
          >
            <button 
              onClick={() => onRemoveItem(item.id)}
              className="absolute top-2 right-2 p-1 rounded-md text-on-surface-variant hover:bg-error/10 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <div className="w-16 h-16 mb-3 rounded-lg overflow-hidden bg-black/20 flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)] relative">
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
            <div className="mt-3 flex items-center w-full bg-black/30 rounded-lg border-[0.5px] border-t-black/50 border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] overflow-hidden group-hover:border-primary/50 transition-colors">
              <button 
                onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                className="px-2 py-1 bg-white/5 hover:bg-white/20 hover:text-primary transition-colors font-bold text-on-surface"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                className="w-full text-center text-sm font-medium bg-transparent border-none focus:outline-none focus:ring-0 p-1 text-on-surface drop-shadow-md"
              />
              <button 
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                className="px-2 py-1 bg-white/5 hover:bg-white/20 hover:text-primary transition-colors font-bold text-on-surface"
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
