/**
 * Builds src/data/digit-templates.json: one averaged glyph per digit of the
 * game font, used by the recognizer to read card quantities.
 *
 *   pnpm build:digit-templates
 *
 * Glyphs come from the labelled reference cards in
 * tests/material-detector/ground-truth.json: every card whose footer
 * segments into as many glyphs as its quantity has digits contributes one
 * sample per digit. A second pass drops samples that disagree with the
 * first-pass templates (a mislabelled quantity) and reports them.
 */
import fs from "node:fs";
import path from "node:path";
import { Jimp } from "jimp";
import { detectInventoryGrids } from "../src/lib/grid-detector";
import { IDENTITY_ALIGNMENT } from "../src/lib/material-detector/engine/card";
import {
  classifyGlyph,
  type DigitTemplates,
  extractGlyphs,
  GLYPH_H,
  GLYPH_W,
} from "../src/lib/material-detector/engine/quantity";

interface Truth {
  samples: { file: string; cards: [number, number, string, number][] }[];
}

const truth: Truth = JSON.parse(fs.readFileSync("tests/material-detector/ground-truth.json", "utf8"));
const N = GLYPH_W * GLYPH_H;

interface Sample {
  digit: string;
  ink: Float32Array;
  where: string;
}

function average(samples: Sample[]): DigitTemplates {
  const digits: Record<string, number[]> = {};
  for (let d = 0; d <= 9; d++) {
    const own = samples.filter((s) => s.digit === String(d));
    if (own.length === 0) throw new Error(`No samples for digit ${d}`);
    const acc = new Float64Array(N);
    for (const s of own) for (let i = 0; i < N; i++) acc[i] += s.ink[i];
    digits[String(d)] = Array.from(acc, (v) => Math.round((v / own.length) * 1000) / 1000);
  }
  return { width: GLYPH_W, height: GLYPH_H, digits };
}

async function main() {
  const samples: Sample[] = [];
  let skipped = 0;
  for (const s of truth.samples) {
    const img = await Jimp.read(s.file);
    const { width, height, data } = img.bitmap;
    const image = { width, height, data };
    const result = detectInventoryGrids({ image });
    const cards = result.grids.flatMap((g) => g.cards);
    for (const [row, column, id, quantity] of s.cards) {
      const card = cards.find((c) => c.row === row && c.column === column);
      if (!card) continue;
      const glyphs = extractGlyphs(image, card, IDENTITY_ALIGNMENT);
      const text = String(quantity);
      if (glyphs.length !== text.length) {
        skipped++;
        console.warn(`  skip ${path.basename(s.file)} r${row}c${column} (${id}): ${glyphs.length} glyphs for "${text}"`);
        continue;
      }
      glyphs.forEach((g, k) =>
        samples.push({ digit: text[k], ink: g.ink, where: `${path.basename(s.file)} r${row}c${column} "${text}"` }),
      );
    }
  }

  const first = average(samples);
  const consistent = samples.filter((s) => {
    const c = classifyGlyph(s.ink, first);
    if (c.digit === s.digit) return true;
    console.warn(`  label disagrees: ${s.where} digit ${s.digit} looks like ${c.digit} (r=${c.score.toFixed(2)})`);
    return false;
  });
  const templates = average(consistent);

  const counts = Object.fromEntries(
    Object.keys(templates.digits).map((d) => [d, consistent.filter((s) => s.digit === d).length]),
  );
  fs.writeFileSync("src/data/digit-templates.json", JSON.stringify(templates) + "\n");
  console.log(
    `Digit templates from ${consistent.length} glyphs (${samples.length - consistent.length} dropped, ${skipped} cards skipped):`,
    counts,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
