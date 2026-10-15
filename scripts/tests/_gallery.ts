import { createRequire } from "node:module";
import path from "node:path";
import { detectInventoryGrids } from "../../src/lib/grid-detector";
import { FINE_SIZE } from "../../src/lib/material-detector";
import { sampleCard, normalizeCardBox, artRows, badgeMask, addEquipmentOverlays, detectNewBadge } from "../../src/lib/material-detector/engine/card";
import { compositeError, patternSearch } from "../../src/lib/material-detector/engine/match";
import { loadBank, loadImage } from "../../tests/material-detector/fixtures";
const sharp = createRequire(createRequire(path.join(process.cwd(), "package.json")).resolve("next/package.json"))("sharp");
const [file, kind, rc, out] = process.argv.slice(2);
async function main() {
  const image = await loadImage(`tests/online-samples/files/${file}`);
  const bank = await loadBank(kind as "weapon");
  const [r, c] = rc.split(",").map(Number);
  const card = detectInventoryGrids({ image }).grids.flatMap((g) => g.cards).find((k) => k.row === r && k.column === c)!;
  const box = normalizeCardBox(card);
  const R = artRows(FINE_SIZE);
  const f0 = sampleCard(image, box, FINE_SIZE);
  const mask = addEquipmentOverlays(badgeMask(FINE_SIZE, R, detectNewBadge(f0)), FINE_SIZE, R);
  const scored = bank.entries.map((e, i) => {
    const e0 = compositeError(f0, bank.fine(i), mask);
    const s = patternSearch((p) => compositeError(sampleCard(image, box, FINE_SIZE, p), bank.fine(i), mask), { dx: 0, dy: 0, scale: 1 }, e0, { step: { dx: 1 / 64, dy: 1 / 78, scale: 0.025 }, minStep: 1 / 256, maxEvaluations: 30, limit: { dx: 0.1, dy: 0.1, scale: 0.12 } });
    return { e, err: s.error };
  }).sort((a, b) => a.err - b.err).slice(0, 14);
  const S = 120;
  const tiles = [{ input: await sharp(Buffer.from(image.data), { raw: { width: image.width, height: image.height, channels: 4 } }).extract({ left: Math.round(box.x), top: Math.round(box.y), width: Math.round(box.width), height: Math.round(box.height) }).resize(S, Math.round(S * 1.22)).png().toBuffer(), left: 0, top: 0 }];
  for (const [k, x] of scored.entries()) {
    const f = x.e.variant ? `public/images/weapons-awakened/${x.e.item}.webp` : kind === "weapon" ? `public/images/weapons/${x.e.id}.webp` : `public/images/artifacts/${x.e.id.replace(":", "-")}.webp`;
    tiles.push({ input: await sharp(f).resize(S, S).flatten({ background: "#666" }).png().toBuffer(), left: (k + 1) * (S + 4), top: 0 });
    tiles.push({ input: Buffer.from(`<svg width="${S}" height="30"><text x="2" y="12" font-size="11" fill="#fff" font-family="Arial">${x.e.id.slice(0, 20)}</text><text x="2" y="26" font-size="11" fill="#ff0" font-family="Arial">${x.err.toFixed(3)}</text></svg>`), left: (k + 1) * (S + 4), top: S + 2 });
  }
  await sharp({ create: { width: 15 * (S + 4), height: Math.round(S * 1.22) + 4, channels: 3, background: "#000" } }).composite(tiles).png().toFile(out);
}
main();
