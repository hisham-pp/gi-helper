/**
 * Reference bank: every catalog icon pre-rendered exactly where it appears
 * on a card, at two resolutions. There is one bank per card kind
 * (materials, weapons, artifacts).
 *
 * The atlas (`public/data/<kind>-atlas.webp`, lossless, built by
 * `scripts/build-atlases.ts`) holds each 256² catalog icon area-
 * averaged to a 64² tile with straight alpha. Because the icon fills the
 * card's top W × W square, a tile *is* the expected artwork of a 64 px wide
 * card frame; no per-icon placement search is needed.
 *
 * Templates keep premultiplied colour and alpha, so a card is predicted as
 *   card ≈ icon + (1 − alpha) × background
 * and pixels the icon does not cover say "this should be plain background".
 */
import type { RgbaImage } from "@gi/grid-detector";
import {
  CARD_KINDS,
  type CardKind,
  type Rarity,
  type ReferenceEntry,
} from "../types";
import { artRows } from "./card";
import { MaterialDetectionError } from "./errors";

/** Frame width of the full-resolution (fine) pass; equals the atlas tile size. */
export const FINE_SIZE = 64;
/** Frame width of the shortlist (coarse) pass. */
export const COARSE_SIZE = FINE_SIZE / 2;

export const ATLAS_FORMAT = "gi-material-atlas";
export const ATLAS_VERSION = 1;

/** Site paths of each kind's atlas (under public/). */
export const ATLAS_FILES: Record<
  CardKind,
  { manifest: string; image: string }
> = {
  material: {
    manifest: "/data/material-atlas.json",
    image: "/data/material-atlas.webp",
  },
  weapon: {
    manifest: "/data/weapon-atlas.json",
    image: "/data/weapon-atlas.webp",
  },
  artifact: {
    manifest: "/data/artifact-atlas.json",
    image: "/data/artifact-atlas.webp",
  },
  character: {
    manifest: "/data/character-atlas.json",
    image: "/data/character-atlas.webp",
  },
};

export interface AtlasManifest {
  format: typeof ATLAS_FORMAT;
  version: number;
  /** The card kind the atlas is for; "material" when absent. */
  kind?: CardKind;
  /** Content hash of the atlas image; used for cache busting. */
  hash: string;
  tileSize: number;
  columns: number;
  /** Tile `i` (row-major) holds `entries[i]`. */
  entries: ReferenceEntry[];
}

/** One reference icon rendered into the artwork rows of a card frame. */
export interface Template {
  size: number;
  rows: number;
  /** Premultiplied colour, 0–1. */
  r: Float32Array;
  g: Float32Array;
  b: Float32Array;
  a: Float32Array;
  /** Background weight: 1 where the icon is fully transparent, fading to 0 by alpha 0.25. */
  w: Float32Array;
}

export interface ReferenceBank {
  kind: CardKind;
  version: string;
  entries: ReferenceEntry[];
  indexById: Map<string, number>;
  coarse: Template[];
  /** Built on first use; most references never reach the fine pass. */
  fine(index: number): Template;
}

function makeTemplate(size: number, rows: number): Template {
  const n = size * rows;
  return {
    size,
    rows,
    r: new Float32Array(n),
    g: new Float32Array(n),
    b: new Float32Array(n),
    a: new Float32Array(n),
    w: new Float32Array(n),
  };
}

const isRarity = (v: unknown): v is Rarity =>
  v === 1 || v === 2 || v === 3 || v === 4 || v === 5;

const optional = (v: unknown, check: (v: unknown) => boolean) =>
  v === undefined || check(v);

export function validateManifest(value: unknown): AtlasManifest {
  const m = value as Partial<AtlasManifest> | null;
  const ok =
    !!m &&
    m.format === ATLAS_FORMAT &&
    m.version === ATLAS_VERSION &&
    m.tileSize === FINE_SIZE &&
    typeof m.columns === "number" &&
    m.columns > 0 &&
    typeof m.hash === "string" &&
    Array.isArray(m.entries) &&
    m.entries.length > 0 &&
    optional(m.kind, (k) => (CARD_KINDS as readonly unknown[]).includes(k)) &&
    m.entries.every(
      (e) =>
        e &&
        typeof e.id === "string" &&
        typeof e.name === "string" &&
        isRarity(e.rarity) &&
        typeof e.order === "number" &&
        optional(e.item, (v) => typeof v === "string") &&
        optional(e.variant, (v) => typeof v === "string") &&
        optional(
          e.rarities,
          (v) => Array.isArray(v) && v.length > 0 && v.every(isRarity),
        ),
    );
  if (!ok) {
    throw new MaterialDetectionError(
      "REFERENCES_INVALID",
      "The scanner's reference data is invalid or outdated. Please reload the page.",
    );
  }
  return m as AtlasManifest;
}

/** Builds the bank from the atlas pixels (straight-alpha RGBA) and its manifest. */
export function createReferenceBank(
  manifestJson: unknown,
  atlas: RgbaImage,
): ReferenceBank {
  const manifest = validateManifest(manifestJson);
  const T = manifest.tileSize;
  const rowsOfTiles = Math.ceil(manifest.entries.length / manifest.columns);
  if (
    atlas.width < manifest.columns * T ||
    atlas.height < rowsOfTiles * T ||
    atlas.data.length < atlas.width * atlas.height * 4
  ) {
    throw new MaterialDetectionError(
      "REFERENCES_INVALID",
      "The scanner's reference image does not match its manifest. Please reload the page.",
    );
  }

  const fineRows = artRows(FINE_SIZE);
  const coarseRows = artRows(COARSE_SIZE);
  const { data, width: AW } = atlas;

  const tileOrigin = (index: number) => ({
    x: (index % manifest.columns) * T,
    y: Math.floor(index / manifest.columns) * T,
  });

  /** Premultiplied 0–1 value of one atlas pixel channel. */
  const read = (p: number) => {
    const al = data[p + 3] / 255;
    return [
      (data[p] / 255) * al,
      (data[p + 1] / 255) * al,
      (data[p + 2] / 255) * al,
      al,
    ] as const;
  };

  const finalize = (t: Template) => {
    for (let i = 0; i < t.a.length; i++) t.w[i] = Math.max(0, 1 - 4 * t.a[i]);
    return t;
  };

  const buildFine = (index: number): Template => {
    const t = makeTemplate(FINE_SIZE, fineRows);
    const o = tileOrigin(index);
    for (let y = 0; y < fineRows; y++) {
      for (let x = 0; x < FINE_SIZE; x++) {
        const [r, g, b, a] = read(((o.y + y) * AW + o.x + x) * 4);
        const i = y * FINE_SIZE + x;
        t.r[i] = r;
        t.g[i] = g;
        t.b[i] = b;
        t.a[i] = a;
      }
    }
    return finalize(t);
  };

  const buildCoarse = (index: number): Template => {
    const t = makeTemplate(COARSE_SIZE, coarseRows);
    const o = tileOrigin(index);
    for (let y = 0; y < coarseRows; y++) {
      for (let x = 0; x < COARSE_SIZE; x++) {
        let r = 0,
          g = 0,
          b = 0,
          a = 0;
        for (let k = 0; k < 4; k++) {
          const [pr, pg, pb, pa] = read(
            ((o.y + 2 * y + (k >> 1)) * AW + o.x + 2 * x + (k & 1)) * 4,
          );
          r += pr;
          g += pg;
          b += pb;
          a += pa;
        }
        const i = y * COARSE_SIZE + x;
        t.r[i] = r / 4;
        t.g[i] = g / 4;
        t.b[i] = b / 4;
        t.a[i] = a / 4;
      }
    }
    return finalize(t);
  };

  const fineCache: (Template | undefined)[] = new Array(
    manifest.entries.length,
  );
  return {
    kind: manifest.kind ?? "material",
    version: manifest.hash,
    entries: manifest.entries,
    indexById: new Map(manifest.entries.map((e, i) => [e.id, i])),
    coarse: manifest.entries.map((_, i) => buildCoarse(i)),
    fine: (index) => (fineCache[index] ??= buildFine(index)),
  };
}
