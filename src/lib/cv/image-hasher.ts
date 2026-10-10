/**
 * Perceptual image hashing utilities for material icon matching.
 *
 * Strategy: We combine two hash types for robust matching:
 * 1. dHash (difference hash) at 17x16 → 256-bit hash for structural similarity
 * 2. Color histogram (8 bins per RGB channel) → 24 values for color similarity
 *
 * Combining both significantly reduces false positives since items may share
 * shape but differ in color (e.g., different tier gems) or vice versa.
 */

/** Size of the dHash grid. Using 17×16 produces a 256-bit dHash. */
const DHASH_W = 17;
const DHASH_H = 16;

/** Number of histogram bins per channel (R, G, B). */
const HIST_BINS = 8;

export interface ImageFingerprint {
  /** 64-char hex string (256-bit dHash) */
  dHash: string;
  /** Normalized histogram values [0..1] for R, G, B channels (HIST_BINS values each) */
  colorHist: number[];
}

/** Draw an ImageBitmap into a fresh offscreen canvas and return its ImageData. */
function getImageData(
  source: ImageBitmap | HTMLCanvasElement,
  w: number,
  h: number,
): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(source as CanvasImageSource, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}

/**
 * Calculates a combined perceptual fingerprint for an ImageBitmap.
 * The fingerprint includes:
 * - 256-bit dHash (hex string) for structural/shape similarity
 * - Normalized RGB color histogram for color similarity
 *
 * Uses only the central 80% of the bitmap to avoid background border
 * contamination from the in-game rarity gradient.
 */
export async function calculateFingerprint(
  imageBitmap: ImageBitmap,
): Promise<ImageFingerprint> {
  // Center-crop to 80% to strip colored rarity background edges
  const cx = Math.floor(imageBitmap.width * 0.1);
  const cy = Math.floor(imageBitmap.height * 0.1);
  const cw = Math.max(1, imageBitmap.width - 2 * cx);
  const ch = Math.max(1, imageBitmap.height - 2 * cy);

  // --- dHash (256-bit) ---
  const hashCanvas = document.createElement("canvas");
  hashCanvas.width = DHASH_W;
  hashCanvas.height = DHASH_H;
  const hashCtx = hashCanvas.getContext("2d", { willReadFrequently: true })!;
  hashCtx.drawImage(imageBitmap, cx, cy, cw, ch, 0, 0, DHASH_W, DHASH_H);
  const hashData = hashCtx.getImageData(0, 0, DHASH_W, DHASH_H);

  const grays = new Uint8Array(DHASH_W * DHASH_H);
  for (let i = 0; i < hashData.data.length; i += 4) {
    grays[i / 4] =
      hashData.data[i] * 0.299 +
      hashData.data[i + 1] * 0.587 +
      hashData.data[i + 2] * 0.114;
  }

  let hashBits = "";
  for (let y = 0; y < DHASH_H; y++) {
    for (let x = 0; x < DHASH_W - 1; x++) {
      const idx = y * DHASH_W + x;
      hashBits += grays[idx] > grays[idx + 1] ? "1" : "0";
    }
  }

  let dHash = "";
  for (let i = 0; i < hashBits.length; i += 4) {
    dHash += parseInt(hashBits.slice(i, i + 4), 2).toString(16);
  }

  // --- Color Histogram ---
  const histCanvas = document.createElement("canvas");
  histCanvas.width = 32;
  histCanvas.height = 32;
  const histCtx = histCanvas.getContext("2d", { willReadFrequently: true })!;
  histCtx.drawImage(imageBitmap, cx, cy, cw, ch, 0, 0, 32, 32);
  const histData = histCtx.getImageData(0, 0, 32, 32);

  const rHist = new Float32Array(HIST_BINS);
  const gHist = new Float32Array(HIST_BINS);
  const bHist = new Float32Array(HIST_BINS);
  const binSize = 256 / HIST_BINS;
  let totalPixels = 0;

  for (let i = 0; i < histData.data.length; i += 4) {
    const a = histData.data[i + 3];
    if (a < 10) continue; // Skip transparent pixels
    rHist[Math.floor(histData.data[i] / binSize)]++;
    gHist[Math.floor(histData.data[i + 1] / binSize)]++;
    bHist[Math.floor(histData.data[i + 2] / binSize)]++;
    totalPixels++;
  }

  const colorHist: number[] = [];
  if (totalPixels > 0) {
    for (let b = 0; b < HIST_BINS; b++) colorHist.push(rHist[b] / totalPixels);
    for (let b = 0; b < HIST_BINS; b++) colorHist.push(gHist[b] / totalPixels);
    for (let b = 0; b < HIST_BINS; b++) colorHist.push(bHist[b] / totalPixels);
  } else {
    for (let b = 0; b < HIST_BINS * 3; b++) colorHist.push(0);
  }

  return { dHash, colorHist };
}

export interface CellStats {
  mean: number;
  stddev: number;
  isEmpty: boolean;
}

/**
 * Computes brightness statistics for empty slot detection.
 */
export function getCellStats(
  imageBitmap: ImageBitmap,
  threshold = 18,
): CellStats {
  const SAMPLE_SIZE = 16;
  const data = getImageData(imageBitmap, SAMPLE_SIZE, SAMPLE_SIZE).data;

  const grays: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 10) continue; // ignore transparent
    grays.push(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
  }

  if (grays.length === 0) return { mean: 0, stddev: 0, isEmpty: true };

  const mean = grays.reduce((s, v) => s + v, 0) / grays.length;
  const variance =
    grays.reduce((s, v) => s + (v - mean) ** 2, 0) / grays.length;
  const stddev = Math.sqrt(variance);

  return {
    mean: Math.round(mean * 100) / 100,
    stddev: Math.round(stddev * 100) / 100,
    isEmpty: stddev < threshold,
  };
}

/**
 * Returns true if the cell appears to be an empty inventory slot.
 *
 * Empty slots in Genshin's inventory are a near-uniform dark-purple background
 * with no icon drawn inside them. We detect them by measuring the standard
 * deviation of pixel brightness across the cell area:
 * - A real item icon has rich detail → high stddev (typically > 25)
 * - An empty slot is visually monotone → low stddev (typically < 18)
 *
 * This prevents the last partially-filled row from producing false matches.
 */
export function isEmptyCell(imageBitmap: ImageBitmap, threshold = 18): boolean {
  return getCellStats(imageBitmap, threshold).isEmpty;
}

/** Converts a hexadecimal hash string to a 0/1 bit string. */
export function hexToBitString(hex: string): string {
  let bits = "";
  for (let i = 0; i < hex.length; i++) {
    bits += parseInt(hex[i], 16).toString(2).padStart(4, "0");
  }
  return bits;
}

/**
 * Calculates the Hamming distance between two hex dHash strings.
 * Lower = more similar. Max value = hash length * 4 bits per hex char.
 */
export function hammingDistance(hash1: string, hash2: string): number {
  const len = Math.min(hash1.length, hash2.length);
  let distance = 0;
  for (let i = 0; i < len; i++) {
    let xor = parseInt(hash1[i], 16) ^ parseInt(hash2[i], 16);
    while (xor > 0) {
      distance += xor & 1;
      xor >>= 1;
    }
  }
  return distance;
}

/**
 * Calculates the histogram intersection similarity between two histograms.
 * Returns a value in [0, 1] where 1 = identical color distribution.
 */
export function histogramIntersection(h1: number[], h2: number[]): number {
  let intersection = 0;
  const len = Math.min(h1.length, h2.length);
  for (let i = 0; i < len; i++) {
    intersection += Math.min(h1[i], h2[i]);
  }
  // Each channel sums to 1, so max intersection across 3 channels = 3
  return intersection / 3;
}

// --- Legacy dHash (kept for backward compat during transition) ---
export async function calculateDHash(
  imageBitmap: ImageBitmap,
): Promise<string> {
  const fp = await calculateFingerprint(imageBitmap);
  return fp.dHash;
}
