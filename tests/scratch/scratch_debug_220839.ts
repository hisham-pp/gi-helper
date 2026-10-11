import sharp from "sharp";
import { Jimp } from "jimp";
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

const SIZE = 16;
const N = SIZE * SIZE;

function normalizeGrayscale(grays: Float32Array): Float32Array {
  let mean = 0;
  for (let i = 0; i < N; i++) mean += grays[i];
  mean /= N;

  let sumSq = 0;
  const out = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const val = grays[i] - mean;
    out[i] = val;
    sumSq += val * val;
  }
  const std = Math.sqrt(sumSq);
  if (std > 1e-6) {
    for (let i = 0; i < N; i++) out[i] /= std;
  }
  return out;
}

function getGraysFromJimp(img: any): Float32Array {
  const grays = new Float32Array(N);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const rgba = img.getPixelColor(x, y);
      const r = (rgba >>> 24) & 0xff, g = (rgba >>> 16) & 0xff, b = (rgba >>> 8) & 0xff;
      grays[y * SIZE + x] = r * 0.299 + g * 0.587 + b * 0.114;
    }
  }
  return grays;
}

async function debug220839() {
  const templates: { id: string; name: string; rarity: number; vec: Float32Array }[] = [];
  for (const mat of materials) {
    const p = `public/images/materials/${mat.id}.png`;
    if (!fs.existsSync(p)) continue;
    try {
      const ref = await readImage(p);
      const bg = new Jimp({ width: 256, height: 256, color: RARITY_COLORS[mat.rarity] || 0x737578ff });
      bg.composite(ref, 0, 0);
      const refCrop = bg.crop({ x: 30, y: 30, w: 196, h: 196 }).resize({ w: SIZE, h: SIZE });
      const vec = normalizeGrayscale(getGraysFromJimp(refCrop));
      templates.push({ id: mat.id, name: mat.name, rarity: mat.rarity, vec });
    } catch {}
  }

  const img = await Jimp.read("public/samples/test-set-01/GenshinImpact_20261009_220839.jpg");
  const scale = 1272 / 1080;
  const cellW = Math.round(153 * scale), cellH = Math.round(189 * scale);
  const gapX = Math.round(30 * scale), gapY = Math.round(28 * scale);
  const startY = Math.round(149 * scale);
  const sx = 347;

  // Let's inspect Row 2 (r=2) on 220839:
  console.log("Inspecting Row 2 of GenshinImpact_20261009_220839.jpg:");
  for (let c = 0; c < 7; c++) {
    const x = sx + c * (cellW + gapX);
    const y = startY + 2 * (cellH + gapY);

    const cell = img.clone().crop({ x, y, w: cellW, h: cellH });
    const cellX = Math.round(cellW * 0.14);
    const cellY = Math.round(cellH * 0.11);
    const cellS = Math.round(cellW * 0.78);
    const cellCrop = cell.clone().crop({ x: cellX, y: cellY, w: cellS, h: cellS }).resize({ w: SIZE, h: SIZE });
    const vec = normalizeGrayscale(getGraysFromJimp(cellCrop));

    const scores = templates.map(t => {
      let dot = 0;
      for (let i = 0; i < N; i++) dot += vec[i] * t.vec[i];
      return { id: t.id, name: t.name, rarity: t.rarity, score: dot };
    }).sort((a, b) => b.score - a.score);

    console.log(`[Col ${c}] Top 3 matches:`);
    for (let k = 0; k < 3; k++) {
      console.log(`  ${scores[k].name} (${scores[k].id}) [${scores[k].rarity}★]: ${(scores[k].score * 100).toFixed(1)}%`);
    }
  }
}

debug220839().catch(console.error);
