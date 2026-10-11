import sharp from "sharp";
import { Jimp } from "jimp";

async function readImage(p: string) {
  const buf = await sharp(p).png().toBuffer();
  return await Jimp.read(buf);
}

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

async function findBestAlignment() {
  const cell = await Jimp.read("crop_347.png"); // 180 x 223 Tea-Scented Tassel
  const ref = await readImage("public/images/materials/tea-scented-tassel.png");

  // Create purple background for ref
  const bg = new Jimp({ width: 256, height: 256, color: 0x9e73b9ff });
  bg.composite(ref, 0, 0);

  // We want to find:
  // In ref (256x256), what is the bounding box of the icon?
  // In cell (180x223), what is the bounding box of the icon?
  // Let's test refCrop from (0,0,256,256) with various margins vs cellCrop with various margins:
  let maxScore = -1;
  let bestParams: any = null;

  for (let refMargin = 0; refMargin <= 30; refMargin += 5) {
    const refCrop = bg.clone().crop({
      x: refMargin,
      y: refMargin,
      w: 256 - 2 * refMargin,
      h: 256 - 2 * refMargin
    });
    const refVec = getNormalizedGrays(refCrop, 32);

    for (let cellX = 10; cellX <= 30; cellX += 5) {
      for (let cellY = 5; cellY <= 30; cellY += 5) {
        for (let cellS = 120; cellS <= 160; cellS += 5) {
          if (cellX + cellS > 180 || cellY + cellS > 223) continue;
          const cellCrop = cell.clone().crop({ x: cellX, y: cellY, w: cellS, h: cellS });
          const cellVec = getNormalizedGrays(cellCrop, 32);
          const score = ncc(cellVec, refVec);
          if (score > maxScore) {
            maxScore = score;
            bestParams = { refMargin, cellX, cellY, cellS, score };
          }
        }
      }
    }
  }

  console.log("Best alignment for Tea-Scented Tassel:");
  console.log(bestParams);
  console.log(`Max NCC Score: ${(maxScore * 100).toFixed(1)}%`);
}

findBestAlignment().catch(console.error);
