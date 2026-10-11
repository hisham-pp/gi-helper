import path from "path";
import fs from "fs";
import { Jimp } from "jimp";

async function testRarityColors() {
  const sample = await Jimp.read(
    "public/samples/GenshinImpact_20261009_220714.jpg",
  );
  const materials = JSON.parse(
    fs.readFileSync("src/data/materials.json", "utf8"),
  );
  const matMap = new Map(materials.map((m: any) => [m.id, m]));

  // In autoDetectGrid(2800, 1272):
  // scale = 1.1777, startX = 552, startY = 212, cellW = 141, cellH = 165, gapX = 19, gapY = 19
  // Let's check cell [2, 0] which is "Juvenile Fang" (rarity 1)
  // cell [3, 0] which is "Mist Grass Pollen" (rarity 2)
  // cell [2, 5] which is "Agnidus Agate Fragment" (rarity 3)
  // cell [2, 4] which is "Smoldering Pearl" (rarity 4)
  // cell [3, 6] which is "Dvalin's Claw" (rarity 5)

  const testCells = [
    { r: 2, c: 0, expected: "Rarity 1 (Juvenile Fang / Gray)" },
    { r: 3, c: 0, expected: "Rarity 2 (Mist Grass Pollen / Green)" },
    { r: 2, c: 5, expected: "Rarity 3 (Agnidus Agate Fragment / Blue)" },
    { r: 2, c: 4, expected: "Rarity 4 (Smoldering Pearl / Purple)" },
    { r: 3, c: 6, expected: "Rarity 5 (Dvalin Claw / Gold)" },
  ];

  for (const tc of testCells) {
    const x = 552 + tc.c * (141 + 19);
    const y = 212 + tc.r * (165 + 19);
    const cell = sample.clone().crop({ x, y, w: 141, h: 165 });

    // In Genshin, the top background behind the item (top 30% of the cell, corners):
    // Let's check the corners at (10%, 10%), (90%, 10%), (50%, 10%)
    // Let's compute average hue, saturation, value or RGB in the upper corner background of the cell:
    const cornerPts = [
      { x: Math.round(141 * 0.12), y: Math.round(165 * 0.12) },
      { x: Math.round(141 * 0.88), y: Math.round(165 * 0.12) },
      { x: Math.round(141 * 0.12), y: Math.round(165 * 0.2) },
      { x: Math.round(141 * 0.88), y: Math.round(165 * 0.2) },
    ];

    console.log(`\n--- ${tc.expected} ---`);
    for (const pt of cornerPts) {
      const rgba = cell.getPixelColor(pt.x, pt.y);
      const r = (rgba >>> 24) & 0xff;
      const g = (rgba >>> 16) & 0xff;
      const b = (rgba >>> 8) & 0xff;
      // Convert to HSV
      const max = Math.max(r, g, b) / 255;
      const min = Math.min(r, g, b) / 255;
      const d = max - min;
      let h = 0;
      const s = max === 0 ? 0 : d / max;
      const v = max;
      if (d !== 0) {
        if (max === r / 255) h = ((g / 255 - b / 255) / d) % 6;
        else if (max === g / 255) h = (b / 255 - r / 255) / d + 2;
        else h = (r / 255 - g / 255) / d + 4;
        h = Math.round(h * 60);
        if (h < 0) h += 360;
      }
      console.log(
        `  pt(${pt.x},${pt.y}) RGB: (${r}, ${g}, ${b}) | HSV: H=${h}°, S=${(s * 100).toFixed(0)}%, V=${(v * 100).toFixed(0)}%`,
      );
    }

    // Also let's inspect the stars row at the bottom of the cell!
    // Where are the stars located in a cell?
    // In Genshin Impact inventory cells, stars are located at y ≈ 70% to 80% (just above or inside the bottom area)
    // Let's check pixel colors along y = 68% to 75%
    let starPixelsFound = 0;
    for (let sy = Math.round(165 * 0.65); sy < Math.round(165 * 0.76); sy++) {
      for (let sx = Math.round(141 * 0.1); sx < Math.round(141 * 0.9); sx++) {
        const rgba = cell.getPixelColor(sx, sy);
        const r = (rgba >>> 24) & 0xff;
        const g = (rgba >>> 16) & 0xff;
        const b = (rgba >>> 8) & 0xff;
        // Genshin stars are bright golden-yellow: high R (~220-255), high G (~180-240), low B (~50-130)
        if (r > 190 && g > 160 && b < 130 && r > b + 60) {
          starPixelsFound++;
        }
      }
    }
    console.log(
      `  Yellow star-like pixels found near bottom: ${starPixelsFound}`,
    );
  }
}

testRarityColors().catch(console.error);
