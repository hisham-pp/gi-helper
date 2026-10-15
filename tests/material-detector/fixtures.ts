/**
 * Node-side fixtures for material recognition tests and evaluation: the
 * reference banks from public/data and the labelled reference screenshots.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { Jimp } from "jimp";
import type { RgbaImage } from "../../src/lib/grid-detector";
import { ATLAS_FILES } from "../../src/lib/material-detector/engine/bank";
import { createReferenceBank, type CardKind, type ReferenceBank } from "../../src/lib/material-detector";

export interface TruthFile {
  description: string;
  samples: { file: string; width: number; height: number; cards: [number, number, string, number][] }[];
}

export function loadTruth(): TruthFile {
  return JSON.parse(readFileSync(new URL("./ground-truth.json", import.meta.url), "utf8"));
}

/** sharp (installed with Next.js): the atlases and some samples are WebP, which Jimp can't read. */
function loadSharp(): typeof import("sharp") {
  const local = createRequire(path.join(process.cwd(), "package.json"));
  try {
    return local("sharp");
  } catch {
    return createRequire(local.resolve("next/package.json"))("sharp");
  }
}

/** Straight-alpha RGBA pixels of any image file sharp can read. */
export async function decodeWithSharp(file: string): Promise<RgbaImage> {
  const { data, info } = await loadSharp()(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { width: info.width, height: info.height, data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.length) };
}

const banks = new Map<CardKind, Promise<ReferenceBank>>();

/** A production reference bank (atlas + manifest), loaded once per process. */
export function loadBank(kind: CardKind = "material"): Promise<ReferenceBank> {
  let bank = banks.get(kind);
  if (!bank) {
    bank = (async () => {
      const files = ATLAS_FILES[kind];
      const manifest = JSON.parse(readFileSync(path.join("public", files.manifest), "utf8"));
      return createReferenceBank(manifest, await decodeWithSharp(path.join("public", files.image)));
    })();
    banks.set(kind, bank);
  }
  return bank;
}

export async function loadImage(file: string, scale = 1): Promise<RgbaImage> {
  if (/\.webp$/i.test(file)) {
    const sharp = loadSharp()(file).ensureAlpha();
    if (scale !== 1) {
      const meta = await loadSharp()(file).metadata();
      sharp.resize(Math.round(meta.width! * scale), Math.round(meta.height! * scale));
    }
    const { data, info } = await sharp.raw().toBuffer({ resolveWithObject: true });
    return { width: info.width, height: info.height, data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.length) };
  }
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
    kind: bank.kind,
    version: bank.version,
    entries: keep.map((i) => bank.entries[i]),
    indexById: new Map(keep.map((i, k) => [bank.entries[i].id, k])),
    coarse: keep.map((i) => bank.coarse[i]),
    fine: (k) => bank.fine(keep[k]),
  };
}
