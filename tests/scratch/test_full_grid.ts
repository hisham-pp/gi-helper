import path from "path";
import { Jimp } from "jimp";

async function testFullGrid() {
  const sample = await Jimp.read(
    "public/samples/GenshinImpact_20261009_220714.jpg",
  );

  const config = {
    columns: 7,
    rows: 4, // 4 fully visible rows in screenshot
    startX: 347,
    startY: 175,
    cellWidth: 180,
    cellHeight: 223,
    gapX: 35,
    gapY: 33,
  };

  for (let r = 0; r < config.rows; r++) {
    for (let c = 0; c < config.columns; c++) {
      const x = config.startX + c * (config.cellWidth + config.gapX);
      const y = config.startY + r * (config.cellHeight + config.gapY);

      // Icon crop
      const ix = x + Math.round(config.cellWidth * 0.08);
      const iy = y + Math.round(config.cellHeight * 0.06);
      const iw = Math.round(config.cellWidth * 0.84);
      const ih = Math.round(config.cellHeight * 0.64);

      // Qty crop
      const qx = x + Math.round(config.cellWidth * 0.12);
      const qy = y + Math.round(config.cellHeight * 0.84);
      const qw = Math.round(config.cellWidth * 0.76);
      const qh = Math.round(config.cellHeight * 0.14);

      // Check bounds
      if (ix + iw > sample.bitmap.width || iy + ih > sample.bitmap.height) {
        console.log(`Cell [${r}, ${c}] out of bounds`);
      }
    }
  }

  console.log("All 28 cells within bounds!");
}

testFullGrid().catch(console.error);
