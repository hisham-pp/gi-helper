import { createRequire } from "node:module";
import path from "node:path";
import { detectInventoryGrids } from "../../src/lib/grid-detector";
import { recognizeMaterials } from "../../src/lib/material-detector";
import { sampleCard, normalizeCardBox, artRows, cardHeight, badgeMask } from "../../src/lib/material-detector/engine/card";
import { compositeError } from "../../src/lib/material-detector/engine/match";
import { loadBank, loadImage } from "../../tests/material-detector/fixtures";

const sharp = createRequire(createRequire(path.join(process.cwd(), "package.json")).resolve("next/package.json"))("sharp");
const [file, kind, out] = process.argv.slice(2);
async function main() {
  const image = await loadImage(`tests/online-samples/files/${file}`);
  const det = detectInventoryGrids({ image });
  const bank = await loadBank(kind as "weapon");
  const res = recognizeMaterials({ image, grids: det.grids }, bank, { useInventoryOrder: false });
  const S = 64, H = cardHeight(S), R = artRows(S), Z = 3;
  const cards = res.cards.slice(0, 16);
  const tileW = S * 3 * Z, tileH = H * Z;
  const W = tileW * 2, rows = Math.ceil(cards.length / 2);
  const buf = Buffer.alloc(W * rows * tileH * 3);
  cards.forEach((c, k) => {
    const idx = bank.indexById.get(c.candidates[0].id + (c.candidates[0].variant ? "~" + c.candidates[0].variant : ""))!;
    const t = bank.fine(idx);
    const f = sampleCard(image, c.matchedBox, S);
    const resid = new Float32Array(S * R);
    compositeError(f, t, badgeMask(S, R, null), resid);
    const ox = (k % 2) * tileW, oy = Math.floor(k / 2) * tileH;
    for (let y = 0; y < H; y++) for (let x = 0; x < S; x++) {
      const i = y * S + x;
      const card = [f.r[i], f.g[i], f.b[i]];
      const tm = y < R ? [t.r[i] + (1 - t.a[i]) * 0.5, t.g[i] + (1 - t.a[i]) * 0.5, t.b[i] + (1 - t.a[i]) * 0.5] : [0, 0, 0];
      const e = y < R ? Math.min(1, resid[i] / 0.75) : 0;
      const cols = [card, tm, [e, e * 0.3, 0]];
      cols.forEach((col, j) => {
        for (let dy = 0; dy < Z; dy++) for (let dx = 0; dx < Z; dx++) {
          const p = ((oy + y * Z + dy) * W + ox + j * S * Z + x * Z + dx) * 3;
          buf[p] = Math.round(col[0] * 255); buf[p + 1] = Math.round(col[1] * 255); buf[p + 2] = Math.round(col[2] * 255);
        }
      });
    }
  });
  await sharp(buf, { raw: { width: W, height: rows * tileH, channels: 3 } }).png().toFile(out);
  console.log(cards.map((c, k) => `${k}:${c.candidates[0].id} ${c.candidates[0].error}`).join("\n"));
}
main();
