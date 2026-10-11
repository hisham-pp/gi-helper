import { Jimp } from "jimp";

async function findY() {
  const img = await Jimp.read(
    "public/samples/test-set-01/GenshinImpact_20261009_220839.jpg",
  );
  // Scan vertically at x = 400 (Col 0 center)
  console.log("Scanning vertical brightness at x = 400:");
  for (let y = 100; y < 1100; y += 20) {
    const px = img.getPixelColor(400, y);
    const r = (px >>> 24) & 0xff,
      g = (px >>> 16) & 0xff,
      b = (px >>> 8) & 0xff;
    const gray = r * 0.299 + g * 0.587 + b * 0.114;
    console.log(`y=${y}: gray=${gray.toFixed(0)} RGB=(${r},${g},${b})`);
  }
}

findY().catch(console.error);
