/**
 * Regenerates material-hashes.json using the new 256-bit dHash + color histogram
 * fingerprint format. Run with: npx tsx scripts/generate-hashes.ts
 */
import fs from "fs";
import path from "path";
import { Jimp } from "jimp";
import materialsData from "../src/data/materials.json";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const IMAGES_DIR = path.join(process.cwd(), "public", "images", "materials");
const HASHES_FILE = path.join(DATA_DIR, "material-hashes.json");

const DHASH_W = 17;
const DHASH_H = 16;
const HIST_BINS = 8;

interface Fingerprint {
  dHash: string;
  colorHist: number[];
}

const RARITY_COLORS: Record<number, number> = {
  5: 0xdca451ff, // Gold
  4: 0x9e73b9ff, // Purple
  3: 0x587db4ff, // Blue
  2: 0x609373ff, // Green
  1: 0x737578ff, // Gray
};

async function computeFingerprint(imgPath: string, rarity: number = 1): Promise<Fingerprint> {
  const image = await Jimp.read(imgPath);
  const { width, height } = image.bitmap;

  // Composite icon onto a colored background matching its rarity
  // to simulate in-game rendering. This ensures the color histogram
  // matches what the scanner sees.
  const bgColor = RARITY_COLORS[rarity] || RARITY_COLORS[1];
  const bg = new Jimp({ width, height, color: bgColor });
  bg.composite(image, 0, 0);

  // Center-crop to 80%
  const cx = Math.floor(width * 0.1);
  const cy = Math.floor(height * 0.1);
  const cw = Math.max(1, width - 2 * cx);
  const ch = Math.max(1, height - 2 * cy);

  const cropped = bg.crop({ x: cx, y: cy, w: cw, h: ch });

  // --- 256-bit dHash ---
  const hashImg = cropped.clone().resize({ w: DHASH_W, h: DHASH_H });
  const grays = new Uint8Array(DHASH_W * DHASH_H);
  for (let y = 0; y < DHASH_H; y++) {
    for (let x = 0; x < DHASH_W; x++) {
      const rgba = hashImg.getPixelColor(x, y);
      const r = (rgba >>> 24) & 0xff;
      const g = (rgba >>> 16) & 0xff;
      const b = (rgba >>> 8) & 0xff;
      grays[y * DHASH_W + x] = r * 0.299 + g * 0.587 + b * 0.114;
    }
  }

  let hashBits = "";
  for (let y = 0; y < DHASH_H; y++) {
    for (let x = 0; x < DHASH_W - 1; x++) {
      const idx = y * DHASH_W + x;
      hashBits += grays[idx] > grays[idx + 1] ? "1" : "0";
    }
  }

  let dHash = "";
  for (let i = 0; i < hashBits.length; i += 4) {
    dHash += parseInt(hashBits.slice(i, i + 4), 2).toString(16);
  }

  // --- Color Histogram (RGB, 8 bins each) ---
  const histImg = cropped.clone().resize({ w: 32, h: 32 });
  const rHist = new Float32Array(HIST_BINS);
  const gHist = new Float32Array(HIST_BINS);
  const bHist = new Float32Array(HIST_BINS);
  const binSize = 256 / HIST_BINS;
  let totalPixels = 0;

  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const rgba = histImg.getPixelColor(x, y);
      // Jimp stores pixels as 0xRRGGBBAA
      const r = (rgba >>> 24) & 0xff;
      const g = (rgba >>> 16) & 0xff;
      const b = (rgba >>> 8) & 0xff;
      const a = rgba & 0xff;
      if (a < 10) continue; // Skip transparent pixels
      rHist[Math.floor(r / binSize)]++;
      gHist[Math.floor(g / binSize)]++;
      bHist[Math.floor(b / binSize)]++;
      totalPixels++;
    }
  }

  const colorHist: number[] = [];
  if (totalPixels > 0) {
    for (let b = 0; b < HIST_BINS; b++) colorHist.push(rHist[b] / totalPixels);
    for (let b = 0; b < HIST_BINS; b++) colorHist.push(gHist[b] / totalPixels);
    for (let b = 0; b < HIST_BINS; b++) colorHist.push(bHist[b] / totalPixels);
  } else {
    for (let b = 0; b < HIST_BINS * 3; b++) colorHist.push(0);
  }

  return { dHash, colorHist };
}

async function generateHashes() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(
      `Images directory not found at ${IMAGES_DIR}. Please run scrape-materials.ts first!`,
    );
    process.exit(1);
  }

  const hashes: Record<string, Fingerprint> = {};
  let success = 0;
  let skipped = 0;

  for (const material of materialsData) {
    const imgPath = path.join(IMAGES_DIR, `${material.id}.png`);
    if (!fs.existsSync(imgPath)) {
      console.warn(`⚠  Missing image for ${material.id}`);
      skipped++;
      continue;
    }

    try {
      const fingerprint = await computeFingerprint(imgPath, material.rarity);
      hashes[material.id] = fingerprint;
      console.log(`✓ ${material.id}: ${fingerprint.dHash}`);
      success++;
    } catch (e) {
      console.error(`✗ Failed to hash ${material.id}`, e);
      skipped++;
    }
  }

  fs.writeFileSync(HASHES_FILE, JSON.stringify(hashes, null, 2));
  console.log(
    `\nDone! Saved ${success} fingerprints (${skipped} skipped) to ${HASHES_FILE}`,
  );
}

generateHashes().catch(console.error);
