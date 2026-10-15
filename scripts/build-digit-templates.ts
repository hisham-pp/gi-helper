/**
 * Builds src/data/digit-templates.json: one averaged glyph per digit of the
 * game font, used by the recognizer to read card quantities, plus the "L",
 * "v" and "+" of weapon and artifact footers ("Lv. 90", "+20").
 *
 *   pnpm build:digit-templates
 *
 * Digit glyphs come from the labelled reference cards in
 * tests/material-detector/ground-truth.json: every card whose footer
 * segments into as many glyphs as its quantity has digits contributes one
 * sample per digit. A second pass drops samples that disagree with the
 * first-pass templates (a mislabelled quantity) and reports them.
 *
 * Symbol glyphs come from the weapon and artifact screenshots of
 * tests/online-samples (`pnpm fetch:online-samples` first; without them the
 * current symbols are kept). They label themselves by shape: on a weapon card
 * the first glyph is a tall "L" followed by a short "v" on the baseline; on an
 * artifact card the first glyph is a short, centred "+".
 */
import fs from "node:fs";
import path from "node:path";
import { Jimp } from "jimp";
import { detectInventoryGrids } from "../src/lib/grid-detector";
import { IDENTITY_ALIGNMENT, normalizeCardBox } from "../src/lib/material-detector/engine/card";
import {
  classifyGlyph,
  correlation,
  type DigitTemplates,
  extractGlyphs,
  footerComponents,
  GLYPH_H,
  GLYPH_W,
} from "../src/lib/material-detector/engine/quantity";
import { loadImage } from "../tests/material-detector/fixtures";

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

function averageOf(own: Sample[]): number[] {
  const acc = new Float64Array(N);
  for (const s of own) for (let i = 0; i < N; i++) acc[i] += s.ink[i];
  return Array.from(acc, (v) => Math.round((v / own.length) * 1000) / 1000);
}

function average(samples: Sample[]): DigitTemplates {
  const digits: Record<string, number[]> = {};
  for (let d = 0; d <= 9; d++) {
    const own = samples.filter((s) => s.digit === String(d));
    if (own.length === 0) throw new Error(`No samples for digit ${d}`);
    digits[String(d)] = averageOf(own);
  }
  return { width: GLYPH_W, height: GLYPH_H, digits };
}

const ONLINE = "tests/online-samples";

/**
 * "L", "v" and "+" samples from the online weapon and artifact screenshots,
 * labelled by their shape (see the header). Null when they aren't downloaded.
 */
async function symbolSamples(): Promise<Sample[] | null> {
  const manifest: { samples: { file: string; kind: string }[] } = JSON.parse(
    fs.readFileSync(path.join(ONLINE, "manifest.json"), "utf8"),
  );
  const files = manifest.samples.filter(
    (s) => (s.kind === "weapon" || s.kind === "artifact") && fs.existsSync(path.join(ONLINE, "files", s.file)),
  );
  if (files.length === 0) return null;
  const samples: Sample[] = [];
  for (const s of files) {
    const image = await loadImage(path.join(ONLINE, "files", s.file));
    for (const card of detectInventoryGrids({ image }).grids.flatMap((g) => g.cards)) {
      if (card.clipped) continue;
      const comps = footerComponents(image, normalizeCardBox(card), IDENTITY_ALIGNMENT);
      if (comps.length < 2) continue;
      const h = (c: (typeof comps)[number]) => c.y1 - c.y0 + 1;
      const tallest = Math.max(...comps.map(h));
      const bottom = Math.max(...comps.map((c) => c.y1));
      const short = (c: (typeof comps)[number]) => h(c) <= 0.82 * tallest && h(c) >= 0.5 * tallest;
      const where = `${s.file} r${card.row}c${card.column}`;
      const [a, b] = comps;
      if (s.kind === "weapon" && comps.length >= 3 && h(a) >= 0.9 * tallest && short(b) && bottom - b.y1 <= 0.14 * tallest) {
        samples.push({ digit: "L", ink: a.ink, where }, { digit: "v", ink: b.ink, where });
      } else if (s.kind === "artifact" && short(a) && bottom - a.y1 > 0.08 * tallest) {
        samples.push({ digit: "+", ink: a.ink, where });
      }
    }
  }
  return samples;
}

/** Averages each symbol, then again without the samples that fit their average poorly. */
function symbolTemplates(samples: Sample[]): Record<string, number[]> {
  const out: Record<string, number[]> = {};
  for (const symbol of ["L", "v", "+"]) {
    const own = samples.filter((s) => s.digit === symbol);
    if (own.length === 0) throw new Error(`No samples for "${symbol}"`);
    const first = averageOf(own);
    const kept = own.filter((s) => correlation(s.ink, first) >= 0.75);
    out[symbol] = averageOf(kept.length >= 3 ? kept : own);
    console.log(`  "${symbol}": ${kept.length} of ${own.length} samples`);
  }
  return out;
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

  const symbols = await symbolSamples();
  if (symbols) {
    templates.symbols = symbolTemplates(symbols);
  } else {
    const current: DigitTemplates = JSON.parse(fs.readFileSync("src/data/digit-templates.json", "utf8"));
    if (current.symbols) templates.symbols = current.symbols;
    console.warn("  online samples not downloaded: keeping the current L/v/+ templates");
  }

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
