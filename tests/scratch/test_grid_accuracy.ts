import fs from "fs";
import path from "path";
import { Jimp } from "jimp";

const DHASH_W = 17;
const DHASH_H = 16;
const HIST_BINS = 8;
const MAX_HASH_BITS = 256;

// User's exact calibrated grid constants at 1080p base:
const BASE_START_X = 295;
const BASE_START_Y = 148;
const BASE_CELL_W = 153;
const BASE_CELL_H = 189;
const BASE_GAP_X = 30;
const BASE_GAP_Y = 28;

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

function toGOODKey(name: string): string {
  return name
    .replace(/['"\\-]/g, "")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

async function testAll() {
  const hashes = JSON.parse(
    fs.readFileSync("src/data/material-hashes.json", "utf8"),
  );
  const materials = JSON.parse(
    fs.readFileSync("src/data/materials.json", "utf8"),
  );
  const matMap = new Map(materials.map((m: any) => [m.id, m]));
  const expectedGOOD = JSON.parse(
    fs.readFileSync("public/result/inventory.json", "utf8"),
  ).materials;

  const samples = fs
    .readdirSync("public/samples")
    .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
    .map((f) => path.join("public/samples", f));

  const detectedIds = new Set<string>();

  for (const samplePath of samples) {
    const img = await Jimp.read(samplePath);
    const { width, height } = img.bitmap;
    const scale = height / 1080;

    const grid = {
      startX: Math.round(BASE_START_X * scale),
      startY: Math.round(BASE_START_Y * scale),
      cellW: Math.round(BASE_CELL_W * scale),
      cellH: Math.round(BASE_CELL_H * scale),
      gapX: Math.round(BASE_GAP_X * scale),
      gapY: Math.round(BASE_GAP_Y * scale),
    };

    let sampleMatches = 0;

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 7; c++) {
        const x = grid.startX + c * (grid.cellW + grid.gapX);
        const y = grid.startY + r * (grid.cellH + grid.gapY);

        const ix = Math.round(x + grid.cellW * 0.08);
        const iy = Math.round(y + grid.cellH * 0.06);
        const iw = Math.round(grid.cellW * 0.84);
        const ih = Math.round(grid.cellH * 0.64);

        if (ix + iw > width || iy + ih > height) continue;

        const icon = img.clone().crop({ x: ix, y: iy, w: iw, h: ih });
        const fp = await computeFingerprint(icon);

        let bestId: string | null = null;
        let bestScore = -1;

        for (const [id, stored] of Object.entries(hashes) as [string, any][]) {
          const hashSim =
            1 - hammingDistance(fp.dHash, stored.dHash) / MAX_HASH_BITS;
          const colorSim = stored.colorHist
            ? histIntersection(fp.colorHist, stored.colorHist)
            : 0.5;
          const score = 0.6 * hashSim + 0.4 * colorSim;
          if (score > bestScore) {
            bestScore = score;
            bestId = id;
          }
        }

        if (bestId && bestScore >= 0.55) {
          detectedIds.add(bestId);
          sampleMatches++;
        }
      }
    }

    console.log(`${path.basename(samplePath)}: ${sampleMatches} matches`);
  }

  const detectedGOOD = new Set<string>();
  for (const id of detectedIds) {
    const mat = matMap.get(id);
    if (mat) detectedGOOD.add(toGOODKey(mat.name));
  }

  const expectedKeys = Object.keys(expectedGOOD);
  const matchedExpected = expectedKeys.filter((k) => detectedGOOD.has(k));
  const hitRate = (matchedExpected.length / expectedKeys.length) * 100;
  console.log(
    `\nHit rate with user's calibrated grid: ${hitRate.toFixed(1)}% (${matchedExpected.length}/${expectedKeys.length})`,
  );
}

testAll().catch(console.error);
