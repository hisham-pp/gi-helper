"use client";

import React, { useEffect, useRef } from "react";
import { GridConfig } from "@/lib/grid-detector";

interface GridCanvasProps {
  imageBitmap: ImageBitmap | null;
  gridConfig: GridConfig | null;
  hoveredCell: { row: number; col: number } | null;
  onHoverCell: (cell: { row: number; col: number } | null) => void;
}

export function GridCanvas({
  imageBitmap,
  gridConfig,
  hoveredCell,
  onHoverCell,
}: GridCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageBitmap || !gridConfig) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;

    // 1. Draw base image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageBitmap, 0, 0);

    // 2. Dark mask over background
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const { columns, rows, startX, startY, cellWidth, cellHeight, gapX, gapY } =
      gridConfig;

    // 3. Draw cells
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const x = startX + c * (cellWidth + gapX);
        const y = startY + r * (cellHeight + gapY);

        // Clear dark mask inside cell
        ctx.clearRect(x, y, cellWidth, cellHeight);
        ctx.drawImage(
          imageBitmap,
          x,
          y,
          cellWidth,
          cellHeight,
          x,
          y,
          cellWidth,
          cellHeight,
        );

        const isHovered =
          hoveredCell && hoveredCell.row === r && hoveredCell.col === c;

        // Border
        ctx.lineWidth = isHovered ? 3 : 1.5;
        ctx.strokeStyle = isHovered
          ? "rgba(255, 215, 0, 0.95)"
          : "rgba(0, 229, 255, 0.75)";
        ctx.strokeRect(x, y, cellWidth, cellHeight);

        // Cell hover highlight
        if (isHovered) {
          ctx.fillStyle = "rgba(255, 215, 0, 0.15)";
          ctx.fillRect(x, y, cellWidth, cellHeight);
        }

        // Coordinate tag
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(x + 4, y + 4, 38, 16);
        ctx.fillStyle = isHovered ? "#ffd700" : "#ffffff";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText(`R${r} C${c}`, x + 6, y + 16);
      }
    }

    // Outer dashed bounding box
    const totalW = columns * cellWidth + (columns - 1) * gapX;
    const totalH = rows * cellHeight + (rows - 1) * gapY;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(16, 185, 129, 0.85)";
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(startX - 2, startY - 2, totalW + 4, totalH + 4);
    ctx.setLineDash([]);
  }, [imageBitmap, gridConfig, hoveredCell]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !gridConfig) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = (e.clientX - rect.left) * scaleX;
    const clientY = (e.clientY - rect.top) * scaleY;

    const { columns, rows, startX, startY, cellWidth, cellHeight, gapX, gapY } =
      gridConfig;

    let found: { row: number; col: number } | null = null;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const x = startX + c * (cellWidth + gapX);
        const y = startY + r * (cellHeight + gapY);
        if (
          clientX >= x &&
          clientX <= x + cellWidth &&
          clientY >= y &&
          clientY <= y + cellHeight
        ) {
          found = { row: r, col: c };
          break;
        }
      }
      if (found) break;
    }
    onHoverCell(found);
  };

  return (
    <div className="relative max-h-[640px] w-full overflow-auto rounded-3xl border border-white/10 bg-black/60 shadow-2xl backdrop-blur-xl">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => onHoverCell(null)}
        className="mx-auto block max-w-full cursor-crosshair object-contain"
      />
    </div>
  );
}
