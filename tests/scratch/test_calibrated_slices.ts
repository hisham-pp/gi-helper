import { Jimp } from "jimp";

async function testCalibratedInnerSlices() {
  for (const col of [3, 4, 5, 6]) {
    const cell = await Jimp.read(`scripts/cell_2_${col}.png`);
    const w = cell.bitmap.width; // 180
    const h = cell.bitmap.height; // 223

    // 1. Icon Rect (Blue):
    // From top down to right above the stars
    const iconRect = {
      x: Math.round(w * 0.06),
      y: Math.round(h * 0.05),
      w: Math.round(w * 0.88),
      h: Math.round(h * 0.67),
    };

    // 2. Star Rect (Gold/Yellow):
    // From 0.71h to 0.86h
    const starRect = {
      x: Math.round(w * 0.05),
      y: Math.round(h * 0.71),
      w: Math.round(w * 0.9),
      h: Math.round(h * 0.15),
    };

    // 3. Number/Quantity Rect (Green):
    // From 0.85h to 0.99h
    const numberRect = {
      x: Math.round(w * 0.08),
      y: Math.round(h * 0.85),
      w: Math.round(w * 0.84),
      h: Math.round(h * 0.14),
    };

    const iconImg = cell.clone().crop(iconRect);
    const starImg = cell.clone().crop(starRect);
    const numImg = cell.clone().crop(numberRect);

    await iconImg.write(`scripts/slice_${col}_icon.png`);
    await starImg.write(`scripts/slice_${col}_star.png`);
    await numImg.write(`scripts/slice_${col}_num.png`);
  }

  console.log("Calibrated slices written!");
}

testCalibratedInnerSlices().catch(console.error);
