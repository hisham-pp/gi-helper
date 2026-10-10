/**
 * Runs a Node-side (Jimp) simulation of the scanner pipeline against
 * public/samples/test-set-01/ and compares with expected.json.
 *
 * Outputs: how many items are correctly identified, missed, or misidentified.
 */
import fs from "fs";
import path from "path";
import { Jimp } from "jimp";

const DHASH_W = 17;
const DHASH_H = 16;
const HIST_BINS = 8;
const MAX_HASH_BITS = 256;

const hashes = JSON.parse(fs.readFileSync("src/data/material-hashes.json", "utf8")) as Record<string, { dHash: string; colorHist?: number[] }>;
const materials = JSON.parse(fs.readFileSync("src/data/materials.json", "utf8")) as Array<{ id: string; name: string; rarity: number; image?: string }>;
const matMap = new Map(materials.map((m) => [m.id, m]));
const expected = JSON.parse(fs.readFileSync("public/samples/test-set-01/expected.json", "utf8")) as { items: Array<{ id: string; name: string; quantity: number }> };
const expectedMap = new Map(expected.items.map((i) => [i.id, i]));

async function computeFingerprint(img: Jimp) {
  // Mirror image-hasher.ts: 80% center crop for dHash, 50% for color hist
  const w = img.bitmap.width;
  const h = img.bitmap.height;

  const cx = Math.floor(w * 0.1);
  const cy = Math.floor(h * 0.1);
  const cw = Math.max(1, w - 2 * cx);
  const ch = Math.max(1, h - 2 * cy);
  const cropped = img.clone().crop({ x: cx, y: cy, w: cw, h: ch });

  const hashImg = cropped.clone().resize({ w: DHASH_W, h: DHASH_H }).greyscale();
  const grays = new Uint8Array(DHASH_W * DHASH_H);
  for (let y2 = 0; y2 < DHASH_H; y2++) {
    for (let x2 = 0; x2 < DHASH_W; x2++) {
      const rgba = hashImg.getPixelColor(x2, y2);
      const r = (rgba >>> 24) & 0xff;
      const g = (rgba >>> 16) & 0xff;
      const b = (rgba >>> 8) & 0xff;
      grays[y2 * DHASH_W + x2] = r * 0.299 + g * 0.587 + b * 0.114;
    }
  }
  let hashBits = "";
  for (let y2 = 0; y2 < DHASH_H; y2++) {
    for (let x2 = 0; x2 < DHASH_W - 1; x2++) {
      const idx = y2 * DHASH_W + x2;
      hashBits += grays[idx] > grays[idx + 1] ? "1" : "0";
    }
  }
  let dHash = "";
  for (let i = 0; i < hashBits.length; i += 4) {
    dHash += parseInt(hashBits.slice(i, i + 4), 2).toString(16);
  }

  // Color hist: 50% center crop
  const hx = Math.floor(w * 0.25);
  const hy = Math.floor(h * 0.25);
  const hw = Math.max(1, w - 2 * hx);
  const hh = Math.max(1, h - 2 * hy);
  const histImg = img.clone().crop({ x: hx, y: hy, w: hw, h: hh }).resize({ w: 32, h: 32 });
  const rH = new Float32Array(HIST_BINS);
  const gH = new Float32Array(HIST_BINS);
  const bH = new Float32Array(HIST_BINS);
  const binSize = 256 / HIST_BINS;
  let total = 0;
  for (let y2 = 0; y2 < 32; y2++) {
    for (let x2 = 0; x2 < 32; x2++) {
      const rgba = histImg.getPixelColor(x2, y2);
      const r = (rgba >>> 24) & 0xff;
      const g = (rgba >>> 16) & 0xff;
      const b = (rgba >>> 8) & 0xff;
      const a = rgba & 0xff;
      if (a < 10) continue;
      rH[Math.floor(r / binSize)]++;
      gH[Math.floor(g / binSize)]++;
      bH[Math.floor(b / binSize)]++;
      total++;
    }
  }
  const colorHist: number[] = [];
  if (total > 0) {
    for (let b = 0; b < HIST_BINS; b++) colorHist.push(rH[b] / total);
    for (let b = 0; b < HIST_BINS; b++) colorHist.push(gH[b] / total);
    for (let b = 0; b < HIST_BINS; b++) colorHist.push(bH[b] / total);
  } else {
    colorHist.push(...new Array(HIST_BINS * 3).fill(0));
  }
  return { dHash, colorHist };
}

function hammingDistance(a: string, b: string): number {
  const len = Math.min(a.length, b.length);
  let d = 0;
  for (let i = 0; i < len; i++) {
    let xor = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    while (xor > 0) { d += xor & 1; xor >>= 1; }
  }
  return d;
}

function histIntersection(h1: number[], h2: number[]): number {
  let s = 0;
  const len = Math.min(h1.length, h2.length);
  for (let i = 0; i < len; i++) s += Math.min(h1[i], h2[i]);
  return s / 3;
}

async function runAccuracyTest() {
  const sampleDir = "public/samples/test-set-01";
  const files = fs.readdirSync(sampleDir)
    .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
    .sort()
    .map((f) => path.join(sampleDir, f));

  console.log(`Testing ${files.length} images against ${expected.items.length} expected items\n`);

  const detected = new Map<string, number>(); // id -> quantity

  for (const filePath of files) {
    const img = await Jimp.read(filePath);
    const imgW = img.bitmap.width;
    const imgH = img.bitmap.height;
    const scale = imgH / 1080;

    const grid = {
      startX: Math.round(295 * scale),
      startY: Math.round(149 * scale),
      cellW: Math.round(153 * scale),
      cellH: Math.round(189 * scale),
      gapX: Math.round(30 * scale),
      gapY: Math.round(28 * scale),
      rows: Math.min(6, Math.max(3, Math.ceil((imgH - 149 * scale) / ((189 + 28) * scale)))),
      cols: 7,
    };

    for (let row = 0; row < grid.rows; row++) {
      for (let col = 0; col < grid.cols; col++) {
        const x = grid.startX + col * (grid.cellW + grid.gapX);
        const y = grid.startY + row * (grid.cellH + grid.gapY);

        if (x + grid.cellW > imgW || y + grid.cellH > imgH) continue;

        const cell = img.clone().crop({ x, y, w: grid.cellW, h: grid.cellH });

        // Icon crop (mirrors orchestrator.ts: 6% inset on sides, 5% top, 65% height)
        const ix = Math.round(grid.cellW * 0.06);
        const iy = Math.round(grid.cellH * 0.05);
        const iw = Math.round(grid.cellW * 0.88);
        const ih = Math.round(grid.cellH * 0.65);
        const icon = cell.clone().crop({ x: ix, y: iy, w: iw, h: ih });

        // Empty cell check: stddev of brightness < 18
        let sumB = 0, sumB2 = 0, n = 0;
        const smallIcon = icon.clone().resize({ w: 16, h: 16 });
        for (let sy = 0; sy < 16; sy++) {
          for (let sx = 0; sx < 16; sx++) {
            const rgba = smallIcon.getPixelColor(sx, sy);
            const r = (rgba >>> 24) & 0xff;
            const g = (rgba >>> 16) & 0xff;
            const b = (rgba >>> 8) & 0xff;
            const bright = r * 0.299 + g * 0.587 + b * 0.114;
            sumB += bright; sumB2 += bright * bright; n++;
          }
        }
        const mean = sumB / n;
        const stddev = Math.sqrt(sumB2 / n - mean * mean);
        if (stddev < 18) continue; // empty cell

        const fp = await computeFingerprint(icon);

        let bestId: string | null = null;
        let bestScore = -1;
        for (const [id, stored] of Object.entries(hashes)) {
          const hashSim = 1 - hammingDistance(fp.dHash, stored.dHash) / MAX_HASH_BITS;
          const colorSim = stored.colorHist ? histIntersection(fp.colorHist, stored.colorHist) : 0.5;
          const score = 0.6 * hashSim + 0.4 * colorSim;
          if (score > bestScore) { bestScore = score; bestId = id; }
        }

        if (bestId && bestScore >= 0.55) {
          detected.set(bestId, (detected.get(bestId) ?? 0) + 1);
        }
      }
    }
  }

  console.log(`=== Results ===`);
  let correct = 0, missed = 0, falsePos = 0;
  const detectedIds = new Set(detected.keys());
  const expectedIds = new Set(expectedMap.keys());

  for (const id of expectedIds) {
    if (detectedIds.has(id)) {
      correct++;
    } else {
      missed++;
      console.log(`  MISSED: ${matMap.get(id)?.name ?? id}`);
    }
  }

  for (const id of detectedIds) {
    if (!expectedIds.has(id)) {
      falsePos++;
      console.log(`  FALSE POS: ${matMap.get(id)?.name ?? id} (score not tracked in simple run)`);
    }
  }

  const total = expectedIds.size;
  console.log(`\nCorrectly identified: ${correct}/${total} (${(correct/total*100).toFixed(1)}%)`);
  console.log(`Missed: ${missed}`);
  console.log(`False positives: ${falsePos}`);
  console.log(`Detected items count: ${detectedIds.size}`);
  console.log(`Expected items count: ${total}`);
}

runAccuracyTest().catch(console.error);
