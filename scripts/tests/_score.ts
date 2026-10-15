import { detectInventoryGrids } from "../../src/lib/grid-detector";
import { FINE_SIZE } from "../../src/lib/material-detector";
import { sampleCard, normalizeCardBox, artRows, badgeMask, addEquipmentOverlays, detectNewBadge } from "../../src/lib/material-detector/engine/card";
import { compositeError, patternSearch } from "../../src/lib/material-detector/engine/match";
import { loadBank, loadImage } from "../../tests/material-detector/fixtures";
const [file, kind, rc, ...ids] = process.argv.slice(2);
async function main() {
  const image = await loadImage(`tests/online-samples/files/${file}`);
  const bank = await loadBank(kind as "weapon");
  const [r, c] = rc.split(",").map(Number);
  const card = detectInventoryGrids({ image }).grids.flatMap((g) => g.cards).find((k) => k.row === r && k.column === c)!;
  const box = normalizeCardBox(card);
  const R = artRows(FINE_SIZE);
  const f0 = sampleCard(image, box, FINE_SIZE);
  const mask = addEquipmentOverlays(badgeMask(FINE_SIZE, R, detectNewBadge(f0)), FINE_SIZE, R);
  bank.entries.forEach((e, i) => {
    if (!ids.some((id) => e.id.startsWith(id))) return;
    const e0 = compositeError(f0, bank.fine(i), mask);
    const s = patternSearch((p) => compositeError(sampleCard(image, box, FINE_SIZE, p), bank.fine(i), mask), { dx: 0, dy: 0, scale: 1 }, e0, { step: { dx: 1 / 64, dy: 1 / 78, scale: 0.025 }, minStep: 1 / 256, maxEvaluations: 40, limit: { dx: 0.12, dy: 0.12, scale: 0.15 } });
    console.log(`${e.id}: ${e0.toFixed(3)} → ${s.error.toFixed(3)} at ${JSON.stringify(s.best)}`);
  });
}
main();
