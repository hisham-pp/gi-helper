"use client";

import React, { useState } from "react";
import {
  GridConfig,
  autoDetectGrid,
  GENSHIN_1080P_GRID,
} from "@/lib/cv/grid-detector";
import {
  Sliders,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

interface GridControlsProps {
  imageBitmap: ImageBitmap | null;
  config: GridConfig;
  onChange: (newConfig: GridConfig) => void;
}

export function GridControls({
  imageBitmap,
  config,
  onChange,
}: GridControlsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleUpdate = (field: keyof GridConfig, val: number) => {
    onChange({
      ...config,
      [field]: Math.max(0, val),
    });
  };

  const handleAutoDetect = () => {
    if (!imageBitmap) return;
    const detected = autoDetectGrid(imageBitmap.width, imageBitmap.height);
    onChange(detected);
    toast.success("Grid auto-detected for current resolution!");
  };

  const handleReset1080p = () => {
    onChange(GENSHIN_1080P_GRID);
    toast.info("Reset to standard 1080p grid.");
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopied(true);
    toast.success("Grid configuration copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative space-y-4 rounded-3xl border-[0.5px] border-b-white/5 border-l-white/20 border-r-white/5 border-t-white/30 bg-gradient-to-br from-white/10 via-white/5 to-black/30 p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-on-surface flex items-center gap-2 text-sm font-bold transition-colors hover:text-primary sm:text-base"
        >
          <Sliders className="h-4 w-4 text-primary" />
          <span>Grid Layout Calibration</span>
          {isExpanded ? (
            <ChevronUp className="text-on-surface/50 h-4 w-4" />
          ) : (
            <ChevronDown className="text-on-surface/50 h-4 w-4" />
          )}
        </button>

        <div className="flex items-center gap-2">
          {imageBitmap && (
            <button
              onClick={handleAutoDetect}
              className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/20 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm transition-all hover:bg-primary/30"
              title="Automatically calculate grid based on screen resolution & aspect ratio"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Auto-Detect</span>
            </button>
          )}

          <button
            onClick={handleReset1080p}
            className="text-on-surface/70 hover:text-on-surface flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium transition-all hover:bg-white/10"
            title="Reset to 1080p defaults"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">1080p</span>
          </button>

          <button
            onClick={handleCopyJson}
            className="text-on-surface/70 hover:text-on-surface rounded-xl border border-white/10 bg-white/5 p-1.5 text-xs transition-all hover:bg-white/10"
            title="Copy Config JSON"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-success" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="animate-in fade-in grid grid-cols-2 gap-3.5 border-t border-white/10 pt-2 duration-300 sm:grid-cols-4">
          {/* Columns */}
          <div className="space-y-1">
            <div className="text-on-surface flex justify-between text-xs font-semibold">
              <span>Columns</span>
              <span className="font-mono text-primary">{config.columns}</span>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              value={config.columns}
              onChange={(e) =>
                handleUpdate("columns", parseInt(e.target.value))
              }
              className="h-1.5 w-full cursor-pointer rounded-lg bg-black/40 accent-primary"
            />
          </div>

          {/* Rows */}
          <div className="space-y-1">
            <div className="text-on-surface flex justify-between text-xs font-semibold">
              <span>Rows</span>
              <span className="font-mono text-primary">{config.rows}</span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              value={config.rows}
              onChange={(e) => handleUpdate("rows", parseInt(e.target.value))}
              className="h-1.5 w-full cursor-pointer rounded-lg bg-black/40 accent-primary"
            />
          </div>

          {/* Start X */}
          <div className="space-y-1">
            <div className="text-on-surface flex justify-between text-xs font-semibold">
              <span>Start X</span>
              <span className="font-mono text-primary">{config.startX} px</span>
            </div>
            <input
              type="range"
              min={0}
              max={imageBitmap ? Math.round(imageBitmap.width * 0.7) : 1000}
              value={config.startX}
              onChange={(e) => handleUpdate("startX", parseInt(e.target.value))}
              className="h-1.5 w-full cursor-pointer rounded-lg bg-black/40 accent-primary"
            />
          </div>

          {/* Start Y */}
          <div className="space-y-1">
            <div className="text-on-surface flex justify-between text-xs font-semibold">
              <span>Start Y</span>
              <span className="font-mono text-primary">{config.startY} px</span>
            </div>
            <input
              type="range"
              min={0}
              max={imageBitmap ? Math.round(imageBitmap.height * 0.7) : 800}
              value={config.startY}
              onChange={(e) => handleUpdate("startY", parseInt(e.target.value))}
              className="h-1.5 w-full cursor-pointer rounded-lg bg-black/40 accent-primary"
            />
          </div>

          {/* Cell Width */}
          <div className="space-y-1">
            <div className="text-on-surface flex justify-between text-xs font-semibold">
              <span>Cell Width</span>
              <span className="font-mono text-primary">
                {config.cellWidth} px
              </span>
            </div>
            <input
              type="range"
              min={40}
              max={300}
              value={config.cellWidth}
              onChange={(e) =>
                handleUpdate("cellWidth", parseInt(e.target.value))
              }
              className="h-1.5 w-full cursor-pointer rounded-lg bg-black/40 accent-primary"
            />
          </div>

          {/* Cell Height */}
          <div className="space-y-1">
            <div className="text-on-surface flex justify-between text-xs font-semibold">
              <span>Cell Height</span>
              <span className="font-mono text-primary">
                {config.cellHeight} px
              </span>
            </div>
            <input
              type="range"
              min={40}
              max={350}
              value={config.cellHeight}
              onChange={(e) =>
                handleUpdate("cellHeight", parseInt(e.target.value))
              }
              className="h-1.5 w-full cursor-pointer rounded-lg bg-black/40 accent-primary"
            />
          </div>

          {/* Gap X */}
          <div className="space-y-1">
            <div className="text-on-surface flex justify-between text-xs font-semibold">
              <span>Gap X</span>
              <span className="font-mono text-primary">{config.gapX} px</span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              value={config.gapX}
              onChange={(e) => handleUpdate("gapX", parseInt(e.target.value))}
              className="h-1.5 w-full cursor-pointer rounded-lg bg-black/40 accent-primary"
            />
          </div>

          {/* Gap Y */}
          <div className="space-y-1">
            <div className="text-on-surface flex justify-between text-xs font-semibold">
              <span>Gap Y</span>
              <span className="font-mono text-primary">{config.gapY} px</span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              value={config.gapY}
              onChange={(e) => handleUpdate("gapY", parseInt(e.target.value))}
              className="h-1.5 w-full cursor-pointer rounded-lg bg-black/40 accent-primary"
            />
          </div>
        </div>
      )}
    </div>
  );
}
