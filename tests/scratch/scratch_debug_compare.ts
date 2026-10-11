import fs from "fs";
import { Jimp } from "jimp";

const hashes = JSON.parse(
  fs.readFileSync("src/data/material-hashes.json", "utf-8"),
);
const materials = JSON.parse(
  fs.readFileSync("src/data/materials.json", "utf-8"),
);

function hamming(a: string, b: string): number {
  let d = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    let x = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    while (x > 0) {
      d += x & 1;
      x >>= 1;
    }
  }
  return d;
}

function histInter(h1: number[], h2: number[]): number {
  let s = 0;
  for (let i = 0; i < Math.min(h1.length, h2.length); i++)
    s += Math.min(h1[i], h2[i]);
  return s / 3;
}

async function debugCompare() {
  const img = await Jimp.read(
    "public/samples/test-set-01/GenshinImpact_20261009_220714.jpg",
  );
  const scale = 1272 / 1080;
  const cellW = Math.round(153 * scale),
    cellH = Math.round(189 * scale);
  const gapX = Math.round(30 * scale),
    gapY = Math.round(28 * scale);
  const startY = Math.round(149 * scale);
  const sx = 347;

  // R2:C5 is r=1, c=4
  const x = sx + 4 * (cellW + gapX);
  const y = startY + 1 * (cellH + gapY);

  const cell = img.clone().crop({ x, y, w: cellW, h: cellH });
  const icon = cell.clone().crop({
    x: Math.round(cellW * 0.06),
    y: Math.round(cellH * 0.05),
    w: Math.round(cellW * 0.88),
    h: Math.round(cellH * 0.65),
  });

  // Calculate fingerprint
  const width = icon.bitmap.width,
    height = icon.bitmap.height;
  const cx = Math.floor(width * 0.1),
    cy = Math.floor(height * 0.1);
  const cw = Math.max(1, width - 2 * cx),
    ch = Math.max(1, height - 2 * cy);
  const hashImg = icon
    .clone()
    .crop({ x: cx, y: cy, w: cw, h: ch })
    .resize({ w: 17, h: 16 });
  const grays = new Uint8Array(17 * 16);
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 17; x++) {
      const rgba = hashImg.getPixelColor(x, y);
      grays[y * 17 + x] =
        ((rgba >>> 24) & 0xff) * 0.299 +
        ((rgba >>> 16) & 0xff) * 0.587 +
        ((rgba >>> 8) & 0xff) * 0.114;
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

  const hx = Math.floor(width * 0.25),
    hy = Math.floor(height * 0.25);
  const hw = Math.max(1, width - 2 * hx),
    hh = Math.max(1, height - 2 * hy);
  const histImg = icon
    .clone()
    .crop({ x: hx, y: hy, w: hw, h: hh })
    .resize({ w: 32, h: 32 });
  const rH = new Float32Array(8),
    gH = new Float32Array(8),
    bH = new Float32Array(8);
  let total = 0;
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const rgba = histImg.getPixelColor(x, y);
      if ((rgba & 0xff) < 10) continue;
      rH[Math.floor(((rgba >>> 24) & 0xff) / 32)]++;
      gH[Math.floor(((rgba >>> 16) & 0xff) / 32)]++;
      bH[Math.floor(((rgba >>> 8) & 0xff) / 32)]++;
      total++;
    }
  }
  const colorHist: number[] = [];
  for (let b = 0; b < 8; b++) colorHist.push(rH[b] / total);
  for (let b = 0; b < 8; b++) colorHist.push(gH[b] / total);
  for (let b = 0; b < 8; b++) colorHist.push(bH[b] / total);

  console.log("Crop dHash:", dHash);

  for (const id of [
    "chaos-device",
    "teachings-of-ingenuity",
    "teachings-of-praxis",
    "sublimation-of-pure-sacred-dewdrop",
  ]) {
    const stored = (hashes as any)[id];
    const dist = hamming(dHash, stored.dHash);
    const hashSim = 1 - dist / 256;
    const colorSim = histInter(colorHist, stored.colorHist);
    const score = 0.8 * hashSim + 0.2 * colorSim;
    console.log(`\n${id}:`);
    console.log(
      `  hamming dist = ${dist}/256 (hashSim = ${(hashSim * 100).toFixed(1)}%)`,
    );
    console.log(`  colorSim = ${(colorSim * 100).toFixed(1)}%`);
    console.log(
      `  composite (0.8*hash + 0.2*color) = ${(score * 100).toFixed(1)}%`,
    );
  }
}

debugCompare().catch(console.error);
