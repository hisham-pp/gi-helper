import { Jimp } from "jimp";
import sharp from "sharp";
import fs from "fs";

const materials = JSON.parse(fs.readFileSync("src/data/materials.json", "utf-8"));

async function readImage(p: string) {
  const buf = await sharp(p).png().toBuffer();
  return await Jimp.read(buf);
}

const RARITY_COLORS: Record<number, number> = {
  5: 0xdca451ff,
  4: 0x9e73b9ff,
  3: 0x587db4ff,
  2: 0x609373ff,
  1: 0x737578ff,
};

function ncc(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}

function getNormalizedGrays(img: any, size: number = 32): Float32Array {
  const n = size * size;
  const scaled = img.clone().resize({ w: size, h: size });
  const grays = new Float32Array(n);
  let mean = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const rgba = scaled.getPixelColor(x, y);
      const r = (rgba >>> 24) & 0xff, g = (rgba >>> 16) & 0xff, b = (rgba >>> 8) & 0xff;
      const gray = r * 0.299 + g * 0.587 + b * 0.114;
      grays[y * size + x] = gray;
      mean += gray;
    }
  }
  mean /= n;
  let sumSq = 0;
  for (let i = 0; i < n; i++) {
    grays[i] -= mean;
    sumSq += grays[i] * grays[i];
  }
  const std = Math.sqrt(sumSq);
  if (std > 1e-6) {
    for (let i = 0; i < n; i++) grays[i] /= std;
  }
  return grays;
}

async function identifyRow3() {
  const img = await Jimp.read("public/samples/test-set-01/GenshinImpact_20261009_220714.jpg");
  const scale = 1272 / 1080;
  const cellW = Math.round(153 * scale), cellH = Math.round(189 * scale);
  const gapX = Math.round(30 * scale), gapY = Math.round(28 * scale);
  const startY = Math.round(149 * scale);
  const sx = 347;

  // Precompute ALL material templates:
  const allTemplates: { id: string; name: string; rarity: number; vec: Float32Array }[] = [];
  for (const mat of materials) {
    const p = `public/images/materials/${mat.id}.png`;
    if (!fs.existsSync(p)) continue;
    try {
      const ref = await readImage(p);
      const bg = new Jimp({ width: 256, height: 256, color: RARITY_COLORS[mat.rarity] || 0x737578ff });
      bg.composite(ref, 0, 0);
      const refCrop = bg.crop({ x: 30, y: 30, w: 196, h: 196 });
      const vec = getNormalizedGrays(refCrop, 32);
      allTemplates.push({ id: mat.id, name: mat.name, rarity: mat.rarity, vec });
    } catch {}
  }

  // Check each cell in Row 3 (r=3, c=0..6):
  for (let c = 0; c < 7; c++) {
    const x = sx + c * (cellW + gapX);
    const y = startY + 3 * (cellH + gapY);
    const cell = img.clone().crop({ x, y, w: cellW, h: cellH });
    const cellX = Math.round(cellW * 0.14);
    const cellY = Math.round(cellH * 0.11);
    const cellS = Math.round(cellW * 0.78);
    const cellCrop = cell.clone().crop({ x: cellX, y: cellY, w: cellS, h: cellS });
    const cellVec = getNormalizedGrays(cellCrop, 32);

    const scores = allTemplates.map(t => {
      let dot = 0;
      for (let i = 0; i < 32 * 32; i++) dot += cellVec[i] * t.vec[i];
      return { id: t.id, name: t.name, rarity: t.rarity, score: dot };
    }).sort((a, b) => b.score - a.score);

    console.log(`[R4:C${c+1}] Top 3 matches:`);
    for (let k = 0; k < 3; k++) {
      console.log(`  ${k+1}. ${scores[k].name} (${scores[k].id}) [${scores[k].rarity}★]: ${(scores[k].score * 100).toFixed(1)}%`);
    }
  }
}

identifyRow3().catch(console.error);
