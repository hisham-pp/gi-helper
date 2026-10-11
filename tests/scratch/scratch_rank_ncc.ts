import sharp from "sharp";
import { Jimp } from "jimp";
import fs from "fs";

const materials = JSON.parse(
  fs.readFileSync("src/data/materials.json", "utf-8"),
);

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

function getNormalizedGrays(img: any, size: number = 24): Float32Array {
  const n = size * size;
  const scaled = img.clone().resize({ w: size, h: size });
  const grays = new Float32Array(n);
  let mean = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const rgba = scaled.getPixelColor(x, y);
      const r = (rgba >>> 24) & 0xff,
        g = (rgba >>> 16) & 0xff,
        b = (rgba >>> 8) & 0xff;
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

async function run() {
  const cell = await Jimp.read(
    "public/samples/test-set-01/GenshinImpact_20261009_220714.jpg",
  );
  const scale = 1272 / 1080;
  const cellW = Math.round(153 * scale),
    cellH = Math.round(189 * scale);
  const gapX = Math.round(30 * scale),
    gapY = Math.round(28 * scale);
  const startY = Math.round(149 * scale);
  const sx = 347;

  // R2:C5 (Chaos Device)
  const x = sx + 4 * (cellW + gapX);
  const y = startY + 1 * (cellH + gapY);
  const cellCrop = cell.clone().crop({ x, y, w: cellW, h: cellH });
  const iconCrop = cellCrop.clone().crop({
    x: Math.round(cellW * 0.1),
    y: Math.round(cellH * 0.06),
    w: Math.round(cellW * 0.8),
    h: Math.round(cellW * 0.8),
  });

  const cropVec = getNormalizedGrays(iconCrop, 24);

  // Compare against ALL materials in materials.json using their TRUE rarity background
  const results: any[] = [];
  for (const mat of materials) {
    const p = `public/images/materials/${mat.id}.png`;
    if (!fs.existsSync(p)) continue;
    try {
      const ref = await readImage(p);
      const bg = new Jimp({
        width: 256,
        height: 256,
        color: RARITY_COLORS[mat.rarity] || 0x737578ff,
      });
      bg.composite(ref, 0, 0);
      const refCrop = bg.crop({ x: 25, y: 25, w: 206, h: 206 });
      const refVec = getNormalizedGrays(refCrop, 24);
      let score = ncc(cropVec, refVec);

      // Apply rarity weighting (crop has 2 stars)
      const diff = Math.abs(mat.rarity - 2);
      if (diff === 0) score *= 1.1;
      else if (diff === 1) score *= 0.85;
      else score *= 0.7;

      results.push({ id: mat.id, name: mat.name, rarity: mat.rarity, score });
    } catch {}
  }

  results.sort((a, b) => b.score - a.score);
  console.log("Top 10 matches for Chaos Device cell (R2:C5):");
  for (let i = 0; i < 10; i++) {
    const r = results[i];
    console.log(
      `${i + 1}. ${r.name} (${r.id}) [${r.rarity}★]: ${(r.score * 100).toFixed(1)}%`,
    );
  }
}

run().catch(console.error);
