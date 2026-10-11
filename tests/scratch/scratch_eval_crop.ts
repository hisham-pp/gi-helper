import { Jimp } from "jimp";
import fs from "fs";
import { findBestMatch, findTopCandidates } from "../../src/lib/cv/item-matcher";
import { calculateFingerprint } from "../../src/lib/cv/image-hasher";

// Jimp to ImageFingerprint simulation
function getFingerprintFromJimp(img: any) {
  const { width, height } = img.bitmap;
  const cx = Math.floor(width * 0.1);
  const cy = Math.floor(height * 0.1);
  const cw = Math.max(1, width - 2 * cx);
  const ch = Math.max(1, height - 2 * cy);

  const hashImg = img.clone().crop({ x: cx, y: cy, w: cw, h: ch }).resize({ w: 17, h: 16 });
  const grays = new Uint8Array(17 * 16);
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 17; x++) {
      const rgba = hashImg.getPixelColor(x, y);
      const r = (rgba >>> 24) & 0xff;
      const g = (rgba >>> 16) & 0xff;
      const b = (rgba >>> 8) & 0xff;
      grays[y * 17 + x] = r * 0.299 + g * 0.587 + b * 0.114;
    }
  }
  let hashBits = "";
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const idx = y * 17 + x;
      hashBits += grays[idx] > grays[idx + 1] ? "1" : "0";
    }
  }
  let dHash = "";
  for (let i = 0; i < hashBits.length; i += 4) {
    dHash += parseInt(hashBits.slice(i, i + 4), 2).toString(16);
  }

  const hx = Math.floor(width * 0.25);
  const hy = Math.floor(height * 0.25);
  const hw = Math.max(1, width - 2 * hx);
  const hh = Math.max(1, height - 2 * hy);
  const histImg = img.clone().crop({ x: hx, y: hy, w: hw, h: hh }).resize({ w: 32, h: 32 });
  const rH = new Float32Array(8), gH = new Float32Array(8), bH = new Float32Array(8);
  let total = 0;
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const rgba = histImg.getPixelColor(x, y);
      const r = (rgba >>> 24) & 0xff, g = (rgba >>> 16) & 0xff, b = (rgba >>> 8) & 0xff, a = rgba & 0xff;
      if (a < 10) continue;
      rH[Math.floor(r / 32)]++; gH[Math.floor(g / 32)]++; bH[Math.floor(b / 32)]++;
      total++;
    }
  }
  const colorHist: number[] = [];
  for (let b = 0; b < 8; b++) colorHist.push(rH[b] / total);
  for (let b = 0; b < 8; b++) colorHist.push(gH[b] / total);
  for (let b = 0; b < 8; b++) colorHist.push(bH[b] / total);

  return { dHash, colorHist };
}

async function run() {
  const crop = await Jimp.read("user_crop_extracted.png");
  const fp = getFingerprintFromJimp(crop);

  console.log("=== Matching with expectedRarity: 2 ===");
  const match2 = findBestMatch(fp, { expectedRarity: 2, minConfidence: 0.48 });
  console.log("Best match (expectedRarity: 2):", match2);

  console.log("\n=== Matching with expectedRarity: 3 ===");
  const match3 = findBestMatch(fp, { expectedRarity: 3, minConfidence: 0.48 });
  console.log("Best match (expectedRarity: 3):", match3);

  console.log("\n=== Matching with expectedRarity: null ===");
  const matchNull = findBestMatch(fp, { minConfidence: 0.48 });
  console.log("Best match (expectedRarity: null):", matchNull);

  console.log("\n=== Top 10 Candidates (expectedRarity: 2) ===");
  const top = findTopCandidates(fp, 10, { expectedRarity: 2, hashWeight: 0.8, colorWeight: 0.2 });
  for (const c of top) {
    console.log(`${c.name} (${c.id}): score=${(c.score * 100).toFixed(1)}% conf=${c.confidence}%`);
  }
}

run().catch(console.error);
