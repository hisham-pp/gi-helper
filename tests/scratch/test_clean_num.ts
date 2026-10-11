import { Jimp } from "jimp";

async function testCleanNumBox() {
  const sample = await Jimp.read(
    "public/samples/GenshinImpact_20261009_220714.jpg",
  );
  const cy = 175 + 2 * (223 + 33);
  const w = 180;
  const h = 223;

  for (const c of [3, 4, 5, 6]) {
    const cx = 347 + c * (180 + 35);
    const cell = sample.clone().crop({ x: cx, y: cy, w, h });

    const cleanNum = cell.clone().crop({
      x: Math.round(w * 0.05),
      y: Math.round(h * 0.865),
      w: Math.round(w * 0.9),
      h: Math.round(h * 0.135),
    });
    await cleanNum.write(`scripts/clean_num_${c}.png`);
  }
}

testCleanNumBox().catch(console.error);
