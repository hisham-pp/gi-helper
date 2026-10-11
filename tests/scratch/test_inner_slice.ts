import path from "path";
import { Jimp } from "jimp";

async function testCellSlicing() {
  const cell = await Jimp.read("scripts/user_cell_0.png");
  const w = cell.bitmap.width; // 180
  const h = cell.bitmap.height; // 223

  // Icon crop:
  const icon = cell.clone().crop({
    x: Math.round(w * 0.08),
    y: Math.round(h * 0.06),
    w: Math.round(w * 0.84),
    h: Math.round(h * 0.64),
  });
  await icon.write("scripts/test_icon_0.png");

  // Quantity crop:
  const qty = cell.clone().crop({
    x: Math.round(w * 0.1),
    y: Math.round(h * 0.82),
    w: Math.round(w * 0.8),
    h: Math.round(h * 0.16),
  });
  await qty.write("scripts/test_qty_0.png");

  // Stars crop:
  const stars = cell.clone().crop({
    x: Math.round(w * 0.08),
    y: Math.round(h * 0.68),
    w: Math.round(w * 0.84),
    h: Math.round(h * 0.16),
  });
  await stars.write("scripts/test_stars_0.png");

  console.log("Saved test_icon_0.png, test_qty_0.png, test_stars_0.png");
}

testCellSlicing().catch(console.error);
