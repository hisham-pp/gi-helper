"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { GridConfig } from "@/lib/cv/grid-detector";
import { CellDebugData } from "@/lib/cv/debug-types";
import { ZoomIn, ZoomOut, Maximize2, Eye, Layers } from "lucide-react";

interface CanvasGridOverlayProps {
  imageBitmap: ImageBitmap | null;
  gridConfig: GridConfig;
  analyzedCells: Map<string, CellDebugData>;
  selectedCellKey: string | null;
  onSelectCell: (row: number, col: number) => void;
}

export function CanvasGridOverlay({
  imageBitmap,
  gridConfig,
  analyzedCells,
  selectedCellKey,
  onSelectCell,
}: CanvasGridOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Overlay display toggles
  const [showCellBounds, setShowCellBounds] = useState(true);
  const [showIconBounds, setShowIconBounds] = useState(true);
  const [showStarBounds, setShowStarBounds] = useState(true);
  const [showQuantityBounds, setShowQuantityBounds] = useState(true);
  const [showCoordinates, setShowCoordinates] = useState(true);
  const [showDetections, setShowDetections] = useState(true);

  // Zoom level: 1 = fit container, or manual multiplier (0.5, 0.75, 1, 1.25, 1.5, 2)
  const [zoomMode, setZoomMode] = useState<"fit" | "custom">("fit");
  const [customZoom, setCustomZoom] = useState(1);

  // Hover state
  const [hoveredCell, setHoveredCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  // Compute cell from mouse coordinates
  const getCellFromMousePos = useCallback(
    (
      e: React.MouseEvent<HTMLCanvasElement>,
    ): { row: number; col: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas || !imageBitmap) return null;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const imgX = (e.clientX - rect.left) * scaleX;
      const imgY = (e.clientY - rect.top) * scaleY;

      for (let r = 0; r < gridConfig.rows; r++) {
        for (let c = 0; c < gridConfig.columns; c++) {
          const x =
            gridConfig.startX + c * (gridConfig.cellWidth + gridConfig.gapX);
          const y =
            gridConfig.startY + r * (gridConfig.cellHeight + gridConfig.gapY);
          const w = gridConfig.cellWidth;
          const h = gridConfig.cellHeight;

          if (imgX >= x && imgX <= x + w && imgY >= y && imgY <= y + h) {
            return { row: r, col: c };
          }
        }
      }

      return null;
    },
    [imageBitmap, gridConfig],
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cell = getCellFromMousePos(e);
    setHoveredCell(cell);
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cell = getCellFromMousePos(e);
    if (cell) {
      onSelectCell(cell.row, cell.col);
    }
  };

  // Draw on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageBitmap) return;

    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Draw base image
    ctx.drawImage(imageBitmap, 0, 0);

    // 2. Draw grid cells
    for (let row = 0; row < gridConfig.rows; row++) {
      for (let col = 0; col < gridConfig.columns; col++) {
        const x =
          gridConfig.startX + col * (gridConfig.cellWidth + gridConfig.gapX);
        const y =
          gridConfig.startY + row * (gridConfig.cellHeight + gridConfig.gapY);
        const w = gridConfig.cellWidth;
        const h = gridConfig.cellHeight;

        const cellKey = `${row}-${col}`;
        const isSelected = selectedCellKey === cellKey;
        const isHovered = hoveredCell?.row === row && hoveredCell?.col === col;
        const cellData = analyzedCells.get(cellKey);

        // Highlight background for selected / hovered
        if (isSelected) {
          ctx.fillStyle = "rgba(78, 218, 217, 0.25)";
          ctx.fillRect(x, y, w, h);
        } else if (isHovered) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
          ctx.fillRect(x, y, w, h);
        }

        // Draw Cell Bounds (Red / Highlight)
        if (showCellBounds || isSelected || isHovered) {
          ctx.lineWidth = isSelected ? 4 : isHovered ? 3 : 2;
          ctx.strokeStyle = isSelected
            ? "#4edad9" // Cyan for selected
            : isHovered
              ? "#fbbf24" // Amber for hovered
              : cellData?.stats.isEmpty
                ? "rgba(148, 163, 184, 0.4)" // Muted slate for empty
                : "#ef4444"; // Red for normal
          ctx.strokeRect(x, y, w, h);
        }

        // Draw Icon Bounds (Blue)
        if (showIconBounds) {
          const ix = Math.round(x + w * 0.06);
          const iy = Math.round(y + h * 0.05);
          const iw = Math.max(1, Math.round(w * 0.88));
          const ih = Math.max(1, Math.round(h * 0.65));
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = "#3b82f6";
          ctx.strokeRect(ix, iy, iw, ih);
        }

        // Draw Star Detector Bounds (Gold)
        if (showStarBounds) {
          const sx = Math.round(x + w * 0.04);
          const sy = Math.round(y + h * 0.69);
          const sw = Math.max(1, Math.round(w * 0.92));
          const sh = Math.max(1, Math.round(h * 0.17));
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = "#eab308";
          ctx.strokeRect(sx, sy, sw, sh);
        }

        // Draw Number / Quantity Bounds (Green)
        if (showQuantityBounds) {
          const qx = Math.round(x + w * 0.05);
          const qy = Math.round(y + h * 0.86);
          const qw = Math.max(1, Math.round(w * 0.9));
          const qh = Math.max(1, Math.round(h * 0.13));
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = "#22c55e";
          ctx.strokeRect(qx, qy, qw, qh);
        }

        // Draw Coordinates [r, c]
        if (showCoordinates) {
          ctx.font = "bold 14px monospace";
          ctx.fillStyle = "#000000";
          ctx.fillText(`[${row},${col}]`, x + 6, y + 19);
          ctx.fillStyle = isSelected ? "#4edad9" : "#ffffff";
          ctx.fillText(`[${row},${col}]`, x + 5, y + 18);
        }

        // Draw Detection Overlays
        if (showDetections && cellData) {
          if (cellData.stats.isEmpty) {
            // Empty badge
            ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
            ctx.fillRect(x + 4, y + h - 26, w - 8, 20);
            ctx.font = "bold 11px sans-serif";
            ctx.fillStyle = "#94a3b8";
            ctx.textAlign = "center";
            ctx.fillText("EMPTY", x + w / 2, y + h - 12);
            ctx.textAlign = "start";
          } else if (cellData.matched) {
            // Matched badge
            const conf = cellData.matched.confidence;
            const badgeBg =
              conf >= 75
                ? "rgba(16, 185, 129, 0.9)"
                : conf >= 55
                  ? "rgba(245, 158, 11, 0.9)"
                  : "rgba(239, 68, 68, 0.9)";

            ctx.fillStyle = badgeBg;
            ctx.fillRect(x + 4, y + 4, 38, 18);
            ctx.font = "bold 11px sans-serif";
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.fillText(`${conf}%`, x + 23, y + 17);
            ctx.textAlign = "start";

            // If OCR detected quantity
            if (cellData.ocr) {
              ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
              ctx.fillRect(x + w - 40, y + 4, 36, 18);
              ctx.font = "bold 11px sans-serif";
              ctx.fillStyle = "#fbbf24";
              ctx.textAlign = "center";
              ctx.fillText(`x${cellData.ocr.quantity}`, x + w - 22, y + 17);
              ctx.textAlign = "start";
            }
          }
        }
      }
    }
  }, [
    imageBitmap,
    gridConfig,
    analyzedCells,
    selectedCellKey,
    hoveredCell,
    showCellBounds,
    showIconBounds,
    showQuantityBounds,
    showCoordinates,
    showDetections,
  ]);

  if (!imageBitmap) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-black/20 p-16 text-center backdrop-blur-xl">
        <p className="text-on-surface/60 text-lg font-medium">
          No screenshot loaded yet
        </p>
        <p className="text-on-surface/40 mt-1 text-sm">
          Select a sample screenshot or upload an image above.
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-4 rounded-3xl border-[0.5px] border-b-white/5 border-l-white/20 border-r-white/5 border-t-white/30 bg-gradient-to-br from-white/10 via-white/5 to-black/30 p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-2xl sm:p-6">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <span className="text-on-surface text-sm font-bold sm:text-base">
            Interactive Grid Overlay
          </span>
          <span className="text-on-surface/70 rounded-full bg-white/10 px-2 py-0.5 text-xs">
            {imageBitmap.width} × {imageBitmap.height}
          </span>
        </div>

        {/* View toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setShowCellBounds(!showCellBounds)}
            className={`rounded-lg border px-2.5 py-1 transition-all ${
              showCellBounds
                ? "border-red-500/40 bg-red-500/20 text-red-300"
                : "text-on-surface/50 border-white/10 bg-white/5"
            }`}
          >
            Cell (Red)
          </button>
          <button
            onClick={() => setShowIconBounds(!showIconBounds)}
            className={`rounded-lg border px-2.5 py-1 transition-all ${
              showIconBounds
                ? "border-blue-500/40 bg-blue-500/20 text-blue-300"
                : "text-on-surface/50 border-white/10 bg-white/5"
            }`}
          >
            Icon (Blue)
          </button>
          <button
            onClick={() => setShowStarBounds(!showStarBounds)}
            className={`rounded-lg border px-2.5 py-1 transition-all ${
              showStarBounds
                ? "border-amber-500/40 bg-amber-500/20 text-amber-300"
                : "text-on-surface/50 border-white/10 bg-white/5"
            }`}
          >
            Stars (Gold)
          </button>
          <button
            onClick={() => setShowQuantityBounds(!showQuantityBounds)}
            className={`rounded-lg border px-2.5 py-1 transition-all ${
              showQuantityBounds
                ? "border-green-500/40 bg-green-500/20 text-green-300"
                : "text-on-surface/50 border-white/10 bg-white/5"
            }`}
          >
            Number (Green)
          </button>
          <button
            onClick={() => setShowCoordinates(!showCoordinates)}
            className={`rounded-lg border px-2.5 py-1 transition-all ${
              showCoordinates
                ? "border-primary/40 bg-primary/20 text-primary"
                : "text-on-surface/50 border-white/10 bg-white/5"
            }`}
          >
            [r,c]
          </button>
          <button
            onClick={() => setShowDetections(!showDetections)}
            className={`rounded-lg border px-2.5 py-1 transition-all ${
              showDetections
                ? "border-amber-500/40 bg-amber-500/20 text-amber-300"
                : "text-on-surface/50 border-white/10 bg-white/5"
            }`}
          >
            Badges
          </button>

          {/* Zoom controls */}
          <div className="ml-2 flex items-center rounded-lg border border-white/10 bg-black/30 p-0.5">
            <button
              onClick={() => {
                setZoomMode("fit");
                setCustomZoom(1);
              }}
              title="Fit to Container"
              className={`rounded p-1 ${zoomMode === "fit" ? "bg-white/20 text-primary" : "text-on-surface/60 hover:text-on-surface"}`}
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                setZoomMode("custom");
                setCustomZoom((prev) => Math.max(0.5, prev - 0.25));
              }}
              title="Zoom Out"
              className="text-on-surface/60 hover:text-on-surface rounded p-1"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="text-on-surface/70 px-1 font-mono text-[11px]">
              {zoomMode === "fit" ? "Fit" : `${Math.round(customZoom * 100)}%`}
            </span>
            <button
              onClick={() => {
                setZoomMode("custom");
                setCustomZoom((prev) => Math.min(2.5, prev + 0.25));
              }}
              title="Zoom In"
              className="text-on-surface/60 hover:text-on-surface rounded p-1"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div
        ref={containerRef}
        className="relative max-h-[650px] w-full cursor-crosshair select-none overflow-auto rounded-2xl border border-white/10 bg-black/40 shadow-inner"
      >
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          style={{
            width:
              zoomMode === "fit"
                ? "100%"
                : `${imageBitmap.width * customZoom}px`,
            height:
              zoomMode === "fit"
                ? "auto"
                : `${imageBitmap.height * customZoom}px`,
            display: "block",
          }}
        />

        {/* Hover / Tooltip HUD */}
        {hoveredCell && (
          <div className="text-on-surface pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-lg border border-white/20 bg-black/80 px-3 py-1.5 font-mono text-xs shadow-xl backdrop-blur-md">
            <span className="font-bold text-primary">
              Cell [{hoveredCell.row}, {hoveredCell.col}]
            </span>
            {(() => {
              const d = analyzedCells.get(
                `${hoveredCell.row}-${hoveredCell.col}`,
              );
              if (!d)
                return (
                  <span className="text-on-surface/50">• Click to select</span>
                );
              if (d.stats.isEmpty)
                return <span className="text-slate-400">• Empty Slot</span>;
              if (d.matched) {
                return (
                  <span className="font-sans font-semibold text-emerald-400">
                    • {d.matched.name} ({d.matched.confidence}%){" "}
                    {d.ocr ? `x${d.ocr.quantity}` : ""}
                  </span>
                );
              }
              return <span className="text-amber-400">• Unmatched</span>;
            })()}
          </div>
        )}
      </div>

      {/* Hint footer */}
      <div className="text-on-surface/60 flex items-center justify-between px-1 text-xs">
        <span>
          Click any cell to inspect its visual crops, dHash, RGB histograms, and
          candidate rankings.
        </span>
        {selectedCellKey && (
          <span className="font-mono font-semibold text-primary">
            Selected: [{selectedCellKey.replace("-", ", ")}]
          </span>
        )}
      </div>
    </div>
  );
}
