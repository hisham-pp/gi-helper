import { detectInventoryGrids } from "../../src/lib/grid-detector";
import { IDENTITY_ALIGNMENT, normalizeCardBox } from "../../src/lib/material-detector/engine/card";
import { readLock, readRefinement } from "../../src/lib/material-detector/engine/equipment";
import { readFooter, type DigitTemplates } from "../../src/lib/material-detector/engine/quantity";
import templates from "../../src/data/digit-templates.json";
import { loadImage } from "../../tests/material-detector/fixtures";
const files = process.argv.slice(2);
async function main() {
  for (const file of files) {
    const image = await loadImage(`tests/online-samples/files/${file}`);
    const det = detectInventoryGrids({ image });
    const out = det.grids.flatMap((g) => g.cards).filter((c) => !c.clipped).map((c) => {
      const b = normalizeCardBox(c);
      const r = readRefinement(image, b, IDENTITY_ALIGNMENT, templates as DigitTemplates);
      const l = readLock(image, b, IDENTITY_ALIGNMENT);
      const f = readFooter(image, b, IDENTITY_ALIGNMENT, templates as DigitTemplates);
      return `r${c.row}c${c.column}:R${r.value ?? "-"}(${r.confidence.toFixed(1)})${l.locked ? "L" : "u"}(${l.confidence.toFixed(1)})"${f.text}"`;
    });
    console.log(`== ${file}\n  ${out.join("  ")}`);
  }
}
main();
