import { Jimp } from "jimp";
import fs from "fs";
import path from "path";

const sampleDir = "public/samples/test-set-01";
const files = fs
  .readdirSync(sampleDir)
  .filter((f) => f.endsWith(".jpg"))
  .sort();
const expectedData = JSON.parse(
  fs.readFileSync(path.join(sampleDir, "expected.json"), "utf8"),
);
const expectedIds = new Set(expectedData.items.map((i: any) => i.id));

async function inspectAllCells() {
  const scale = 1272 / 1080;
  const cellW = Math.round(153 * scale),
    cellH = Math.round(189 * scale);
  const gapX = Math.round(30 * scale),
    gapY = Math.round(28 * scale);
  const startY = Math.round(149 * scale);
  const sx = 347;

  let totalSlots = 0;
  let emptySlots = 0;

  for (const file of files) {
    const img = await Jimp.read(path.join(sampleDir, file));
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 7; c++) {
        totalSlots++;
        const x = sx + c * (cellW + gapX);
        const y = startY + r * (cellH + gapY);
        const cell = img.clone().crop({ x, y, w: cellW, h: cellH });
        // Check if empty
        const sample = cell.clone().resize({ w: 16, h: 16 });
        let sum = 0,
          sumSq = 0;
        for (let sy = 0; sy < 16; sy++) {
          for (let sc = 0; sc < 16; sc++) {
            const px = sample.getPixelColor(sc, sy);
            const rC = (px >>> 24) & 0xff,
              gC = (px >>> 16) & 0xff,
              bC = (px >>> 8) & 0xff;
            const gray = rC * 0.299 + gC * 0.587 + bC * 0.114;
            sum += gray;
            sumSq += gray * gray;
          }
        }
        const mean = sum / 256;
        const stddev = Math.sqrt(sumSq / 256 - mean * mean);
        if (stddev < 15 && mean < 60) {
          emptySlots++;
        }
      }
    }
  }

  console.log(
    `Total slots: ${totalSlots}, Empty slots: ${emptySlots}, Non-empty slots: ${totalSlots - emptySlots}`,
  );
  console.log(`Expected unique items: ${expectedIds.size}`);
}

inspectAllCells().catch(console.error);
