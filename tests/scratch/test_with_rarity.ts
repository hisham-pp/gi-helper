import path from "path";
import fs from "fs";
import { Jimp } from "jimp";
import { detectCellRarity } from "./test_rarity_module";

const DHASH_W = 17;
const DHASH_H = 16;
const HIST_BINS = 8;
const MAX_HASH_BITS = 256;

async function computeFingerprint(img: Jimp) {
  const hashImg = img.clone().resize({ w: DHASH_W, h: DHASH_H }).greyscale();
  let hashBits = "";
  for (let y = 0; y < DHASH_H; y++) {
    for (let x = 0; x < DHASH_W - 1; x++) {
      hashBits +=
        hashImg.getPixelColor(x, y) > hashImg.getPixelColor(x + 1, y)
          ? "1"
          : "0";
    }
  }
  let dHash = "";
  for (let i = 0; i < hashBits.length; i += 4) {
    dHash += parseInt(hashBits.slice(i, i + 4), 2).toString(16);
  }

  const histImg = img.clone().resize({ w: 32, h: 32 });
  const rH = new Float32Array(HIST_BINS);
  const gH = new Float32Array(HIST_BINS);
  const bH = new Float32Array(HIST_BINS);
  const binSize = 256 / HIST_BINS;
  let total = 0;

  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const rgba = histImg.getPixelColor(x, y);
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
    for (let b = 0; b < HIST_BINS * 3; b++) colorHist.push(0);
  }

  return { dHash, colorHist };
}

function hammingDistance(a: string, b: string): number {
  const len = Math.min(a.length, b.length);
  let d = 0;
  for (let i = 0; i < len; i++) {
    let xor = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    while (xor > 0) {
      d += xor & 1;
      xor >>= 1;
    }
  }
  return d;
}

function histIntersection(h1: number[], h2: number[]): number {
  let s = 0;
  const len = Math.min(h1.length, h2.length);
  for (let i = 0; i < len; i++) s += Math.min(h1[i], h2[i]);
  return s / 3;
}

async function testWithRarity() {
  const hashes = JSON.parse(
    fs.readFileSync("src/data/material-hashes.json", "utf8"),
  );
  const materials = JSON.parse(
    fs.readFileSync("src/data/materials.json", "utf8"),
  );
  const matMap = new Map(materials.map((m: any) => [m.id, m]));

  const sample = await Jimp.read(
    "public/samples/GenshinImpact_20261009_220714.jpg",
  );

  const scale = 1272 / 1080;
  const safeZoneWidth = 1272 * (16 / 9);
  const emptySpaceX = (2800 - safeZoneWidth) / 2;
  const startX = Math.round(emptySpaceX + 240 * scale);
  const startY = Math.round(180 * scale);
  const cellW = Math.round(120 * scale);
  const cellH = Math.round(140 * scale);
  const gapX = Math.round(16 * scale);
  const gapY = Math.round(16 * scale);

  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 4; c++) {
      const x = startX + c * (cellW + gapX);
      const y = startY + r * (cellH + gapY);
      const cell = sample.clone().crop({ x, y, w: cellW, h: cellH });

      // Detect rarity
      const { rarity: detectedRarity } = detectCellRarity(cell);

      // Icon crop
      const ix = Math.round(cellW * 0.15);
      const iy = Math.round(cellH * 0.15);
      const iw = Math.round(cellW * 0.7);
      const ih = Math.round(cellH * 0.55);
      const icon = cell.clone().crop({ x: ix, y: iy, w: iw, h: ih });

      const fp = await computeFingerprint(icon);

      let bestId: string | null = null;
      let bestScore = -1;

      for (const [id, stored] of Object.entries(hashes) as [string, any][]) {
        const mat = matMap.get(id);
        const hashSim =
          1 - hammingDistance(fp.dHash, stored.dHash) / MAX_HASH_BITS;
        const colorSim = stored.colorHist
          ? histIntersection(fp.colorHist, stored.colorHist)
          : 0.5;
        let score = 0.6 * hashSim + 0.4 * colorSim;

        // Apply rarity filter/bonus
        if (detectedRarity && mat?.rarity) {
          const diff = Math.abs(mat.rarity - detectedRarity);
          if (diff === 0) {
            score *= 1.05; // slight boost for exact rarity match
          } else if (diff === 1) {
            score *= 0.85; // mild penalty for 1 star diff
          } else {
            score *= 0.5; // strong penalty for >= 2 stars diff
          }
        }

        if (score > bestScore) {
          bestScore = score;
          bestId = id;
        }
      }

      const mat = bestId ? matMap.get(bestId) : null;
      console.log(
        `[${r}, ${c}] Detected: ${detectedRarity}★ -> Matched: ${mat?.name} (${mat?.rarity}★) score: ${Math.round(bestScore * 100)}%`,
      );
    }
  }
}

testWithRarity().catch(console.error);
