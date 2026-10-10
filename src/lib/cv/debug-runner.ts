import { DetailedCellSlice } from "./grid-detector";
import {
  calculateFingerprint,
  getCellStats,
  hexToBitString,
} from "./image-hasher";
import { findTopCandidates, MatchCandidate } from "./item-matcher";
import { CellDebugData, DebugHyperparams } from "./debug-types";
import { detectCellRarity, RarityResult } from "./rarity-detector";
import Tesseract from "tesseract.js";

/**
 * Creates a high-contrast binarized canvas representation of the quantity area
 * to visualize what the OCR engine processes.
 */
export function createBinarizedQuantityDataUrl(
  bitmap: ImageBitmap,
  threshold = 140,
): string {
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.drawImage(bitmap, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    // Numbers in Genshin inventory are white with a dark drop-shadow
    const val = gray >= threshold ? 255 : 0;
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL("image/png");
}

/**
 * Runs Tesseract OCR on a quantity bitmap using an existing worker.
 */
export async function runQuantityOCR(
  bitmap: ImageBitmap,
  worker: Tesseract.Worker,
): Promise<{ rawText: string; quantity: number; elapsedMs: number }> {
  const start = performance.now();
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return { rawText: "", quantity: 1, elapsedMs: 0 };
  }

  ctx.drawImage(bitmap, 0, 0);

  try {
    const result = await worker.recognize(canvas);
    const rawText = result.data.text.trim();
    const digits = rawText.replace(/[^0-9]/g, "");
    const quantity = digits ? parseInt(digits, 10) || 1 : 1;
    const elapsedMs = Math.round(performance.now() - start);

    return { rawText, quantity, elapsedMs };
  } catch (e) {
    console.error("OCR Failed:", e);
    return {
      rawText: "ERROR",
      quantity: 1,
      elapsedMs: Math.round(performance.now() - start),
    };
  }
}

/**
 * Analyzes a single cell slice: computes brightness stats, rarity/stars, fingerprint,
 * top matches, and optionally OCR.
 */
export async function analyzeCell(
  slice: DetailedCellSlice,
  hyperparams: DebugHyperparams,
  worker?: Tesseract.Worker | null,
): Promise<CellDebugData> {
  const startTotal = performance.now();

  // 1. Stats & Empty Slot Check
  const stats = getCellStats(slice.iconBitmap, hyperparams.emptyThreshold);

  // If cell is empty, skip hashing & OCR to save time (unless forced)
  if (stats.isEmpty) {
    const elapsed = Math.round(performance.now() - startTotal);
    return {
      slice,
      stats,
      rarity: {
        rarity: null,
        starsCount: 0,
        bgRarity: null,
        confidence: 0,
        method: "empty_slot",
      },
      fingerprint: {
        dHash: "0".repeat(64),
        colorHist: new Array(24).fill(0),
        bitString: "0".repeat(256),
      },
      topCandidates: [],
      matched: null,
      ocr: null,
      timings: {
        sliceMs: 0,
        hashMs: 0,
        matchMs: 0,
        totalMs: elapsed,
      },
    };
  }

  // 2. Rarity & Star Detection
  const rarity = detectCellRarity(slice.cellBitmap);

  // 3. Image Fingerprint (dHash + color histogram)
  const hashStart = performance.now();
  const fp = await calculateFingerprint(slice.iconBitmap);
  const bitString = hexToBitString(fp.dHash);
  const hashMs = Math.round(performance.now() - hashStart);

  // 4. Top Candidate Matching (with rarity weighting)
  const matchStart = performance.now();
  const candidates = findTopCandidates(fp, 5, {
    hashWeight: hyperparams.hashWeight,
    colorWeight: hyperparams.colorWeight,
    minConfidence: 0, // Keep all top 5 candidates even if below threshold for debugging!
    expectedRarity: rarity.rarity,
  });
  const matchMs = Math.round(performance.now() - matchStart);

  const matched =
    candidates.length > 0 &&
    candidates[0].confidence >= hyperparams.minConfidence
      ? candidates[0]
      : null;

  // 5. Quantity OCR (if worker provided and item matched or occupied)
  let ocrResult: {
    rawText: string;
    quantity: number;
    elapsedMs: number;
  } | null = null;

  if (worker) {
    ocrResult = await runQuantityOCR(slice.quantityBitmap, worker);
  }

  const totalMs = Math.round(performance.now() - startTotal);

  return {
    slice,
    stats,
    rarity,
    fingerprint: {
      dHash: fp.dHash,
      colorHist: fp.colorHist,
      bitString,
    },
    topCandidates: candidates,
    matched,
    ocr: ocrResult,
    timings: {
      sliceMs: 0,
      hashMs,
      matchMs,
      ocrMs: ocrResult?.elapsedMs,
      totalMs,
    },
  };
}

/**
 * Re-evaluates matches and confidence thresholds in memory without re-slicing or re-hashing.
 */
export function reEvaluateCell(
  cell: CellDebugData,
  hyperparams: DebugHyperparams,
): CellDebugData {
  const updatedStats = {
    ...cell.stats,
    isEmpty: cell.stats.stddev < hyperparams.emptyThreshold,
  };

  if (updatedStats.isEmpty) {
    return {
      ...cell,
      stats: updatedStats,
      matched: null,
    };
  }

  const candidates = findTopCandidates(
    {
      dHash: cell.fingerprint.dHash,
      colorHist: cell.fingerprint.colorHist,
    },
    5,
    {
      hashWeight: hyperparams.hashWeight,
      colorWeight: hyperparams.colorWeight,
      minConfidence: 0,
      expectedRarity: cell.rarity?.rarity,
    },
  );

  const matched =
    candidates.length > 0 &&
    candidates[0].confidence >= hyperparams.minConfidence
      ? candidates[0]
      : null;

  return {
    ...cell,
    stats: updatedStats,
    topCandidates: candidates,
    matched,
  };
}
