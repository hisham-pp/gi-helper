import { GridDetectionResult, DetectionOptions } from "./types";
import { calculateSafeZoneGrid } from "./safe-zone";
import { createAnalysisCanvas, computeGradientsAndVariance } from "./canvas-utils";
import { findActiveRegionBounds, analyzePeriodicSpacing } from "./periodicity";
import { findBestGridInCrop } from "./grid-search";

/**
 * Automatically detects any inventory grid configuration from an image canvas or bitmap.
 * Operates on arbitrary resolutions, crops, aspect ratios, or standard fullscreen captures.
 */
export async function detectAnyGrid(
  source: ImageBitmap | HTMLCanvasElement,
  options: DetectionOptions = {},
): Promise<GridDetectionResult> {
  const origW = source.width;
  const origH = source.height;

  // 1. Genuine Single Item Check (very small icons under ~180px where multiple cards cannot fit)
  const isTinySingleIcon = origW <= 180 && origH <= 220;
  if (isTinySingleIcon) {
    return {
      config: {
        columns: 1,
        rows: 1,
        startX: 0,
        startY: 0,
        cellWidth: origW,
        cellHeight: origH,
        gapX: 0,
        gapY: 0,
      },
      confidence: 99,
      method: "single-item",
      gridBounds: { x: 0, y: 0, width: origW, height: origH },
      explanation: "Single item crop detected (dimensions indicative of 1 cell).",
      periodX: origW,
      periodY: origH,
      detectedCellsCount: 1,
      isCalibrated: true,
    };
  }

  // 2. Preprocess into scaled analysis canvas
  const analysisCtx = createAnalysisCanvas(source, 1400);
  const { scale } = analysisCtx;

  // 3. Extract 1D gradients & variances
  const profiles = computeGradientsAndVariance(analysisCtx);

  // 4. Locate active inventory bounding box
  const bounds = findActiveRegionBounds(
    profiles,
    analysisCtx.targetW,
    analysisCtx.targetH,
  );

  // 5. Periodic Autocorrelation Peak Analysis (Direct physical period measurement)
  const periodicity = analyzePeriodicSpacing(profiles, bounds);

  if (periodicity.hasStrongPeriodicity) {
    const periodX = Math.round(periodicity.periodX / scale);
    const periodY = Math.round(periodicity.periodY / scale);

    const origActiveW = Math.round(bounds.activeW / scale);
    const origActiveH = Math.round(bounds.activeH / scale);

    const detectedCols = Math.max(
      1,
      Math.min(10, Math.round(origActiveW / periodX)),
    );
    const detectedRows = Math.max(
      1,
      Math.min(8, Math.round(origActiveH / periodY)),
    );

    const cellWidth = Math.round(periodX * 0.835);
    const gapX = Math.max(0, periodX - cellWidth);
    const cellHeight = Math.round(periodY * 0.87);
    const gapY = Math.max(0, periodY - cellHeight);

    const totalGridW = detectedCols * cellWidth + (detectedCols - 1) * gapX;
    const totalGridH = detectedRows * cellHeight + (detectedRows - 1) * gapY;

    const origMinX = Math.round(bounds.minX / scale);
    const origMinY = Math.round(bounds.minY / scale);

    const startX = Math.max(0, origMinX + Math.round((origActiveW - totalGridW) / 2));
    const startY = Math.max(0, origMinY + Math.round((origActiveH - totalGridH) / 2));

    const confidence = Math.min(
      98,
      Math.round(60 + (periodicity.scoreX + periodicity.scoreY) * 20),
    );

    return {
      config: {
        columns: options.targetCols || detectedCols,
        rows: options.targetRows || detectedRows,
        startX,
        startY,
        cellWidth,
        cellHeight,
        gapX,
        gapY,
      },
      confidence,
      method: "periodic-edge-profile",
      gridBounds: {
        x: startX,
        y: startY,
        width: totalGridW,
        height: totalGridH,
      },
      explanation: `Detected ${detectedCols}×${detectedRows} grid via periodic autocorrelation peak spacing (T_x: ${periodX}px, T_y: ${periodY}px).`,
      periodX,
      periodY,
      detectedCellsCount: detectedCols * detectedRows,
      isCalibrated: true,
    };
  }

  // 6. Cropped Grid Search Fallback (evaluates candidate aspect ratios and resonance)
  const cropCandidate = findBestGridInCrop(analysisCtx, profiles, {
    targetCols: options.targetCols,
    targetRows: options.targetRows,
  });

  if (cropCandidate && cropCandidate.confidence >= 80) {
    const { config, confidence, columns, rows, aspectRatio } = cropCandidate;
    return {
      config,
      confidence,
      method: "card-contour-clustering",
      gridBounds: {
        x: config.startX,
        y: config.startY,
        width: columns * config.cellWidth + (columns - 1) * config.gapX,
        height: rows * config.cellHeight + (rows - 1) * config.gapY,
      },
      explanation: `Detected ${columns}×${rows} inventory grid via Genshin card geometry & edge resonance (Cell: ${config.cellWidth}×${config.cellHeight}px, ratio: ${aspectRatio.toFixed(2)}).`,
      periodX: config.cellWidth + config.gapX,
      periodY: config.cellHeight + config.gapY,
      detectedCellsCount: columns * rows,
      isCalibrated: true,
    };
  }

  // 7. Proportional Safe-Zone / Resolution Anchor Model (fallback for standard game frames)
  const safeZone = calculateSafeZoneGrid(origW, origH);
  const aspect = origW / origH;
  const isStandardAspect = aspect >= 1.5 && aspect <= 2.4;
  const anchorConfidence = isStandardAspect ? 92 : 80;

  return {
    config: {
      ...safeZone,
      columns: options.targetCols || safeZone.columns,
      rows: options.targetRows || safeZone.rows,
    },
    confidence: anchorConfidence,
    method: "proportional-safe-zone",
    gridBounds: {
      x: safeZone.startX,
      y: safeZone.startY,
      width: safeZone.columns * (safeZone.cellWidth + safeZone.gapX),
      height: safeZone.rows * (safeZone.cellHeight + safeZone.gapY),
    },
    explanation: `Proportional UI anchor calibrated for ${origW}×${origH} (Aspect ratio ${aspect.toFixed(2)}:1).`,
    periodX: safeZone.cellWidth + safeZone.gapX,
    periodY: safeZone.cellHeight + safeZone.gapY,
    detectedCellsCount: safeZone.columns * safeZone.rows,
    isCalibrated: true,
  };
}
