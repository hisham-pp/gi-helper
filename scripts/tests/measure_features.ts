import { Jimp } from "jimp";

async function measureExactFeatures() {
  const cell = await Jimp.read("scripts/cell_2_4.png");
  const w = cell.bitmap.width; // 180
  const h = cell.bitmap.height; // 223

  // For each row y from 120 to 223:
  // Check for:
  // 1. Golden star pixels (r > 185, g > 150, b < 130, r - b > 55)
  // 2. White/dark number pixels in the bottom white strip
  // The bottom white/cream strip starts where the background turns light (y ~ 180 to 223)

  console.log("Analyzing cell [2, 4] vertical distribution (h = " + h + "):");
  for (let y = 130; y < h; y++) {
    let starPixels = 0;
    let darkTextPixels = 0;
    let lightBgPixels = 0;

    for (let x = 0; x < w; x++) {
      const rgba = cell.getPixelColor(x, y);
      const r = (rgba >>> 24) & 0xff;
      const g = (rgba >>> 16) & 0xff;
      const b = (rgba >>> 8) & 0xff;

      if (r > 185 && g > 150 && b < 130 && r - b > 55) {
        starPixels++;
      }
      // White/cream banner: r > 200 && g > 200 && b > 190
      if (r > 200 && g > 190 && b > 180) {
        lightBgPixels++;
      }
      // Text "4" is dark blue-gray (r < 100, g < 100, b < 120) on light banner
      if (r < 100 && g < 110 && b < 130) {
        darkTextPixels++;
      }
    }

    if (starPixels > 0 || darkTextPixels > 0 || y % 5 === 0) {
      console.log(
        `y=${y} (${(y / h).toFixed(3)}h): starPixels=${starPixels}, darkTextPixels=${darkTextPixels}, lightBgPixels=${lightBgPixels}`,
      );
    }
  }
}

measureExactFeatures().catch(console.error);
