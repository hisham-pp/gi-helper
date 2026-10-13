import { GridConfig } from "./types";
import { CanvasAnalysisContext, ImageGradientProfiles } from "./canvas-utils";

export interface GridCandidate {
  config: GridConfig;
  score: number;
  confidence: number;
  aspectRatio: number;
  columns: number;
  rows: number;
}

/**
 * Searches for the optimal grid (columns, rows, offsets, cell dimensions) that matches
 * Genshin Impact inventory card geometry and periodic edge alignments.
 */
export function findBestGridInCrop(
  analysisCtx: CanvasAnalysisContext,
  profiles: ImageGradientProfiles,
  options: {
    minCols?: number;
    maxCols?: number;
    minRows?: number;
    maxRows?: number;
    targetCols?: number;
    targetRows?: number;
  } = {},
): GridCandidate | null {
  const { origW, origH, scale, targetW, targetH } = analysisCtx;
  const { gradXProfile, gradYProfile } = profiles;

  const minCols = options.targetCols || options.minCols || 2;
  const maxCols = options.targetCols || options.maxCols || 10;
  const minRows = options.targetRows || options.minRows || 1;
  const maxRows = options.targetRows || options.maxRows || 8;

  // Search over candidate column and row counts
  const candidates: GridCandidate[] = [];

  for (let c = minCols; c <= maxCols; c++) {
    for (let r = minRows; r <= maxRows; r++) {
      // Calculate period in scaled coordinates
      const scaledTx = targetW / c;
      const scaledTy = targetH / r;

      // Minimum reasonable cell size in scaled pixels
      if (scaledTx < 15 || scaledTy < 18) continue;

      // In Genshin Impact:
      // cellWidth is ~83.5% of period, gapX is ~16.5% of period
      // cellHeight is ~87.0% of period, gapY is ~13.0% of period
      const scaledCellW = scaledTx * 0.835;
      const scaledCellH = scaledTy * 0.87;

      const cellAspect = scaledCellW / scaledCellH;

      // Genshin card aspect ratio is ~0.8095 (153 / 189)
      // Allow realistic range [0.70, 0.95]
      if (cellAspect < 0.68 || cellAspect > 1.05) continue;

      const aspectDiff = Math.abs(cellAspect - 0.81);
      // Gaussian score for aspect ratio matching
      const aspectScore = Math.exp(-(aspectDiff * aspectDiff) / (2 * 0.07 * 0.07));

      // Calculate edge resonance: check if column boundaries and row boundaries match gradients
      let colEdgeResonance = 0;
      for (let colIdx = 1; colIdx < c; colIdx++) {
        const boundaryX = Math.round(colIdx * scaledTx);
        // Sample gradient around boundary
        let localMax = 0;
        for (let dx = -2; dx <= 2; dx++) {
          const sampleX = boundaryX + dx;
          if (sampleX >= 0 && sampleX < targetW) {
            localMax = Math.max(localMax, gradXProfile[sampleX]);
          }
        }
        colEdgeResonance += localMax;
      }
      colEdgeResonance = c > 1 ? colEdgeResonance / (c - 1) : 0;

      let rowEdgeResonance = 0;
      for (let rowIdx = 1; rowIdx < r; rowIdx++) {
        const boundaryY = Math.round(rowIdx * scaledTy);
        let localMax = 0;
        for (let dy = -2; dy <= 2; dy++) {
          const sampleY = boundaryY + dy;
          if (sampleY >= 0 && sampleY < targetH) {
            localMax = Math.max(localMax, gradYProfile[sampleY]);
          }
        }
        rowEdgeResonance += localMax;
      }
      rowEdgeResonance = r > 1 ? rowEdgeResonance / (r - 1) : 0;

      // Also check resonance at the bottom quantity bar of each cell (y ≈ (row + 0.86) * Ty)
      let quantityBarResonance = 0;
      for (let rowIdx = 0; rowIdx < r; rowIdx++) {
        const qtyY = Math.round((rowIdx + 0.86) * scaledTy);
        let localMax = 0;
        for (let dy = -2; dy <= 2; dy++) {
          const sampleY = qtyY + dy;
          if (sampleY >= 0 && sampleY < targetH) {
            localMax = Math.max(localMax, gradYProfile[sampleY]);
          }
        }
        quantityBarResonance += localMax;
      }
      quantityBarResonance /= r;

      const edgeScore =
        1.0 +
        Math.min(2.0, (colEdgeResonance + rowEdgeResonance + quantityBarResonance) * 0.1);

      const totalScore = aspectScore * edgeScore;

      // Convert back to original image scale
      const origTx = origW / c;
      const origTy = origH / r;
      const origCellW = Math.round(origTx * 0.835);
      const origGapX = Math.max(1, Math.round(origTx - origCellW));
      const origCellH = Math.round(origTy * 0.87);
      const origGapY = Math.max(1, Math.round(origTy - origCellH));

      // Calculate small outer margin offsets
      const startX = Math.max(0, Math.round((origW - (c * origCellW + (c - 1) * origGapX)) / 2));
      const startY = Math.max(0, Math.round((origH - (r * origCellH + (r - 1) * origGapY)) / 2));

      const confidence = Math.min(
        98,
        Math.max(50, Math.round(aspectScore * 85 + Math.min(15, edgeScore * 5))),
      );

      candidates.push({
        config: {
          columns: c,
          rows: r,
          startX,
          startY,
          cellWidth: origCellW,
          cellHeight: origCellH,
          gapX: origGapX,
          gapY: origGapY,
        },
        score: totalScore,
        confidence,
        aspectRatio: cellAspect,
        columns: c,
        rows: r,
      });
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0];
}
