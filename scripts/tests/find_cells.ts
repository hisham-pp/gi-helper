import path from "path";
import { Jimp } from "jimp";

async function findExactCells() {
  const sample = await Jimp.read(
    "public/samples/GenshinImpact_20261009_220714.jpg",
  );
  const w = sample.bitmap.width;
  const h = sample.bitmap.height;
  console.log(`Image size: ${w}x${h}`);

  // In this screenshot (2800x1272):
  // Let's find where the inventory grid actually begins horizontally and vertically.
  // The inventory cells have distinct light/colored background cards vs dark background.
  // Let's scan along horizontal lines:
  // For y between 200 and 400, let's scan x from 200 to 2600.
  // Find where the cells start and where the gaps are.

  const yScan = Math.round(h * 0.25); // around y = 318
  console.log(`Scanning horizontal line at y = ${yScan}:`);

  const brightnesses: number[] = [];
  for (let x = 0; x < w; x++) {
    const rgba = sample.getPixelColor(x, yScan);
    const r = (rgba >>> 24) & 0xff;
    const g = (rgba >>> 16) & 0xff;
    const b = (rgba >>> 8) & 0xff;
    // Cell cards are lighter/colored, background is dark menu (~#2d2540 or ~#2a2d34, brightness < 70)
    const gray = r * 0.299 + g * 0.587 + b * 0.114;
    brightnesses.push(gray);
  }

  // Find intervals of higher brightness (the 7 cells in the row!)
  let inCell = false;
  let cellStart = 0;
  const detectedIntervals: { start: number; end: number; width: number }[] = [];

  for (let x = 0; x < w; x++) {
    // If brightness is distinctly higher than background
    const isCard = brightnesses[x] > 75;
    if (isCard && !inCell) {
      inCell = true;
      cellStart = x;
    } else if (!isCard && inCell) {
      inCell = false;
      const width = x - cellStart;
      if (width > 50) {
        // filter noise
        detectedIntervals.push({ start: cellStart, end: x, width });
      }
    }
  }

  console.log(`Detected card horizontal intervals at y=${yScan}:`);
  for (let i = 0; i < detectedIntervals.length; i++) {
    const curr = detectedIntervals[i];
    const next = detectedIntervals[i + 1];
    const gap = next ? next.start - curr.end : 0;
    console.log(
      `  Cell ${i}: x=${curr.start} to ${curr.end} (width=${curr.width}px), gap to next: ${gap}px`,
    );
  }
}

findExactCells().catch(console.error);
