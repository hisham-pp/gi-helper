import { GridConfig } from "./types";

/**
 * Standard 16:9 Genshin Inventory layout approximations calibrated at 1080p base: 1920x1080
 */
export const GENSHIN_1080P_GRID: GridConfig = {
  columns: 7,
  rows: 4,
  startX: 295,
  startY: 149,
  cellWidth: 153,
  cellHeight: 189,
  gapX: 30,
  gapY: 28,
};

/**
 * Standard cell aspect ratio in Genshin Impact UI (cellWidth / cellHeight ≈ 0.81)
 */
export const GENSHIN_CELL_ASPECT_RATIO = 153 / 189; // ~0.8095

/**
 * Ratio of cell width to horizontal period (cellWidth / (cellWidth + gapX) ≈ 0.836)
 */
export const CELL_WIDTH_TO_PERIOD_RATIO = 153 / (153 + 30); // ~0.836

/**
 * Ratio of cell height to vertical period (cellHeight / (cellHeight + gapY) ≈ 0.871)
 */
export const CELL_HEIGHT_TO_PERIOD_RATIO = 189 / (189 + 28); // ~0.871
