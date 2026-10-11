import path from "path";
import { Jimp } from "jimp";

async function findGridCoordinates() {
  const sample = await Jimp.read(
    "public/samples/GenshinImpact_20261009_220714.jpg",
  );

  // Let's visually inspect where the first item [0, 0] starts:
  // The first item (Tea-Scented Tassel) has a distinct purple card background.
  // Let's scan horizontally across y = 250 from x = 300 to x = 600.
  // The card has a light background, whereas the space between the sidebar and the first card is dark.

  console.log("Finding startX of cell [0, 0]:");
  for (let x = 300; x < 450; x += 5) {
    const rgba = sample.getPixelColor(x, 250);
    const r = (rgba >>> 24) & 0xff;
    const g = (rgba >>> 16) & 0xff;
    const b = (rgba >>> 8) & 0xff;
    console.log(`x=${x}: RGB=(${r},${g},${b})`);
  }
}

findGridCoordinates().catch(console.error);
