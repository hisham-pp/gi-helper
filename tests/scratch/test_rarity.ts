import path from "path";
import fs from "fs";
import { Jimp } from "jimp";

// Helper to convert RGB to HSV
function rgbToHsv(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  return { h, s, v };
}

/**
 * Detects the cell's rarity (1 to 5 stars) from:
 * 1. Background color (the top 25% background of the cell, sampling upper-left and upper-right corners)
 * 2. Yellow star pixels count/clusters near bottom (y: 65% to 80%)
 */
function detectRarity(cell: Jimp): {
  rarity: number | null;
  method: string;
  debug: any;
} {
  const w = cell.bitmap.width;
  const h = cell.bitmap.height;

  // --- 1. Star Count Detection ---
  // Stars are located at y: 65% to 82% of the cell
  // Star pixels are bright yellow/gold: R > 190, G > 150, B < 120, R > B + 60
  const starYStart = Math.round(h * 0.65);
  const starYEnd = Math.round(h * 0.82);
  const starXStart = Math.round(w * 0.08);
  const starXEnd = Math.round(w * 0.92);

  const starColumns: number[] = new Array(w).fill(0);
  let totalStarPixels = 0;

  for (let y = starYStart; y <= starYEnd; y++) {
    for (let x = starXStart; x <= starXEnd; x++) {
      const rgba = cell.getPixelColor(x, y);
      const r = (rgba >>> 24) & 0xff;
      const g = (rgba >>> 16) & 0xff;
      const b = (rgba >>> 8) & 0xff;
      if (r > 185 && g > 150 && b < 120 && r - b > 60) {
        starColumns[x]++;
        totalStarPixels++;
      }
    }
  }

  // Count star clusters (peaks in starColumns)
  // Stars have an approximate width of 10-18% of cell width
  const starWidth = Math.round(w * 0.12);
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

  // Filter peaks that are too close (merge if distance < starWidth / 2)
  const mergedPeaks: number[] = [];
  for (const p of peaks) {
    if (
      mergedPeaks.length === 0 ||
      p - mergedPeaks[mergedPeaks.length - 1] > starWidth * 0.6
    ) {
      mergedPeaks.push(p);
    }
  }

  const starCount = mergedPeaks.length;

  // --- 2. Background Color Detection ---
  // In Genshin, the cell has a colored arch.
  // Sample upper-left (x: 8% to 22%, y: 8% to 25%) and upper-right (x: 78% to 92%, y: 8% to 25%)
  const bgSamples: {
    h: number;
    s: number;
    v: number;
    r: number;
    g: number;
    b: number;
  }[] = [];

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

  for (const reg of sampleRegions) {
    for (let y = reg.y1; y <= reg.y2; y += 2) {
      for (let x = reg.x1; x <= reg.x2; x += 2) {
        const rgba = cell.getPixelColor(x, y);
        const r = (rgba >>> 24) & 0xff;
        const g = (rgba >>> 16) & 0xff;
        const b = (rgba >>> 8) & 0xff;
        // Skip borders or black
        if (r < 25 && g < 25 && b < 25) continue;
        bgSamples.push({ ...rgbToHsv(r, g, b), r, g, b });
      }
    }
  }

  // Average HSV
  let avgH = 0,
    avgS = 0,
    avgV = 0;
  if (bgSamples.length > 0) {
    avgH = bgSamples.reduce((acc, p) => acc + p.h, 0) / bgSamples.length;
    avgS = bgSamples.reduce((acc, p) => acc + p.s, 0) / bgSamples.length;
    avgV = bgSamples.reduce((acc, p) => acc + p.v, 0) / bgSamples.length;
  }

  // Determine rarity from background color:
  // 1-Star: Gray/Silver (Low saturation, S < 0.20 or S < 0.25 and gray-blue hue)
  // 2-Star: Green (H between 110° and 180°, S >= 0.20)
  // 3-Star: Blue (H between 190° and 245°, S >= 0.20)
  // 4-Star: Purple (H between 250° and 320°, S >= 0.18)
  // 5-Star: Gold/Orange (H between 20° and 55°, S >= 0.25)
  let bgRarity: number | null = null;

  if (avgV > 0.15) {
    if (avgS < 0.22) {
      bgRarity = 1; // Gray
    } else if (avgH >= 105 && avgH <= 180) {
      bgRarity = 2; // Green
    } else if (avgH > 180 && avgH <= 245) {
      bgRarity = 3; // Blue
    } else if (avgH > 245 && avgH <= 325) {
      bgRarity = 4; // Purple
    } else if (avgH >= 15 && avgH <= 65) {
      bgRarity = 5; // Gold
    }
  }

  // Combine star count and background color:
  let finalRarity: number | null = null;
  let method = "none";

  if (starCount >= 1 && starCount <= 5) {
    // If star count agrees with background rarity or background is close:
    if (bgRarity && Math.abs(starCount - bgRarity) <= 1) {
      finalRarity = starCount;
      method = `stars_confirmed (${starCount}★, bg=${bgRarity}★)`;
    } else {
      finalRarity = starCount;
      method = `stars (${starCount}★)`;
    }
  } else if (bgRarity) {
    finalRarity = bgRarity;
    method = `bg_color (${bgRarity}★)`;
  }

  return {
    rarity: finalRarity,
    method,
    debug: {
      starCount,
      totalStarPixels,
      bgRarity,
      avgH: Math.round(avgH),
      avgS: Math.round(avgS * 100),
      avgV: Math.round(avgV * 100),
    },
  };
}

async function run() {
  const sample = await Jimp.read(
    "public/samples/GenshinImpact_20261009_220714.jpg",
  );
  // Let's test a slice of a few cells:
  // We need the proper grid coordinates:
  // On 2800x1272, width=2800, height=1272
  const scale = 1272 / 1080;
  const safeZoneWidth = 1272 * (16 / 9);
  const emptySpaceX = (2800 - safeZoneWidth) / 2;
  const startX = Math.round(emptySpaceX + 240 * scale);
  const startY = Math.round(180 * scale);
  const cellW = Math.round(120 * scale);
  const cellH = Math.round(140 * scale);
  const gapX = Math.round(16 * scale);
  const gapY = Math.round(16 * scale);

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 7; c++) {
      const x = startX + c * (cellW + gapX);
      const y = startY + r * (cellH + gapY);
      const cell = sample.clone().crop({ x, y, w: cellW, h: cellH });
      const res = detectRarity(cell);
      console.log(
        `Cell [${r}, ${c}]: Rarity = ${res.rarity}★ (${res.method}) | debug:`,
        res.debug,
      );
    }
  }
}

run().catch(console.error);
