import { Jimp } from "jimp";

async function probeImage() {
  const img = await Jimp.read(
    "public/samples/test-set-01/GenshinImpact_20261009_220714.jpg",
  );
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  console.log("Size:", w + "x" + h);

  // Scan horizontal line at y=25% to find cell intervals
  const yScan = Math.round(h * 0.25);
  let inCell = false,
    cellStart = 0;
  const cells: { start: number; end: number; width: number }[] = [];
  for (let x = 0; x < w; x++) {
    const rgba = img.getPixelColor(x, yScan);
    const r = (rgba >>> 24) & 0xff;
    const g = (rgba >>> 16) & 0xff;
    const b = (rgba >>> 8) & 0xff;
    const bright = r * 0.299 + g * 0.587 + b * 0.114;
    if (bright > 75 && !inCell) {
      inCell = true;
      cellStart = x;
    } else if (bright <= 75 && inCell) {
      inCell = false;
      const width = x - cellStart;
      if (width > 50) cells.push({ start: cellStart, end: x, width });
    }
  }

  console.log("Cells at y=" + yScan + ":");
  cells.forEach((c, i) => {
    const next = cells[i + 1];
    const gap = next ? next.start - c.end : 0;
    console.log(
      `  Cell ${i}: x=${c.start} to ${c.end} (width=${c.width}) gap=${gap}`,
    );
  });

  // Also scan vertically in the middle of the first cell
  if (cells.length > 0) {
    const midX = Math.round((cells[0].start + cells[0].end) / 2);
    let inRow = false,
      rowStart = 0;
    const rows: { start: number; end: number; height: number }[] = [];
    for (let y = 0; y < h; y++) {
      const rgba = img.getPixelColor(midX, y);
      const r = (rgba >>> 24) & 0xff;
      const g = (rgba >>> 16) & 0xff;
      const b = (rgba >>> 8) & 0xff;
      const bright = r * 0.299 + g * 0.587 + b * 0.114;
      if (bright > 60 && !inRow) {
        inRow = true;
        rowStart = y;
      } else if (bright <= 60 && inRow) {
        inRow = false;
        const rowH = y - rowStart;
        if (rowH > 40) rows.push({ start: rowStart, end: y, height: rowH });
      }
    }

    console.log("Rows at x=" + midX + ":");
    rows.forEach((r, i) => {
      const next = rows[i + 1];
      const gap = next ? next.start - r.end : 0;
      console.log(
        `  Row ${i}: y=${r.start} to ${r.end} (height=${r.height}) gap=${gap}`,
      );
    });
  }
}

probeImage().catch(console.error);
