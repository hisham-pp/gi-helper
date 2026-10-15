// Temporary: draft labels + labelled contact sheets for visual verification.
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { detectInventoryGrids } from "../../src/lib/grid-detector";
import { recognizeCards } from "../../src/lib/material-detector";
import { loadBank, loadImage } from "../../tests/material-detector/fixtures";
import manifest from "../../tests/online-samples/manifest.json";
const sharp = createRequire(createRequire(path.join(process.cwd(), "package.json")).resolve("next/package.json"))("sharp");
const [only, outDir] = process.argv.slice(2);
const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
async function main() {
  const banks = { material: await loadBank("material"), weapon: await loadBank("weapon"), artifact: await loadBank("artifact") };
  const drafts: unknown[] = [];
  for (const s of manifest.samples) {
    if (!["weapon", "artifact", "material"].includes(s.kind)) continue;
    if (only && only !== "all" && !s.file.includes(only)) continue;
    const image = await loadImage(`tests/online-samples/files/${s.file}`);
    const det = detectInventoryGrids({ image });
    const res = recognizeCards({ image, grids: det.grids }, banks);
    const cards = res.cards.map((c) => [c.row, c.column, c.material?.id ?? null, ...(c.kind === "material" ? [c.quantity.value] : c.kind === "weapon" ? [c.level?.value ?? null, c.refinement?.value ?? null, c.locked] : [c.level?.value ?? null, c.rarity.value, c.locked])]);
    drafts.push({ file: s.file, kind: res.grids.map((g) => g.kind).join(","), cards });
    console.error(`${s.file}: grids ${res.grids.map((g) => `${g.kind}/${g.source}/${g.confidence}`).join(" ")} cards ${res.cards.length} matched ${res.cards.filter((c) => c.status === "matched").length} ${res.processingTimeMs}ms`);
    if (!outDir) continue;
    // Contact sheet: card crop + label (+ our icon for the predicted item).
    const W = 150, H = 183, L = 54, cols = 8;
    const rows = Math.ceil(res.cards.length / cols);
    const comp: { input: Buffer; left: number; top: number }[] = [];
    for (const [k, c] of res.cards.entries()) {
      const x = (k % cols) * (W * 2 + 8), y = Math.floor(k / cols) * (H + L + 8);
      const b = c.matchedBox;
      const left = Math.max(0, Math.round(b.x)), top = Math.max(0, Math.round(b.y));
      const cw = Math.min(image.width - left, Math.round(b.width)), ch = Math.min(image.height - top, Math.round(b.height));
      comp.push({ input: await sharp(Buffer.from(image.data), { raw: { width: image.width, height: image.height, channels: 4 } }).extract({ left, top, width: cw, height: ch }).resize(W, H, { fit: "fill" }).png().toBuffer(), left: x, top: y });
      const id = c.material?.id;
      if (id) {
        const v = c.material?.variant;
        const f = c.kind === "material" ? (fs.existsSync(`public/images/materials/${id}.png`) ? `public/images/materials/${id}.png` : `public/images/material-thumbs/${id}.webp`) : c.kind === "weapon" ? `public/images/${v ? "weapons-awakened" : "weapons"}/${id}.webp` : `public/images/artifacts/${id.replace(":", "-")}.webp`;
        comp.push({ input: await sharp(f).resize(W, W).flatten({ background: "#555" }).png().toBuffer(), left: x + W, top: y });
      }
      const extra = c.kind === "material" ? `q=${c.quantity.value}` : c.kind === "weapon" ? `Lv${c.level?.value} R${c.refinement?.value} ${c.locked ? "lock" : "-"}` : `+${c.level?.value} ${c.rarity.value}★ ${c.locked ? "lock" : "-"}`;
      const svg = `<svg width="${W * 2}" height="${L}"><rect width="100%" height="100%" fill="${c.status === "matched" ? "#123" : c.status === "uncertain" ? "#430" : "#400"}"/><text x="3" y="16" font-size="14" fill="#fff" font-family="Arial">r${c.row}c${c.column} ${esc((c.material?.name ?? "-").slice(0, 30))}</text><text x="3" y="34" font-size="13" fill="#ff0" font-family="Arial">${esc(extra)} conf ${c.confidence.toFixed(2)} e ${c.material?.error ?? ""}</text><text x="3" y="50" font-size="11" fill="#aaa" font-family="Arial">2nd ${esc((c.candidates[1]?.name ?? "").slice(0, 34))} ${c.candidates[1]?.error ?? ""}</text></svg>`;
      comp.push({ input: Buffer.from(svg), left: x, top: y + H });
    }
    await sharp({ create: { width: cols * (W * 2 + 8), height: Math.max(1, rows) * (H + L + 8), channels: 3, background: "#000" } }).composite(comp).png().toFile(path.join(outDir, `${s.file}.sheet.png`));
  }
  console.log(JSON.stringify(drafts));
}
main();
