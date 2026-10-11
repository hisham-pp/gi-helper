import sharp from "sharp";
import { Jimp } from "jimp";
import fs from "fs";
import path from "path";

const materials = JSON.parse(
  fs.readFileSync("src/data/materials.json", "utf-8"),
);
const expectedData = JSON.parse(
  fs.readFileSync("public/samples/test-set-01/expected.json", "utf-8"),
);
const expectedIds = new Set(expectedData.items.map((i: any) => i.id));

async function readImage(p: string) {
  const buf = await sharp(p).png().toBuffer();
  return await Jimp.read(buf);
}

const RARITY_COLORS: Record<number, number> = {
  5: 0xdca451ff, // Gold
  4: 0x9e73b9ff, // Purple
  3: 0x587db4ff, // Blue
  2: 0x609373ff, // Green
  1: 0x737578ff, // Gray
};

const SIZE = 32;
const N = SIZE * SIZE;

// Compute normalized zero-mean vector for an image (length = 1)
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
      const r = (rgba >>> 24) & 0xff,
        g = (rgba >>> 16) & 0xff,
        b = (rgba >>> 8) & 0xff;
      grays[y * SIZE + x] = r * 0.299 + g * 0.587 + b * 0.114;
    }
  }
  return grays;
}

async function run() {
  console.log("Precomputing normalized template vectors for all materials...");
  const templateVectors: {
    id: string;
    name: string;
    rarity: number;
    vec: Float32Array;
  }[] = [];

  for (const mat of materials) {
    const imgPath = `public/images/materials/${mat.id}.png`;
    if (!fs.existsSync(imgPath)) continue;
    try {
      const ref = await readImage(imgPath);
      const bg = new Jimp({
        width: 256,
        height: 256,
        color: RARITY_COLORS[mat.rarity] || 0x737578ff,
      });
      bg.composite(ref, 0, 0);
      const refCrop = bg
        .crop({ x: 25, y: 25, w: 206, h: 206 })
        .resize({ w: SIZE, h: SIZE });
      const grays = getGraysFromJimp(refCrop);
      const vec = normalizeGrayscale(grays);
      templateVectors.push({
        id: mat.id,
        name: mat.name,
        rarity: mat.rarity,
        vec,
      });
    } catch (e) {
      // skip
    }
  }
  console.log(`Precomputed ${templateVectors.length} templates.`);

  // Now test against all 13 screenshots at startX = 347
  const sampleDir = "public/samples/test-set-01";
  const files = fs
    .readdirSync(sampleDir)
    .filter((f) => f.endsWith(".jpg"))
    .sort();
  const detectedIds = new Set<string>();
  const falsePositives = new Set<string>();

  const scale = 1272 / 1080;
  const cellW = Math.round(153 * scale),
    cellH = Math.round(189 * scale);
  const gapX = Math.round(30 * scale),
    gapY = Math.round(28 * scale);
  const startY = Math.round(149 * scale);
  const sx = 347;

  for (const file of files) {
    const img = await Jimp.read(path.join(sampleDir, file));
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 7; c++) {
        const x = sx + c * (cellW + gapX);
        const y = startY + r * (cellH + gapY);
        // Crop the icon area (centered square in upper portion of card)
        // Card is 180x223. Item icon is centered in top 150px
        const iconCrop = img
          .clone()
          .crop({
            x: Math.round(x + cellW * 0.11),
            y: Math.round(y + cellH * 0.08),
            w: Math.round(cellW * 0.78),
            h: Math.round(cellW * 0.78), // square aspect ratio!
          })
          .resize({ w: SIZE, h: SIZE });

        const grays = getGraysFromJimp(iconCrop);
        const vec = normalizeGrayscale(grays);

        let bestScore = -1;
        let bestMat: any = null;

        for (const t of templateVectors) {
          let dot = 0;
          for (let i = 0; i < N; i++) dot += vec[i] * t.vec[i];
          if (dot > bestScore) {
            bestScore = dot;
            bestMat = t;
          }
        }

        if (bestMat && bestScore >= 0.4) {
          detectedIds.add(bestMat.id);
          if (!expectedIds.has(bestMat.id)) {
            falsePositives.add(bestMat.id);
          }
        }
      }
    }
  }

  const hits = [...detectedIds].filter((id) => expectedIds.has(id)).length;
  const hitRate = (hits / expectedIds.size) * 100;
  console.log(`\n=== NCC SCAN RESULTS ===`);
  console.log(
    `Detected: ${hits} / ${expectedIds.size} (${hitRate.toFixed(1)}%)`,
  );
  console.log(`False Positives: ${falsePositives.size}`);
  const missing = [...expectedIds].filter((id) => !detectedIds.has(id));
  console.log(`Missing count: ${missing.length}`);
  if (missing.length > 0) {
    console.log("Missing first 15:", missing.slice(0, 15));
  }
}

run().catch(console.error);
