import path from "path";
import { Jimp } from "jimp";

async function testStars() {
  const sample = await Jimp.read(
    "public/samples/GenshinImpact_20261009_220714.jpg",
  );

  // Let's find the exact bounds of cell 0 in 2800x1272:
  // In cell_0.png, it was 141x165 cropped from (552, 212)
  const cell = sample.clone().crop({ x: 552, y: 212, w: 141, h: 165 });

  // Let's print out the pixel colors near the stars (y from 115 to 145)
  console.log("Cell width:", cell.bitmap.width, "height:", cell.bitmap.height);

  for (let y = 120; y <= 145; y += 5) {
    let row = `y=${y}: `;
    for (let x = 10; x < 135; x += 10) {
      const rgba = cell.getPixelColor(x, y);
      const r = (rgba >>> 24) & 0xff;
      const g = (rgba >>> 16) & 0xff;
      const b = (rgba >>> 8) & 0xff;
      // Is yellow?
      const isYellow = r > 200 && g > 170 && b < 100;
      row += isYellow ? `★(${x}) ` : `. `;
    }
    console.log(row);
  }
}

testStars().catch(console.error);
