/**
 * Node-side fixtures for material recognition tests and evaluation: the
 * reference bank from public/data and the labelled reference screenshots.
 */
import { readFileSync } from "node:fs";
import { Jimp } from "jimp";
import type { RgbaImage } from "../../src/lib/grid-detector";
import { createReferenceBank, type ReferenceBank } from "../../src/lib/material-detector";

export interface TruthFile {
  description: string;
  samples: { file: string; width: number; height: number; cards: [number, number, string, number][] }[];
}

export function loadTruth(): TruthFile {
  return JSON.parse(readFileSync(new URL("./ground-truth.json", import.meta.url), "utf8"));
}

let bank: Promise<ReferenceBank> | null = null;

/** The production reference bank (atlas + manifest), loaded once per process. */
export function loadBank(): Promise<ReferenceBank> {
  bank ??= (async () => {
    const manifest = JSON.parse(readFileSync("public/data/material-atlas.json", "utf8"));
    const atlas = await Jimp.read("public/data/material-atlas.png");
    const { width, height, data } = atlas.bitmap;
    return createReferenceBank(manifest, { width, height, data });
  })();
  return bank;
}

export async function loadImage(file: string, scale = 1): Promise<RgbaImage> {
  const img = await Jimp.read(file);
  if (scale !== 1) {
    img.resize({ w: Math.round(img.bitmap.width * scale), h: Math.round(img.bitmap.height * scale) });
  }
  const { width, height, data } = img.bitmap;
  return { width, height, data };
}

/** A view of the bank without one material: a card of that material is then "not in the catalog". */
export function withoutMaterial(bank: ReferenceBank, id: string): ReferenceBank {
  const keep = bank.entries.map((_, i) => i).filter((i) => bank.entries[i].id !== id);
  return {
    version: bank.version,
    entries: keep.map((i) => bank.entries[i]),
    indexById: new Map(keep.map((i, k) => [bank.entries[i].id, k])),
    coarse: keep.map((i) => bank.coarse[i]),
    fine: (k) => bank.fine(keep[k]),
  };
}
