import path from "path";
import fs from "fs";
import { Jimp } from "jimp";

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

export function detectCellRarity(cell: Jimp): {
  rarity: number | null;
  starsCount: number;
  bgRarity: number | null;
} {
  const w = cell.bitmap.width;
  const h = cell.bitmap.height;

  // 1. Star Detection (y: 65% to 82%)
  const starYStart = Math.round(h * 0.65);
  const starYEnd = Math.round(h * 0.82);
  const starXStart = Math.round(w * 0.08);
  const starXEnd = Math.round(w * 0.92);

  const starColumns: number[] = new Array(w).fill(0);
  for (let y = starYStart; y <= starYEnd; y++) {
    for (let x = starXStart; x <= starXEnd; x++) {
      const rgba = cell.getPixelColor(x, y);
      const r = (rgba >>> 24) & 0xff;
      const g = (rgba >>> 16) & 0xff;
      const b = (rgba >>> 8) & 0xff;
      if (r > 185 && g > 150 && b < 130 && r - b > 55) {
        starColumns[x]++;
      }
    }
  }

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

  const mergedPeaks: number[] = [];
  for (const p of peaks) {
    if (
      mergedPeaks.length === 0 ||
      p - mergedPeaks[mergedPeaks.length - 1] > starWidth * 0.6
    ) {
      mergedPeaks.push(p);
    }
  }

  const starsCount = mergedPeaks.length;

  // 2. Background Color Detection
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

  const bgSamples: { h: number; s: number; v: number }[] = [];
  for (const reg of sampleRegions) {
    for (let y = reg.y1; y <= reg.y2; y += 2) {
      for (let x = reg.x1; x <= reg.x2; x += 2) {
        const rgba = cell.getPixelColor(x, y);
        const r = (rgba >>> 24) & 0xff;
        const g = (rgba >>> 16) & 0xff;
        const b = (rgba >>> 8) & 0xff;
        if (r < 25 && g < 25 && b < 25) continue;
        bgSamples.push(rgbToHsv(r, g, b));
      }
    }
  }

  let bgRarity: number | null = null;
  if (bgSamples.length > 0) {
    const avgH = bgSamples.reduce((acc, p) => acc + p.h, 0) / bgSamples.length;
    const avgS = bgSamples.reduce((acc, p) => acc + p.s, 0) / bgSamples.length;
    const avgV = bgSamples.reduce((acc, p) => acc + p.v, 0) / bgSamples.length;

    if (avgV > 0.15) {
      if (avgS < 0.22) bgRarity = 1;
      else if (avgH >= 105 && avgH <= 180) bgRarity = 2;
      else if (avgH > 180 && avgH <= 245) bgRarity = 3;
      else if (avgH > 245 && avgH <= 325) bgRarity = 4;
      else if (avgH >= 15 && avgH <= 65) bgRarity = 5;
    }
  }

  let finalRarity: number | null = null;
  if (starsCount >= 1 && starsCount <= 5) {
    finalRarity = starsCount;
  } else if (bgRarity) {
    finalRarity = bgRarity;
  }

  return { rarity: finalRarity, starsCount, bgRarity };
}

async function testSample1() {
  const sample = await Jimp.read(
    "public/samples/GenshinImpact_20261009_220714.jpg",
  );
  const materials = JSON.parse(
    fs.readFileSync("src/data/materials.json", "utf8"),
  );
  const matMap = new Map(materials.map((m: any) => [m.id, m]));

  const scale = 1272 / 1080;
  const safeZoneWidth = 1272 * (16 / 9);
  const emptySpaceX = (2800 - safeZoneWidth) / 2;
  const startX = Math.round(emptySpaceX + 240 * scale);
  const startY = Math.round(180 * scale);
  const cellW = Math.round(120 * scale);
  const cellH = Math.round(140 * scale);
  const gapX = Math.round(16 * scale);
  const gapY = Math.round(16 * scale);

  console.log("Testing cell rarity detection on Sample #1:");
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 4; c++) {
      const x = startX + c * (cellW + gapX);
      const y = startY + r * (cellH + gapY);
      const cell = sample.clone().crop({ x, y, w: cellW, h: cellH });
      const res = detectCellRarity(cell);
      console.log(
        `[${r}, ${c}]: Detected Rarity = ${res.rarity}★ (Stars: ${res.starsCount}, BG: ${res.bgRarity}★)`,
      );
    }
  }
}

testSample1().catch(console.error);
