import { Jimp } from "jimp";

async function verifyExpandedBoxes() {
  const sample = await Jimp.read(
    "public/samples/GenshinImpact_20261009_220714.jpg",
  );

  // Coordinates of cell [2, 4]
  const row = 2;
  const col = 4;
  const cx = 347 + col * (180 + 35);
  const cy = 175 + row * (223 + 33);
  const w = 180;
  const h = 223;

  const cell = sample.clone().crop({ x: cx, y: cy, w, h });

  // 1. Star Box:
  const starBox = {
    x: Math.round(w * 0.05),
    y: Math.round(h * 0.7),
    w: Math.round(w * 0.9),
    h: Math.round(h * 0.17),
  };
  const starImg = cell.clone().crop(starBox);
  await starImg.write("scripts/verified_star_box.png");

  // 2. Number Box:
  const numBox = {
    x: Math.round(w * 0.05),
    y: Math.round(h * 0.84),
    w: Math.round(w * 0.9),
    h: Math.round(h * 0.15),
  };
  const numImg = cell.clone().crop(numBox);
  await numImg.write("scripts/verified_num_box.png");

  // Also test cell [2, 3] (53) and [2, 6] (89)
  for (const c of [3, 6]) {
    const ccx = 347 + c * (180 + 35);
    const cCell = sample.clone().crop({ x: ccx, y: cy, w, h });
    const cNum = cCell.clone().crop(numBox);
    await cNum.write(`scripts/verified_num_${c}.png`);
  }

  console.log("Verified boxes saved to scripts/verified_*.png");
}

verifyExpandedBoxes().catch(console.error);
