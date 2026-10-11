"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  GridConfig,
  autoDetectGrid,
  GENSHIN_1080P_GRID,
} from "@/lib/cv/grid-detector";
import {
  X,
  Sparkles,
  RotateCcw,
  Sliders,
  CopyCheck,
  Check,
  Image as ImageIcon,
  Play,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

export interface ImageLayoutItem {
  file: File;
  bitmap: ImageBitmap | null;
  config: GridConfig;
  width: number;
  height: number;
}

interface GridLayoutModalProps {
  isOpen: boolean;
  files: File[];
  onClose: () => void;
  onConfirmScan: (configs: GridConfig[]) => void;
}

export function GridLayoutModal({
  isOpen,
  files,
  onClose,
  onConfirmScan,
}: GridLayoutModalProps) {
  const [imageItems, setImageItems] = useState<ImageLayoutItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load bitmaps and auto-detect grid for every file on open
  useEffect(() => {
    if (!isOpen || files.length === 0) {
      setImageItems([]);
      setSelectedIndex(0);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);

    async function loadFiles() {
      const items: ImageLayoutItem[] = [];
      for (const file of files) {
        try {
          const bitmap = await createImageBitmap(file);
          const config = autoDetectGrid(bitmap.width, bitmap.height);
          items.push({
            file,
            bitmap,
            config,
            width: bitmap.width,
            height: bitmap.height,
          });
        } catch (e) {
          console.error("Failed to load image for grid layout:", file.name, e);
        }
      }

      if (!isCancelled) {
        setImageItems(items);
        setSelectedIndex(0);
        setIsLoading(false);
      }
    }

    loadFiles();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, files]);

  // Current item
  const currentItem = imageItems[selectedIndex];

  // Draw overlay on canvas
  useEffect(() => {
    if (!canvasRef.current || !currentItem || !currentItem.bitmap) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { bitmap, config } = currentItem;

    // Use full bitmap resolution for sharp lines, CSS will scale down
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    // Calculate display line widths based on resolution
    const lineW = Math.max(2, Math.round(bitmap.width / 960));

    // Draw grid cells
    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.columns; c++) {
        const x = config.startX + c * (config.cellWidth + config.gapX);
        const y = config.startY + r * (config.cellHeight + config.gapY);
        const w = config.cellWidth;
        const h = config.cellHeight;

        // Skip if outside canvas
        if (x + w < 0 || y + h < 0 || x > canvas.width || y > canvas.height) {
          continue;
        }

        // Cell boundary (Red with subtle fill)
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = lineW;
        ctx.strokeRect(x, y, w, h);
        ctx.fillStyle = "rgba(239, 68, 68, 0.05)";
        ctx.fillRect(x, y, w, h);

        // Icon boundary (Blue)
        const iconX = x + w * 0.06;
        const iconY = y + h * 0.05;
        const iconW = w * 0.88;
        const iconH = h * 0.65;
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = Math.max(1.5, lineW * 0.8);
        ctx.strokeRect(iconX, iconY, iconW, iconH);

        // Quantity boundary (Green)
        const qtyX = x + w * 0.05;
        const qtyY = y + h * 0.86;
        const qtyW = w * 0.9;
        const qtyH = h * 0.13;
        ctx.strokeStyle = "#4ade80";
        ctx.lineWidth = Math.max(1.5, lineW * 0.8);
        ctx.strokeRect(qtyX, qtyY, qtyW, qtyH);
      }
    }
  }, [currentItem]);

  const updateCurrentConfig = (field: keyof GridConfig, value: number) => {
    if (!currentItem) return;
    const safeValue = Math.max(0, value);
    setImageItems((prev) =>
      prev.map((item, idx) =>
        idx === selectedIndex
          ? {
              ...item,
              config: {
                ...item.config,
                [field]: safeValue,
              },
            }
          : item,
      ),
    );
  };

  const handleAutoDetectCurrent = () => {
    if (!currentItem || !currentItem.bitmap) return;
    const detected = autoDetectGrid(
      currentItem.bitmap.width,
      currentItem.bitmap.height,
    );
    setImageItems((prev) =>
      prev.map((item, idx) =>
        idx === selectedIndex ? { ...item, config: detected } : item,
      ),
    );
    toast.success("Grid re-detected for current image!");
  };

  const handleReset1080p = () => {
    if (!currentItem) return;
    setImageItems((prev) =>
      prev.map((item, idx) =>
        idx === selectedIndex ? { ...item, config: GENSHIN_1080P_GRID } : item,
      ),
    );
    toast.info("Reset to standard 1080p grid.");
  };

  const handleApplyToAll = () => {
    if (!currentItem) return;
    const currentConfig = { ...currentItem.config };
    setImageItems((prev) =>
      prev.map((item) => ({
        ...item,
        config: { ...currentConfig },
      })),
    );
    toast.success(
      `Applied layout from Image ${selectedIndex + 1} to all ${imageItems.length} images!`,
    );
  };

  const handleConfirm = () => {
    const configs = imageItems.map((item) => item.config);
    onConfirmScan(configs);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border-[0.5px] border-b-white/5 border-l-white/20 border-r-white/5 border-t-white/30 bg-gradient-to-br from-neutral-900/95 via-neutral-900/90 to-black/95 text-white shadow-[0_20px_50px_0_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-2xl">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/10 bg-primary/20 p-2 text-primary shadow-inner">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white drop-shadow-sm">
                Grid Layout Configuration
              </h2>
              <p className="text-xs text-white/60">
                Auto-detected layouts for uploaded screenshots. Fine-tune if
                needed before scanning.
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

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex h-64 flex-col items-center justify-center space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm font-medium text-white/70">
                Analyzing uploaded images and detecting grid layouts...
              </p>
            </div>
          ) : imageItems.length === 0 ? (
            <div className="p-8 text-center text-sm text-white/70">
              No images loaded.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Image Tabs (if multiple images) */}
              {imageItems.length > 1 && (
                <div className="flex items-center justify-between gap-3 overflow-x-auto rounded-2xl border border-white/10 bg-black/20 p-2">
                  <div className="flex items-center gap-2 overflow-x-auto">
                    {imageItems.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedIndex(idx)}
                        className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                          idx === selectedIndex
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "border border-white/5 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                        <span>
                          Image {idx + 1} ({item.width}×{item.height})
                        </span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleApplyToAll}
                    className="flex flex-shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-white/20 active:scale-95"
                    title="Apply current layout parameters to all uploaded images"
                  >
                    <CopyCheck className="h-3.5 w-3.5 text-primary" />
                    <span className="hidden sm:inline">Apply to All</span>
                  </button>
                </div>
              )}

              {/* Grid Preview and Controls Layout */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Canvas Canvas Preview (7 cols on lg) */}
                <div className="flex flex-col space-y-3 lg:col-span-7">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white/90">
                      {currentItem?.file.name}
                      <span className="ml-2 font-normal text-white/50">
                        ({currentItem?.width} × {currentItem?.height})
                      </span>
                    </span>
                    <div className="flex items-center gap-3 font-medium">
                      <span className="flex items-center gap-1 text-red-400">
                        <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                        Cell
                      </span>
                      <span className="flex items-center gap-1 text-sky-400">
                        <span className="inline-block h-2 w-2 rounded-full bg-sky-400" />
                        Icon
                      </span>
                      <span className="flex items-center gap-1 text-green-400">
                        <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
                        Qty
                      </span>
                    </div>
                  </div>

                  <div className="relative flex max-h-[360px] w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-inner">
                    <canvas
                      ref={canvasRef}
                      className="block max-h-[360px] w-full object-contain"
                    />
                  </div>

                  {/* Actions for current image */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-xs text-white/50">
                      Grid: {currentItem?.config.columns} cols ×{" "}
                      {currentItem?.config.rows} rows (
                      {(currentItem?.config.columns || 0) *
                        (currentItem?.config.rows || 0)}{" "}
                      slots)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleAutoDetectCurrent}
                        className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/20 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/30"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Auto-Detect
                      </button>
                      <button
                        onClick={handleReset1080p}
                        className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
                      >
                        <RotateCcw className="h-3 w-3" />
                        1080p Default
                      </button>
                    </div>
                  </div>
                </div>

                {/* Adjust Sliders (5 cols on lg) */}
                <div className="flex flex-col justify-between space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 lg:col-span-5">
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/60">
                      Grid Dimension Controls
                    </h3>

                    {/* Columns & Rows */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-white/80">
                          <span>Columns</span>
                          <span className="text-primary">
                            {currentItem?.config.columns}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={currentItem?.config.columns || 7}
                          onChange={(e) =>
                            updateCurrentConfig(
                              "columns",
                              parseInt(e.target.value),
                            )
                          }
                          className="w-full accent-primary"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-white/80">
                          <span>Rows</span>
                          <span className="text-primary">
                            {currentItem?.config.rows}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="8"
                          value={currentItem?.config.rows || 4}
                          onChange={(e) =>
                            updateCurrentConfig(
                              "rows",
                              parseInt(e.target.value),
                            )
                          }
                          className="w-full accent-primary"
                        />
                      </div>
                    </div>

                    {/* Start X & Start Y */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-white/80">
                          <span>Start X</span>
                          <span className="text-primary">
                            {currentItem?.config.startX}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={Math.max(1000, currentItem?.width || 1920)}
                          value={currentItem?.config.startX || 0}
                          onChange={(e) =>
                            updateCurrentConfig(
                              "startX",
                              parseInt(e.target.value),
                            )
                          }
                          className="w-full accent-primary"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-white/80">
                          <span>Start Y</span>
                          <span className="text-primary">
                            {currentItem?.config.startY}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={Math.max(600, currentItem?.height || 1080)}
                          value={currentItem?.config.startY || 0}
                          onChange={(e) =>
                            updateCurrentConfig(
                              "startY",
                              parseInt(e.target.value),
                            )
                          }
                          className="w-full accent-primary"
                        />
                      </div>
                    </div>

                    {/* Cell Width & Cell Height */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-white/80">
                          <span>Cell Width</span>
                          <span className="text-primary">
                            {currentItem?.config.cellWidth}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="400"
                          value={currentItem?.config.cellWidth || 153}
                          onChange={(e) =>
                            updateCurrentConfig(
                              "cellWidth",
                              parseInt(e.target.value),
                            )
                          }
                          className="w-full accent-primary"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-white/80">
                          <span>Cell Height</span>
                          <span className="text-primary">
                            {currentItem?.config.cellHeight}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="400"
                          value={currentItem?.config.cellHeight || 189}
                          onChange={(e) =>
                            updateCurrentConfig(
                              "cellHeight",
                              parseInt(e.target.value),
                            )
                          }
                          className="w-full accent-primary"
                        />
                      </div>
                    </div>

                    {/* Gap X & Gap Y */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-white/80">
                          <span>Gap X</span>
                          <span className="text-primary">
                            {currentItem?.config.gapX}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={currentItem?.config.gapX || 30}
                          onChange={(e) =>
                            updateCurrentConfig(
                              "gapX",
                              parseInt(e.target.value),
                            )
                          }
                          className="w-full accent-primary"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-white/80">
                          <span>Gap Y</span>
                          <span className="text-primary">
                            {currentItem?.config.gapY}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={currentItem?.config.gapY || 28}
                          onChange={(e) =>
                            updateCurrentConfig(
                              "gapY",
                              parseInt(e.target.value),
                            )
                          }
                          className="w-full accent-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] leading-relaxed text-white/50">
                    Adjust the sliders so red outlines align with the item card
                    borders. The blue box should isolate the material icon, and
                    green box should cover the quantity number.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 items-center justify-between border-t border-white/10 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition-all hover:bg-white/10 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || imageItems.length === 0}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-lg active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>
              {imageItems.length > 1
                ? `Start Scan (${imageItems.length} Images)`
                : "Start Scan"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
