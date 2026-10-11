import { Jimp } from "jimp";
import fs from "fs";

const materials = JSON.parse(fs.readFileSync("src/data/materials.json", "utf-8"));
const hashes = JSON.parse(fs.readFileSync("src/data/material-hashes.json", "utf-8"));

// Let's test on several known materials in test-set-01:
// In GenshinImpact_20261009_220714.jpg at startX=347:
// Cell [0, 0]: Tea-Scented Tassel (4-star) -> tea-scented-tassel
// In GenshinImpact_20261009_220714.jpg:
// Let's test cell [0, 0] with different crop boxes inside the 180x223 cell.

function hamming(a: string, b: string): number {
  let d = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    let x = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    while (x > 0) { d += x & 1; x >>= 1; }
  }
  return d;
}

function computeDHash(img: any): string {
  const grays = new Uint8Array(17 * 16);
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 17; x++) {
      const rgba = img.getPixelColor(x, y);
      const r = (rgba >>> 24) & 0xff, g = (rgba >>> 16) & 0xff, b = (rgba >>> 8) & 0xff;
      grays[y * 17 + x] = r * 0.299 + g * 0.587 + b * 0.114;
    }
  }
  let hashBits = "";
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      hashBits += grays[y * 17 + x] > grays[y * 17 + x + 1] ? "1" : "0";
    }
  }
  let dHash = "";
  for (let i = 0; i < hashBits.length; i += 4) {
    dHash += parseInt(hashBits.slice(i, i + 4), 2).toString(16);
  }
  return dHash;
}

async function testCrops() {
  const cell = await Jimp.read("crop_347.png"); // 180 x 223
  const targetId = "tea-scented-tassel";
  const storedHash = (hashes as any)[targetId]?.dHash;
  console.log("Target stored hash:", storedHash);

  // Current method in orchestrator:
  // iconRect: x=0.06w (11), y=0.05h (11), w=0.88w (158), h=0.65h (145)
  // then calculateFingerprint crops 10% center: x=16, y=14, w=126, h=117
  const currentCrop = cell.clone().crop({ x: 11 + 16, y: 11 + 14, w: 126, h: 117 }).resize({ w: 17, h: 16 });
  const currentHash = computeDHash(currentCrop);
  console.log("Current method hamming distance:", hamming(currentHash, storedHash), "similarity:", (1 - hamming(currentHash, storedHash)/256)*100 + "%");

  // Now let's grid search the crop box (x, y, w, h) inside 180x223 to see what gets the highest similarity!
  let bestDist = 999;
  let bestBox = { x: 0, y: 0, w: 0, h: 0 };

  for (let w = 120; w <= 170; w += 5) {
    for (let h = 120; h <= 170; h += 5) {
      for (let x = 5; x <= 180 - w; x += 5) {
        for (let y = 5; y <= 160 - h; y += 5) {
          const c = cell.clone().crop({ x, y, w, h }).resize({ w: 17, h: 16 });
          const d = hamming(computeDHash(c), storedHash);
          if (d < bestDist) {
            bestDist = d;
            bestBox = { x, y, w, h };
          }
        }
      }
    }
  }

  console.log(`Best crop box: x=${bestBox.x}, y=${bestBox.y}, w=${bestBox.w}, h=${bestBox.h} (aspect=${(bestBox.w/bestBox.h).toFixed(2)})`);
  console.log("Best hamming distance:", bestDist, "similarity:", (1 - bestDist/256)*100 + "%");
}

testCrops().catch(console.error);
