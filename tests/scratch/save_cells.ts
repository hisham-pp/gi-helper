import path from "path";
import { Jimp } from "jimp";

async function saveCells() {
  const sample = await Jimp.read(
    "public/samples/GenshinImpact_20261009_220714.jpg",
  );
  // 552, 212, 141, 165
  for (let c = 0; c < 5; c++) {
    const x = 552 + c * (141 + 19);
    const y = 212;
    const cell = sample.clone().crop({ x, y, w: 141, h: 165 });
    await cell.write(`scripts/cell_${c}.png`);
  }
  console.log("Saved cells 0..4 to scripts/cell_*.png");
}

saveCells().catch(console.error);
