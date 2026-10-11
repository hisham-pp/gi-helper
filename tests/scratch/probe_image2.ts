import { Jimp } from "jimp";

async function probeImage() {
  const img = await Jimp.read(
    "public/samples/test-set-01/GenshinImpact_20261009_220714.jpg",
  );
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  console.log("Size:", w + "x" + h);
  console.log("Scale (h/1080):", (h / 1080).toFixed(4));

  // The autoDetectGrid formula (from grid-detector.ts):
  const scale = h / 1080;
  const autoGrid = {
    columns: 7,
    rows: Math.min(
      6,
      Math.max(3, Math.ceil((h - 149 * scale) / ((189 + 28) * scale))),
    ),
    startX: Math.round(295 * scale),
    startY: Math.round(149 * scale),
    cellWidth: Math.round(153 * scale),
    cellHeight: Math.round(189 * scale),
    gapX: Math.round(30 * scale),
    gapY: Math.round(28 * scale),
  };
  console.log("\nautoDetectGrid result:", JSON.stringify(autoGrid, null, 2));

  // The "calibrated" grid from test scripts:
  const calibGrid = {
    columns: 7,
    rows: 4,
    startX: 347,
    startY: 175,
    cellWidth: 180,
    cellHeight: 223,
    gapX: 35,
    gapY: 33,
  };
  console.log(
    "\nCalibrated grid (from test scripts):",
    JSON.stringify(calibGrid, null, 2),
  );

  // Check what pixels we actually see at the auto-detected grid positions
  console.log("\nSampling image at autoDetectGrid cell [0,0] center:");
  const cx0 = autoGrid.startX + autoGrid.cellWidth / 2;
  const cy0 = autoGrid.startY + autoGrid.cellHeight / 2;
  let rgba = img.getPixelColor(Math.round(cx0), Math.round(cy0));
  let r = (rgba >>> 24) & 0xff,
    g = (rgba >>> 16) & 0xff,
    b = (rgba >>> 8) & 0xff;
  console.log(
    `  Center [0,0] (${Math.round(cx0)}, ${Math.round(cy0)}): RGB=(${r},${g},${b})`,
  );

  // Sample the calibrated grid [0,0] center
  const cx1 = calibGrid.startX + calibGrid.cellWidth / 2;
  const cy1 = calibGrid.startY + calibGrid.cellHeight / 2;
  rgba = img.getPixelColor(Math.round(cx1), Math.round(cy1));
  r = (rgba >>> 24) & 0xff;
  g = (rgba >>> 16) & 0xff;
  b = (rgba >>> 8) & 0xff;
  console.log(
    `\nSampling calibrated grid [0,0] center (${Math.round(cx1)}, ${Math.round(cy1)}): RGB=(${r},${g},${b})`,
  );

  // Compare: what's at each cell corner using both grids?
  console.log("\n=== Auto grid - first row cell corners ===");
  for (let c = 0; c < 7; c++) {
    const x = autoGrid.startX + c * (autoGrid.cellWidth + autoGrid.gapX);
    const y = autoGrid.startY;
    rgba = img.getPixelColor(x, y);
    r = (rgba >>> 24) & 0xff;
    g = (rgba >>> 16) & 0xff;
    b = (rgba >>> 8) & 0xff;
    const brightness = r * 0.299 + g * 0.587 + b * 0.114;
    console.log(
      `  Col ${c}: corner (${x},${y}) RGB=(${r},${g},${b}) bright=${brightness.toFixed(0)}`,
    );
  }

  console.log("\n=== Calibrated grid - first row cell corners ===");
  for (let c = 0; c < 7; c++) {
    const x = calibGrid.startX + c * (calibGrid.cellWidth + calibGrid.gapX);
    const y = calibGrid.startY;
    rgba = img.getPixelColor(x, y);
    r = (rgba >>> 24) & 0xff;
    g = (rgba >>> 16) & 0xff;
    b = (rgba >>> 8) & 0xff;
    const brightness = r * 0.299 + g * 0.587 + b * 0.114;
    console.log(
      `  Col ${c}: corner (${x},${y}) RGB=(${r},${g},${b}) bright=${brightness.toFixed(0)}`,
    );
  }

  // Let's scan horizontal line at y=200 to see where the cells start
  console.log(
    "\n=== Horizontal brightness at y=200 (every 10px from x=300 to 2600) ===",
  );
  for (let x = 300; x < 800; x += 10) {
    rgba = img.getPixelColor(x, 200);
    r = (rgba >>> 24) & 0xff;
    g = (rgba >>> 16) & 0xff;
    b = (rgba >>> 8) & 0xff;
    const bright = r * 0.299 + g * 0.587 + b * 0.114;
    if (bright > 50)
      console.log(`  x=${x}: bright=${bright.toFixed(0)} RGB=(${r},${g},${b})`);
  }
}

probeImage().catch(console.error);
