import { createRequire } from "node:module";
import path from "node:path";
import { detectInventoryGrids } from "../../src/lib/grid-detector";
import { loadImage } from "../../tests/material-detector/fixtures";
const sharp = createRequire(createRequire(path.join(process.cwd(), "package.json")).resolve("next/package.json"))("sharp");
const [file, out, ...rest] = process.argv.slice(2);
async function main() {
  const image = await loadImage(`tests/online-samples/files/${file}`);
  const cards = detectInventoryGrids({ image }).grids.flatMap((g) => g.cards);
  const tiles: { input: Buffer; left: number; top: number }[] = [];
  const S = 200;
  let x = 0;
  for (const spec of rest) {
    const [rc, ...icons] = spec.split("=");
    const [r, c] = rc.split(",").map(Number);
    const k = cards.find((q) => q.row === r && q.column === c)!;
    const crop = await sharp(Buffer.from(image.data), { raw: { width: image.width, height: image.height, channels: 4 } })
      .extract({ left: Math.max(0, Math.round(k.x)), top: Math.max(0, Math.round(k.y)), width: Math.round(k.width), height: Math.round(k.width) })
      .resize(S, S).png().toBuffer();
    tiles.push({ input: crop, left: x, top: 0 });
    x += S + 4;
    for (const id of icons.join("=").split("+").filter(Boolean)) {
      const f = id.endsWith("~a") ? `public/images/weapons-awakened/${id.slice(0, -2)}.webp` : id.includes(":") ? `public/images/artifacts/${id.replace(":", "-")}.webp` : `public/images/weapons/${id}.webp`;
      tiles.push({ input: await sharp(f).resize(S, S).flatten({ background: "#a0702a" }).png().toBuffer(), left: x, top: 0 });
      x += S + 4;
    }
    x += 16;
  }
  await sharp({ create: { width: x, height: S, channels: 3, background: "#000" } }).composite(tiles).png().toFile(out);
}
main();
