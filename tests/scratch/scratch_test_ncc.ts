import sharp from "sharp";
import { Jimp } from "jimp";

async function readImage(p: string) {
  const buf = await sharp(p).png().toBuffer();
  return await Jimp.read(buf);
}

// Normalized Cross Correlation between two grayscale arrays of length N:
function ncc(a: Float32Array, b: Float32Array): number {
  let meanA = 0,
    meanB = 0;
  const n = a.length;
  for (let i = 0; i < n; i++) {
    meanA += a[i];
    meanB += b[i];
  }
  meanA /= n;
  meanB /= n;

  let num = 0,
    denA = 0,
    denB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }
  const denom = Math.sqrt(denA * denB);
  return denom === 0 ? 0 : num / denom;
}

async function getGrayscale(
  img: any,
  size: number = 32,
): Promise<Float32Array> {
  const scaled = img.clone().resize({ w: size, h: size });
  const grays = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const rgba = scaled.getPixelColor(x, y);
      const r = (rgba >>> 24) & 0xff,
        g = (rgba >>> 16) & 0xff,
        b = (rgba >>> 8) & 0xff;
      grays[y * size + x] = r * 0.299 + g * 0.587 + b * 0.114;
    }
  }
  return grays;
}

async function testNCC() {
  const user = await Jimp.read("user_crop_extracted.png");
  // Icon is in top 70% of cell
  const iconCrop = user
    .clone()
    .crop({
      x: 5,
      y: 5,
      w: user.bitmap.width - 10,
      h: Math.round(user.bitmap.height * 0.7),
    });
  const iconGrays = await getGrayscale(iconCrop, 32);

  const testIds = [
    "chaos-device",
    "chaos-circuit",
    "chaos-module",
    "sublimation-of-pure-sacred-dewdrop",
    "remnant-glow-of-scorching-might",
    "heavy-horn",
    "refractive-bud",
  ];

  console.log("NCC scores for user crop (Chaos Device):");
  for (const id of testIds) {
    const ref = await readImage(`public/images/materials/${id}.png`);
    const bg = new Jimp({ width: 256, height: 256, color: 0x609373ff }); // green background
    bg.composite(ref, 0, 0);
    const refCrop = bg.crop({ x: 25, y: 25, w: 206, h: 206 });
    const refGrays = await getGrayscale(refCrop, 32);
    const score = ncc(iconGrays, refGrays);
    console.log(`  ${id}: ${(score * 100).toFixed(1)}%`);
  }
}

testNCC().catch(console.error);
