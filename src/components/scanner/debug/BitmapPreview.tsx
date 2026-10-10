"use client";

import React, { useEffect, useRef } from "react";

interface BitmapPreviewProps {
  bitmap: ImageBitmap | null | undefined;
  className?: string;
  pixelated?: boolean;
  alt?: string;
  width?: number;
  height?: number;
}

export function BitmapPreview({
  bitmap,
  className = "",
  pixelated = false,
  alt = "Preview",
  width,
  height,
}: BitmapPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!bitmap) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.imageSmoothingEnabled = !pixelated;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0);
    }
  }, [bitmap, pixelated]);

  if (!bitmap) {
    return (
      <div
        className={`text-on-surface/50 flex items-center justify-center rounded-lg border border-white/5 bg-black/30 text-xs ${className}`}
        style={{ width: width || "100%", height: height || "100%" }}
      >
        No Image
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={`${pixelated ? "[image-rendering:pixelated]" : ""} ${className}`}
      style={{
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
      }}
      title={alt}
    />
  );
}
