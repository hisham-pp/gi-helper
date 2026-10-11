import path from "path";
import { Jimp } from "jimp";

async function cropWithUserConfig() {
  const sample = await Jimp.read(
    "public/samples/GenshinImpact_20261009_220714.jpg",
  );

  const config = {
    columns: 7,
    rows: 4,
    startX: 347,
    startY: 175,
    cellWidth: 180,
    cellHeight: 223,
    gapX: 35,
    gapY: 33,
  };

  for (let c = 0; c < 7; c++) {
    const x = config.startX + c * (config.cellWidth + config.gapX);
    const y = config.startY;
    const w = config.cellWidth;
    const h = config.cellHeight;

    const cell = sample.clone().crop({ x, y, w, h });
    await cell.write(`scripts/user_cell_${c}.png`);
  }

  console.log("Saved cells with user config: scripts/user_cell_0..6.png");
}

cropWithUserConfig().catch(console.error);
