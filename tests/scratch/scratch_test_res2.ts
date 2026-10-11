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

function getNormalizedGrays(img: any, size: number): Float32Array {
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

async function testRes() {
  const img = await Jimp.read("public/samples/test-set-01/GenshinImpact_20261009_220714.jpg");
  const scale = 1272 / 1080;
  const cellW = Math.round(153 * scale), cellH = Math.round(189 * scale);
  const gapX = Math.round(30 * scale), gapY = Math.round(28 * scale);
  const startY = Math.round(149 * scale);
  const sx = 347;

  // Cell R2:C5 (Chaos Device)
  const x = sx + 4 * (cellW + gapX);
  const y = startY + 1 * (cellH + gapY);
  const cell = img.clone().crop({ x, y, w: cellW, h: cellH });

  const cellX = Math.round(cellW * 0.14);
  const cellY = Math.round(cellH * 0.11);
  const cellS = Math.round(cellW * 0.78);
  const cellCrop = cell.clone().crop({ x: cellX, y: cellY, w: cellS, h: cellS });

  const ref = await readImage("public/images/materials/chaos-device.png");
  const bg = new Jimp({ width: 256, height: 256, color: 0x609373ff });
  bg.composite(ref, 0, 0);
  const refCrop = bg.crop({ x: 30, y: 30, w: 196, h: 196 });

  for (const size of [16, 20, 24, 32]) {
    const cVec = getNormalizedGrays(cellCrop, size);
    const rVec = getNormalizedGrays(refCrop, size);
    console.log(`Size ${size}x${size} (${size*size} values): score = ${(ncc(cVec, rVec) * 100).toFixed(1)}%`);
  }
}

testRes().catch(console.error);
