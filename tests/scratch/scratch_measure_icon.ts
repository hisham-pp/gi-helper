import { Jimp } from "jimp";

async function measureIcon() {
  const cell = await Jimp.read("crop_347.png"); // 180 x 223
  const w = cell.bitmap.width; // 180
  const h = cell.bitmap.height; // 223

  // The card has:
  // Top padding: cell starts with rounded top border
  // Let's test several bounding boxes for the icon inside the 180x223 cell:
  // Option A (current iconRect): x = 0.06w (11), y = 0.05h (11), w = 0.88w (158), h = 0.65h (145)
  // Option B (square centered on item):
  // Where is the center of the item?
  // Let's crop a 140x140 square centered at x = 90, y = 80:
  const sq1 = cell.clone().crop({ x: 20, y: 10, w: 140, h: 140 });
  await sq1.write("icon_sq140.png");

  // Let's do the same on found_chaos_device.png
  const cdCell = await Jimp.read("test_r2_c5_GenshinImpact_20261009_220821_347.png");
  const cdSq = cdCell.clone().crop({ x: 20, y: 10, w: 140, h: 140 });
  await cdSq.write("icon_cd_sq140.png");

  console.log("Saved square icon crops");
}

measureIcon().catch(console.error);
