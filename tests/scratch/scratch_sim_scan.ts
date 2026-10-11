import { Jimp } from "jimp";
import fs from "fs";
import { findBestMatch } from "./src/lib/cv/item-matcher";
import { calculateFingerprint } from "./src/lib/cv/image-hasher";

const expectedData = JSON.parse(fs.readFileSync("public/samples/test-set-01/expected.json", "utf-8"));
const materials = JSON.parse(fs.readFileSync("src/data/materials.json", "utf-8"));

// Simulation of calculateFingerprint using Jimp
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

async function simulateScan() {
  const img = await Jimp.read("public/samples/test-set-01/GenshinImpact_20261009_220714.jpg");
  const scale = 1272 / 1080;
  const cellW = Math.round(153 * scale), cellH = Math.round(189 * scale);
  const gapX = Math.round(30 * scale), gapY = Math.round(28 * scale);
  const startY = Math.round(149 * scale);
  const sx = 347;

  let previousMatchName: string | undefined = undefined;
  let lastMatchedOrder = 0;
  let lastBlockId: string | null = null;

  console.log("Simulating scan of GenshinImpact_20261009_220714.jpg:\n");

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 7; c++) {
      const x = sx + c * (cellW + gapX);
      const y = startY + r * (cellH + gapY);

      const cell = img.clone().crop({ x, y, w: cellW, h: cellH });
      const icon = cell.clone().crop({
        x: Math.round(cellW * 0.06),
        y: Math.round(cellH * 0.05),
        w: Math.round(cellW * 0.88),
        h: Math.round(cellH * 0.65),
      });

      const fp = getFingerprintFromJimp(icon);

      // Current matcher call in orchestrator.ts
      const match = findBestMatch(fp, {
        minConfidence: 0.48,
        neighborNames: previousMatchName ? [previousMatchName] : undefined,
      });

      if (match) {
        previousMatchName = match.name;
        console.log(`[R${r+1}:C${c+1}] -> ${match.name} (${match.id}) conf=${match.confidence}%`);
        if (r === 1 && c === 4) {
          console.log("\n>>> DETAILED FOR R2:C5 (Chaos Device cell):");
          console.log("Top suggestions:", match.candidates?.map(cand => `${cand.name} (${cand.score.toFixed(3)})`));
        }
      } else {
        console.log(`[R${r+1}:C${c+1}] -> (NO MATCH)`);
      }
    }
  }
}

simulateScan().catch(console.error);
