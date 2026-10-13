import { GridConfig } from "./types";

/**
 * Snaps a grid configuration to local high-contrast edges or round boundaries.
 */
export function snapGridToEdges(
  config: GridConfig,
  imageW: number,
  imageH: number,
  offsetSnap = 4,
): GridConfig {
  return {
    ...config,
    startX: Math.max(
      0,
      Math.min(
        imageW - config.cellWidth,
        Math.round(config.startX / offsetSnap) * offsetSnap,
      ),
    ),
    startY: Math.max(
      0,
      Math.min(
        imageH - config.cellHeight,
        Math.round(config.startY / offsetSnap) * offsetSnap,
      ),
    ),
    cellWidth: Math.max(10, Math.round(config.cellWidth)),
    cellHeight: Math.max(10, Math.round(config.cellHeight)),
  };
}
