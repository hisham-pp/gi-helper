import { ImageGradientProfiles } from "./canvas-utils";

export interface ActiveRegionBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  activeW: number;
  activeH: number;
}

export interface PeakPeriodResult {
  lag: number;
  score: number;
}

export interface PeriodicityResult {
  periodX: number;
  periodY: number;
  scoreX: number;
  scoreY: number;
  hasStrongPeriodicity: boolean;
}

/**
 * Discovers prominent local peaks in the autocorrelation signal to find the fundamental physical period.
 */
export function findDominantPeriod(
  signal: Float32Array,
  minLag: number,
  maxLag: number,
): PeakPeriodResult {
  const len = signal.length;
  if (len < maxLag * 2) {
    maxLag = Math.floor(len / 2);
  }
  if (minLag >= maxLag || minLag <= 0) return { lag: 0, score: 0 };

  let sum = 0;
  for (let i = 0; i < len; i++) sum += signal[i];
  const mean = sum / len;

  const zm = new Float32Array(len);
  let variance = 0;
  for (let i = 0; i < len; i++) {
    zm[i] = signal[i] - mean;
    variance += zm[i] * zm[i];
  }
  if (variance === 0) return { lag: 0, score: 0 };

  const autocorr: { lag: number; val: number }[] = [];
  for (let lag = minLag; lag <= maxLag; lag++) {
    let corrSum = 0;
    const count = len - lag;
    for (let i = 0; i < count; i++) {
      corrSum += zm[i] * zm[i + lag];
    }
    autocorr.push({ lag, val: corrSum / variance });
  }

  // Find local peaks (where val is greater than both its neighbors)
  let bestLag = 0;
  let bestVal = -1;

  for (let i = 1; i < autocorr.length - 1; i++) {
    const cur = autocorr[i].val;
    if (cur > autocorr[i - 1].val && cur > autocorr[i + 1].val && cur > bestVal) {
      bestVal = cur;
      bestLag = autocorr[i].lag;
    }
  }

  // Fallback to absolute maximum if no distinct local peak was identified
  if (bestLag === 0 && autocorr.length > 0) {
    for (let i = 0; i < autocorr.length; i++) {
      if (autocorr[i].val > bestVal) {
        bestVal = autocorr[i].val;
        bestLag = autocorr[i].lag;
      }
    }
  }

  return { lag: bestLag, score: Math.max(0, bestVal) };
}

/**
 * Locates the bounding box of the active inventory grid by thresholding variance profiles.
 */
export function findActiveRegionBounds(
  profiles: ImageGradientProfiles,
  targetW: number,
  targetH: number,
): ActiveRegionBounds {
  const { colVariances, rowVariances } = profiles;

  let avgVarX = 0;
  for (let x = 0; x < targetW; x++) avgVarX += colVariances[x];
  avgVarX /= targetW;

  let avgVarY = 0;
  for (let y = 0; y < targetH; y++) avgVarY += rowVariances[y];
  avgVarY /= targetH;

  const thresholdX = avgVarX * 0.75;
  const thresholdY = avgVarY * 0.75;

  let minX = 0,
    maxX = targetW - 1;
  let minY = 0,
    maxY = targetH - 1;

  for (let x = 0; x < targetW; x++) {
    if (colVariances[x] > thresholdX) {
      minX = x;
      break;
    }
  }
  for (let x = targetW - 1; x >= 0; x--) {
    if (colVariances[x] > thresholdX) {
      maxX = x;
      break;
    }
  }

  for (let y = 0; y < targetH; y++) {
    if (rowVariances[y] > thresholdY) {
      minY = y;
      break;
    }
  }
  for (let y = targetH - 1; y >= 0; y--) {
    if (rowVariances[y] > thresholdY) {
      maxY = y;
      break;
    }
  }

  // If the variance spans >= 70% of the image, it is a cropped inventory
  const activeW = Math.max(10, maxX - minX);
  const activeH = Math.max(10, maxY - minY);

  if (activeW / targetW >= 0.7) {
    minX = 0;
    maxX = targetW - 1;
  }
  if (activeH / targetH >= 0.7) {
    minY = 0;
    maxY = targetH - 1;
  }

  return {
    minX,
    maxX,
    minY,
    maxY,
    activeW: Math.max(10, maxX - minX),
    activeH: Math.max(10, maxY - minY),
  };
}

/**
 * Analyzes dominant periodic spacing inside the active region.
 */
export function analyzePeriodicSpacing(
  profiles: ImageGradientProfiles,
  bounds: ActiveRegionBounds,
): PeriodicityResult {
  const { gradXProfile, gradYProfile } = profiles;
  const { minX, maxX, minY, maxY, activeW, activeH } = bounds;

  const subSignalX = gradXProfile.subarray(minX, maxX);
  const subSignalY = gradYProfile.subarray(minY, maxY);

  const minPeriodX = Math.max(15, Math.floor(activeW / 12));
  const maxPeriodX = Math.min(Math.floor(activeW / 2), Math.floor(activeW / 2.5));

  const minPeriodY = Math.max(18, Math.floor(activeH / 8));
  const maxPeriodY = Math.min(Math.floor(activeH / 1.5), Math.floor(activeH / 2));

  const { lag: periodX, score: scoreX } = findDominantPeriod(
    subSignalX,
    minPeriodX,
    maxPeriodX,
  );
  const { lag: periodY, score: scoreY } = findDominantPeriod(
    subSignalY,
    minPeriodY,
    maxPeriodY,
  );

  const hasStrongPeriodicity =
    periodX > 0 && periodY > 0 && scoreX > 0.12 && scoreY > 0.12;

  return {
    periodX,
    periodY,
    scoreX,
    scoreY,
    hasStrongPeriodicity,
  };
}
