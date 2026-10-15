import { detectInventoryGrids } from "../../src/lib/grid-detector";
import { loadImage } from "../../tests/material-detector/fixtures";
import manifest from "../../tests/online-samples/manifest.json";
import truth from "../../tests/material-detector/ground-truth.json";
async function main() {
  const files = [...manifest.samples.filter((s) => ["weapon", "artifact", "material"].includes(s.kind)).map((s) => `tests/online-samples/files/${s.file}`), ...truth.samples.slice(0, 3).map((s: any) => s.file)];
  for (const f of files) {
    const image = await loadImage(f);
    const det = detectInventoryGrids({ image });
    for (const g of det.grids) {
      const hs = g.cards.filter((c) => !c.clipped).map((c) => c.height / c.width).sort((a, b) => a - b);
      console.log(`${f.split("/").pop()!.padEnd(34)} ${image.width}x${image.height} card ${g.cardWidth.toFixed(0)}x${g.cardHeight.toFixed(0)} aspect ${(g.cardHeight / g.cardWidth).toFixed(3)} median ${hs[hs.length >> 1]?.toFixed(3)} pitchY/W ${(g.pitchY / g.cardWidth).toFixed(3)}`);
    }
  }
}
main();
