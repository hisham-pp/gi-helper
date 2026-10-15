import { createRequire } from "node:module";
import path from "node:path";
import { detectInventoryGrids } from "../../src/lib/grid-detector";
import { normalizeCardBox } from "../../src/lib/material-detector/engine/card";
import { loadImage } from "../../tests/material-detector/fixtures";
const sharp = createRequire(createRequire(path.join(process.cwd(), "package.json")).resolve("next/package.json"))("sharp");
const [file, out, n] = process.argv.slice(2);
async function main() {
  const image = await loadImage(`tests/online-samples/files/${file}`);
  const det = detectInventoryGrids({ image });
  const cards = det.grids.flatMap((g) => g.cards).slice(0, Number(n ?? 8));
  const S = 200;
  const tiles = [];
  let x = 0;
  for (const c of cards) {
    const b = normalizeCardBox(c);
    const crop = await sharp(Buffer.from(image.data), { raw: { width: image.width, height: image.height, channels: 4 } })
      .extract({ left: Math.round(b.x), top: Math.max(0, Math.round(b.y)), width: Math.round(b.width * 0.3), height: Math.round(b.width * 0.5) })
      .resize(Math.round(S * 0.6), S, { kernel: "nearest" }).png().toBuffer();
    tiles.push({ input: crop, left: x, top: 0 });
    x += Math.round(S * 0.6) + 6;
  }
  await sharp({ create: { width: x, height: S, channels: 3, background: "#000" } }).composite(tiles).png().toFile(out);
}
main();
