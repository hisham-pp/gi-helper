import { detectInventoryGrids } from "../../src/lib/grid-detector";
import { FINE_SIZE } from "../../src/lib/material-detector";
import { sampleCard, normalizeCardBox, artRows, badgeMask, addEquipmentOverlays, detectNewBadge } from "../../src/lib/material-detector/engine/card";
import { compositeError, patternSearch } from "../../src/lib/material-detector/engine/match";
import { loadBank, loadImage } from "../../tests/material-detector/fixtures";
const [file, rc, ...ids] = process.argv.slice(2);
async function main() {
  const image = await loadImage(`tests/online-samples/files/${file}`);
  const bank = await loadBank("weapon");
  const [r, c] = rc.split(",").map(Number);
  const card = detectInventoryGrids({ image }).grids.flatMap((g) => g.cards).find((k) => k.row === r && k.column === c)!;
  const box = normalizeCardBox(card);
  const R = artRows(FINE_SIZE);
  const mask = addEquipmentOverlays(badgeMask(FINE_SIZE, R, null), FINE_SIZE, R);
  for (const id of ids) {
    for (const i of bank.entries.map((e, i) => (e.id === id || e.item === id ? i : -1)).filter((i) => i >= 0)) {
      let best = { err: 9, p: { dx: 0, dy: 0, scale: 1 } };
      for (let scale = 0.5; scale <= 1.05; scale += 0.05)
        for (let dx = -0.3; dx <= 0.3; dx += 0.05)
          for (let dy = -0.3; dy <= 0.3; dy += 0.05) {
            const p = { dx, dy, scale };
            const e = compositeError(sampleCard(image, box, FINE_SIZE, p), bank.fine(i), mask);
            if (e < best.err) best = { err: e, p };
          }
      const s = patternSearch((p) => compositeError(sampleCard(image, box, FINE_SIZE, p), bank.fine(i), mask), best.p, best.err, { step: { dx: 0.02, dy: 0.02, scale: 0.02 }, minStep: 1 / 256, maxEvaluations: 60, limit: { dx: 1, dy: 1, scale: 1 } });
      console.log(`${bank.entries[i].id}: ${s.error.toFixed(3)} scale ${s.best.scale.toFixed(3)} dx ${s.best.dx.toFixed(3)} dy ${s.best.dy.toFixed(3)}`);
    }
  }
}
main();
