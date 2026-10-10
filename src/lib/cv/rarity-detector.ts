/**
 * Rarity and Star Detector for Genshin Impact Inventory Cells
 *
 * In Genshin Impact, every inventory cell visually communicates its rarity tier (1 to 5 stars) in two ways:
 * 1. Visual Star Count (★ to ★★★★★): Row of golden/yellow stars near the bottom (y: 65% to 83%).
 * 2. Background Color Arch: The upper background gradient behind the material icon:
 *    - 1-Star (Common): Slate-Gray (low saturation)
 *    - 2-Star (Uncommon): Emerald Green
 *    - 3-Star (Rare): Sky Blue
 *    - 4-Star (Epic): Royal Purple
 *    - 5-Star (Legendary): Amber / Gold
 */

export interface RarityResult {
  /** Detected rarity tier (1 to 5), or null if indeterminate (e.g. transparent icon) */
  rarity: number | null;
  /** Number of stars detected in the bottom area (0 to 5) */
  starsCount: number;
  /** Rarity inferred from the upper background gradient color (1 to 5, or null) */
  bgRarity: number | null;
  /** Detection confidence percentage (0 to 100) */
  confidence: number;
  /** Method description */
  method: string;
}

/**
 * Converts RGB values (0..255) to HSV.
 * Hue: 0..360, Saturation: 0..1, Value: 0..1
 */
export function rgbToHsv(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; v: number } {
  const rf = r / 255;
  const gf = g / 255;
  const bf = b / 255;
  const max = Math.max(rf, gf, bf);
  const min = Math.min(rf, gf, bf);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (d !== 0) {
    if (max === rf) {
      h = ((gf - bf) / d) % 6;
    } else if (max === gf) {
      h = (bf - rf) / d + 2;
    } else {
      h = (rf - gf) / d + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  return { h, s, v };
}

/**
 * Detects rarity (1 to 5 stars) from a cell's ImageBitmap or canvas.
 */
export function detectCellRarity(
  source: ImageBitmap | HTMLCanvasElement,
): RarityResult {
  const w = source.width;
  const h = source.height;

  // Render to offscreen canvas
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return {
      rarity: null,
      starsCount: 0,
      bgRarity: null,
      confidence: 0,
      method: "error",
    };
  }

  ctx.drawImage(source as CanvasImageSource, 0, 0, w, h);
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // ─── 1. Star Detection (y: 68% to 87% of cell height) ─────────────────────
  const starYStart = Math.round(h * 0.68);
  const starYEnd = Math.round(h * 0.87);
  const starXStart = Math.round(w * 0.04);
  const starXEnd = Math.round(w * 0.96);

  const starColumns = new Int32Array(w);
  let totalStarPixels = 0;

  for (let y = starYStart; y <= starYEnd; y++) {
    for (let x = starXStart; x <= starXEnd; x++) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      if (a < 128) continue;

      // Genshin star pixels are bright golden-yellow:
      // R > 185, G > 150, B < 130, R - B > 55
      if (r > 185 && g > 150 && b < 130 && r - b > 55) {
        starColumns[x]++;
        totalStarPixels++;
      }
    }
  }

  // Count star clusters (peaks along the X axis)
  // Each star has an approximate width of 8% to 15% of cell width
  const starWidth = Math.max(3, Math.round(w * 0.12));
  const peaks: number[] = [];
  let inPeak = false;
  let peakStart = 0;

  for (let x = starXStart; x <= starXEnd; x++) {
    if (starColumns[x] >= 3) {
      if (!inPeak) {
        inPeak = true;
        peakStart = x;
      }
    } else {
      if (inPeak) {
        inPeak = false;
        peaks.push((peakStart + x) / 2);
      }
    }
  }
  if (inPeak) peaks.push((peakStart + starXEnd) / 2);

  // Merge peaks that are closer than half a star width
  const mergedPeaks: number[] = [];
  for (const p of peaks) {
    if (
      mergedPeaks.length === 0 ||
      p - mergedPeaks[mergedPeaks.length - 1] > starWidth * 0.6
    ) {
      mergedPeaks.push(p);
    }
  }

  const starsCount = Math.min(5, mergedPeaks.length);

  // ─── 2. Background Color Gradient Detection ──────────────────────────────
  // Sample upper-left (8%-22% X, 8%-25% Y) and upper-right (78%-92% X, 8%-25% Y)
  const sampleRegions = [
    {
      x1: Math.round(w * 0.08),
      x2: Math.round(w * 0.22),
      y1: Math.round(h * 0.08),
      y2: Math.round(h * 0.25),
    },
    {
      x1: Math.round(w * 0.78),
      x2: Math.round(w * 0.92),
      y1: Math.round(h * 0.08),
      y2: Math.round(h * 0.25),
    },
  ];

  let sumH = 0;
  let sumS = 0;
  let sumV = 0;
  let sampleCount = 0;

  for (const reg of sampleRegions) {
    for (let y = reg.y1; y <= reg.y2; y += 2) {
      for (let x = reg.x1; x <= reg.x2; x += 2) {
        const idx = (y * w + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        if (a < 128) continue;
        // Skip black border pixels
        if (r < 25 && g < 25 && b < 25) continue;

        const hsv = rgbToHsv(r, g, b);
        sumH += hsv.h;
        sumS += hsv.s;
        sumV += hsv.v;
        sampleCount++;
      }
    }
  }

  let bgRarity: number | null = null;
  if (sampleCount > 10) {
    const avgH = sumH / sampleCount;
    const avgS = sumS / sampleCount;
    const avgV = sumV / sampleCount;

    if (avgV > 0.15) {
      // 1-Star: Gray/Silver (Low saturation)
      if (avgS < 0.22) {
        bgRarity = 1;
      }
      // 2-Star: Emerald Green (Hue 105° to 180°, Saturation >= 0.20)
      else if (avgH >= 105 && avgH <= 180) {
        bgRarity = 2;
      }
      // 3-Star: Sky Blue (Hue 185° to 245°, Saturation >= 0.20)
      else if (avgH > 185 && avgH <= 245) {
        bgRarity = 3;
      }
      // 4-Star: Royal Purple (Hue 245° to 325°, Saturation >= 0.18)
      else if (avgH > 245 && avgH <= 325) {
        bgRarity = 4;
      }
      // 5-Star: Amber / Gold (Hue 15° to 65°, Saturation >= 0.25)
      else if (avgH >= 15 && avgH <= 65) {
        bgRarity = 5;
      }
    }
  }

  // ─── 3. Final Consensus Decision ─────────────────────────────────────────
  let finalRarity: number | null = null;
  let method = "indeterminate";
  let confidence = 50;

  if (starsCount >= 1 && starsCount <= 5) {
    if (bgRarity && Math.abs(starsCount - bgRarity) <= 1) {
      finalRarity = starsCount;
      confidence = 95;
      method = `stars_and_bg (${starsCount}★)`;
    } else {
      finalRarity = starsCount;
      confidence = 85;
      method = `stars (${starsCount}★)`;
    }
  } else if (bgRarity !== null) {
    finalRarity = bgRarity;
    confidence = 80;
    method = `bg_color (${bgRarity}★)`;
  }

  return {
    rarity: finalRarity,
    starsCount,
    bgRarity,
    confidence,
    method,
  };
}
