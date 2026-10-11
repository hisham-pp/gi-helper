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

// Ground truth for GenshinImpact_20261009_220714.jpg (28 cells):
const groundTruth: string[][] = [
  // Row 0
  [
    "tea-scented-tassel",
    "cam-and-cables-of-law",
    "dandelion-bookmark",
    "black-crystal-horn",
    "black-bronze-horn",
    "heavy-horn",
    "ley-line-sprout"
  ],
  // Row 1
  [
    "dead-ley-line-leaves",
    "dead-ley-line-branch",
    "chaos-core",
    "chaos-circuit",
    "chaos-device",
    "mist-grass-wick",
    "mist-grass"
  ],
  // Row 2
  [
    "mist-grass-pollen",
    "inspector-s-sacrificial-knife",
    "agent-s-sacrificial-knife",
    "hunter-s-sacrificial-knife",
    "fossilized-bone-shard",
    "sturdy-bone-shard",
    "fragile-bone-shard"
  ],
  // Row 3
  [
    "polarizing-prism",
    "crystal-prism",
    "dismal-prism",
    "concealed-talon",
    "concealed-unguis",
    "concealed-claw",
    "deathly-statuette"
  ]
];

async function testAll28Cells() {
  console.log("Loading templates for the test items...");
  const uniqueIds = Array.from(new Set(groundTruth.flat()));
  const templates: Map<string, { id: string; name: string; vec: Float32Array }> = new Map();

  for (const id of uniqueIds) {
    const mat = materials.find((m: any) => m.id === id);
    const ref = await readImage(`public/images/materials/${id}.png`);
    const bg = new Jimp({ width: 256, height: 256, color: RARITY_COLORS[mat?.rarity || 1] || 0x737578ff });
    bg.composite(ref, 0, 0);
    const refCrop = bg.crop({ x: 30, y: 30, w: 196, h: 196 });
    const vec = getNormalizedGrays(refCrop, 32);
    templates.set(id, { id, name: mat?.name || id, vec });
  }

  const img = await Jimp.read("public/samples/test-set-01/GenshinImpact_20261009_220714.jpg");
  const scale = 1272 / 1080;
  const cellW = Math.round(153 * scale), cellH = Math.round(189 * scale);
  const gapX = Math.round(30 * scale), gapY = Math.round(28 * scale);
  const startY = Math.round(149 * scale);
  const sx = 347;

  let correctCount = 0;
  console.log("\nTesting all 28 cells of GenshinImpact_20261009_220714.jpg:\n");

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 7; c++) {
      const expectedId = groundTruth[r][c];
      const x = sx + c * (cellW + gapX);
      const y = startY + r * (cellH + gapY);
      const cell = img.clone().crop({ x, y, w: cellW, h: cellH });

      const cellX = Math.round(cellW * 0.14);
      const cellY = Math.round(cellH * 0.11);
      const cellS = Math.round(cellW * 0.78);
      const cellCrop = cell.clone().crop({ x: cellX, y: cellY, w: cellS, h: cellS });
      const cellVec = getNormalizedGrays(cellCrop, 32);

      let bestScore = -1;
      let bestId = "";

      for (const [id, t] of templates.entries()) {
        let dot = 0;
        for (let i = 0; i < 32 * 32; i++) dot += cellVec[i] * t.vec[i];
        if (dot > bestScore) {
          bestScore = dot;
          bestId = id;
        }
      }

      const matchOk = bestId === expectedId;
      if (matchOk) correctCount++;
      const mark = matchOk ? "✓" : "✗";
      console.log(`[R${r+1}:C${c+1}] ${mark} Expected: ${expectedId} | Matched: ${bestId} (${(bestScore * 100).toFixed(1)}%)`);
    }
  }

  console.log(`\nOverall Accuracy on 220714: ${correctCount} / 28 (${((correctCount / 28) * 100).toFixed(1)}%)`);
}

testAll28Cells().catch(console.error);
