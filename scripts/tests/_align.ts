import { detectInventoryGrids } from "../../src/lib/grid-detector";
import { recognizeCards } from "../../src/lib/material-detector";
import { normalizeCardBox, snapToFooter } from "../../src/lib/material-detector/engine/card";
import { loadBank, loadImage } from "../../tests/material-detector/fixtures";
const [file, ...rcs] = process.argv.slice(2);
async function main() {
  const image = await loadImage(`tests/online-samples/files/${file}`);
  const det = detectInventoryGrids({ image });
  const res = recognizeCards({ image, grids: det.grids }, { weapon: await loadBank("weapon"), artifact: await loadBank("artifact"), material: await loadBank("material") });
  for (const c of res.cards) {
    if (rcs.length && !rcs.includes(`${c.row},${c.column}`)) continue;
    const n = normalizeCardBox(c.box);
    const snap = snapToFooter(image, n);
    const f = (b: any) => b ? `${b.x.toFixed(0)},${b.y.toFixed(0)} ${b.width.toFixed(0)}x${b.height.toFixed(0)}` : "-";
    console.log(`r${c.row}c${c.column} ${c.material?.id} box ${f(c.box)} norm ${f(n)} matched ${f(c.matchedBox)} snap ${f(snap)} lv ${c.level?.value}`);
  }
}
main();
