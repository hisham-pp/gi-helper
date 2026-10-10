import { Jimp } from "jimp";

async function inspectRow2Cells() {
  const sample = await Jimp.read("public/samples/GenshinImpact_20261009_220714.jpg");

  // Grid coordinates:
  // startX: 347, startY: 175, cellWidth: 180, cellHeight: 223, gapX: 35, gapY: 33
  // Row 2:
  const row = 2;
  const y = 175 + row * (223 + 33); // 175 + 2 * 256 = 687

  for (const col of [3, 4, 5, 6]) {
    const x = 347 + col * (180 + 35); // col * 215
    const cell = sample.clone().crop({ x, y, w: 180, h: 223 });
    await cell.write(`scripts/cell_2_${col}.png`);

    // Let's test different number/quantity and star crops on cell [2, 4]
    if (col === 4) {
      // Current CanvasGridOverlay quantity box:
      // qx = 0.1w = 18, qy = 0.75h = 167, qw = 0.8w = 144, qh = 0.2h = 45
      const oldCanvasQty = cell.clone().crop({ x: 18, y: 167, w: 144, h: 45 });
      await oldCanvasQty.write("scripts/cell_2_4_old_canvas_box.png");

      // Stars crop (just the stars):
      // Stars y: around 145 to 180 (0.65h to 0.81h)
      const starsOnly = cell.clone().crop({
        x: Math.round(180 * 0.05),
        y: Math.round(223 * 0.65),
        w: Math.round(180 * 0.90),
        h: Math.round(223 * 0.17),
      });
      await starsOnly.write("scripts/cell_2_4_stars_only.png");

      // Number crop (just the number "4"):
      // Number y: around 180 to 220 (0.80h to 0.98h)
      const numberOnly = cell.clone().crop({
        x: Math.round(180 * 0.05),
        y: Math.round(223 * 0.81),
        w: Math.round(180 * 0.90),
        h: Math.round(223 * 0.17),
      });
      await numberOnly.write("scripts/cell_2_4_number_only.png");
    }
  }

  console.log("Done cropping row 2 cells!");
}

inspectRow2Cells().catch(console.error);
