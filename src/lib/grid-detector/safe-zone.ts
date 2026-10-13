import { GridConfig } from "./types";

/**
 * Detects if the image is a single cropped material rather than a full inventory grid.
 */
export function isSingleItemImage(width: number, height: number): boolean {
  return width < 650 || height < 450 || width / height < 1.25;
}

/**
 * Calculates proportional safe-zone grid layout for standard game screenshots (16:9, ultrawide 21:9, 16:10, mobile, etc.).
 */
export function calculateSafeZoneGrid(width: number, height: number): GridConfig {
  if (isSingleItemImage(width, height)) {
    return {
      columns: 1,
      rows: 1,
      startX: 0,
      startY: 0,
      cellWidth: width,
      cellHeight: height,
      gapX: 0,
      gapY: 0,
    };
  }

  // UI scales based on height relative to 1080p
  const scale = height / 1080;
  const startY = Math.round(149 * scale);
  const cellH = Math.round(189 * scale);
  const gapY = Math.round(28 * scale);
  const maxRows = Math.floor((height - startY) / (cellH + gapY));

  // Genshin centers its 16:9 safe-zone UI within the ultrawide frame.
  const safeZoneWidth = height * (16 / 9);
  const emptySpaceX = Math.max(0, (width - safeZoneWidth) / 2);

  return {
    columns: 7,
    rows: Math.min(6, Math.max(3, maxRows)),
    startX: Math.round(emptySpaceX + 295 * scale),
    startY,
    cellWidth: Math.round(153 * scale),
    cellHeight: cellH,
    gapX: Math.round(30 * scale),
    gapY,
  };
}
