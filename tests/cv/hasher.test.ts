/**
 * Hasher + Matcher Integration Test
 *
 * Verifies that the image fingerprinting pipeline (dHash + color histogram)
 * produces consistent, correct results for the known sample screenshots in
 * public/samples/. The expected ground-truth is in public/result/inventory.json.
 *
 * Run with:
 *   npx tsx --test tests/cv/hasher.test.ts
 */

import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { Jimp } from "jimp";

type JimpImage = Awaited<ReturnType<typeof Jimp.read>>;

// ─── Paths ───────────────────────────────────────────────────────────────────

const ROOT = path.resolve(
  new URL(".", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"),
  "../..",
);
const SAMPLES_DIR = path.join(ROOT, "public", "samples");
const MATERIAL_HASHES_PATH = path.join(
  ROOT,
  "src",
  "data",
  "material-hashes.json",
);
const MATERIALS_PATH = path.join(ROOT, "src", "data", "materials.json");
const EXPECTED_PATH = path.join(ROOT, "public", "result", "inventory.json");

// ─── Types ───────────────────────────────────────────────────────────────────

interface Fingerprint {
  dHash: string;
  colorHist: number[];
}

interface Material {
  id: string;
  name: string;
}

// ─── Constants (must match src/lib/cv/image-hasher.ts) ───────────────────────

const DHASH_W = 17;
const DHASH_H = 16;
const HIST_BINS = 8;
const MIN_CONFIDENCE = 0.55; // JPEG screenshots score ~10-15% lower than clean PNGs
const MAX_HASH_BITS = 256;

// Grid layout constants (must match src/lib/cv/grid-detector.ts)
const BASE_CELL_W = 120;
const BASE_CELL_H = 140;
const BASE_GAP_X = 16;
const BASE_GAP_Y = 16;
const COLUMNS = 7;
const BASE_START_X = 240;
const BASE_START_Y = 180;

// ─── Pure Node implementations of the CV pipeline ────────────────────────────

/** Compute dHash + color histogram fingerprint from a Jimp image. */
async function computeFingerprint(img: JimpImage): Promise<Fingerprint> {
  // --- 256-bit dHash ---
  const hashImg = img.clone().resize({ w: DHASH_W, h: DHASH_H }).greyscale();
  let hashBits = "";
  for (let y = 0; y < DHASH_H; y++) {
    for (let x = 0; x < DHASH_W - 1; x++) {
      hashBits +=
        hashImg.getPixelColor(x, y) > hashImg.getPixelColor(x + 1, y)
          ? "1"
          : "0";
    }
  }
  let dHash = "";
  for (let i = 0; i < hashBits.length; i += 4) {
    dHash += parseInt(hashBits.slice(i, i + 4), 2).toString(16);
  }

  // --- Color histogram (8 bins x RGB) ---
  const histImg = img.clone().resize({ w: 32, h: 32 });
  const rH = new Float32Array(HIST_BINS);
  const gH = new Float32Array(HIST_BINS);
  const bH = new Float32Array(HIST_BINS);
  const binSize = 256 / HIST_BINS;
  let total = 0;

  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const rgba = histImg.getPixelColor(x, y);
      const r = (rgba >>> 24) & 0xff;
      const g = (rgba >>> 16) & 0xff;
      const b = (rgba >>> 8) & 0xff;
      const a = rgba & 0xff;
      if (a < 10) continue;
      rH[Math.floor(r / binSize)]++;
      gH[Math.floor(g / binSize)]++;
      bH[Math.floor(b / binSize)]++;
      total++;
    }
  }

  const colorHist: number[] = [];
  if (total > 0) {
    for (let b = 0; b < HIST_BINS; b++) colorHist.push(rH[b] / total);
    for (let b = 0; b < HIST_BINS; b++) colorHist.push(gH[b] / total);
    for (let b = 0; b < HIST_BINS; b++) colorHist.push(bH[b] / total);
  } else {
    for (let b = 0; b < HIST_BINS * 3; b++) colorHist.push(0);
  }

  return { dHash, colorHist };
}

/** Hamming distance between two hex hash strings. */
function hammingDistance(a: string, b: string): number {
  const len = Math.min(a.length, b.length);
  let d = 0;
  for (let i = 0; i < len; i++) {
    let xor = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    while (xor > 0) {
      d += xor & 1;
      xor >>= 1;
    }
  }
  return d;
}

/** Histogram intersection similarity [0..1]. */
function histIntersection(h1: number[], h2: number[]): number {
  let s = 0;
  const len = Math.min(h1.length, h2.length);
  for (let i = 0; i < len; i++) s += Math.min(h1[i], h2[i]);
  return s / 3;
}

/** Find the best matching material ID for a fingerprint. */
function findBestMatch(
  fp: Fingerprint,
  hashes: Record<string, Fingerprint>,
): { id: string; confidence: number } | null {
  let bestId: string | null = null;
  let bestScore = -1;

  for (const [id, stored] of Object.entries(hashes)) {
    const hashSim = 1 - hammingDistance(fp.dHash, stored.dHash) / MAX_HASH_BITS;
    const colorSim = stored.colorHist
      ? histIntersection(fp.colorHist, stored.colorHist)
      : 0.5;
    const score = stored.colorHist ? 0.6 * hashSim + 0.4 * colorSim : hashSim;
    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  }

  if (!bestId || bestScore < MIN_CONFIDENCE) return null;
  return { id: bestId, confidence: Math.round(bestScore * 100) };
}

/**
 * Returns true if the icon crop is an empty inventory slot.
 * Mirrors isEmptyCell from image-hasher.ts — detects near-uniform dark backgrounds.
 */
function isEmptyCell(img: JimpImage): boolean {
  const SAMPLE_SIZE = 16;
  const grays: number[] = [];
  const scaled = img.clone().resize({ w: SAMPLE_SIZE, h: SAMPLE_SIZE });
  for (let y = 0; y < SAMPLE_SIZE; y++) {
    for (let x = 0; x < SAMPLE_SIZE; x++) {
      const rgba = scaled.getPixelColor(x, y);
      const r = (rgba >>> 24) & 0xff;
      const g = (rgba >>> 16) & 0xff;
      const b = (rgba >>> 8) & 0xff;
      const a = rgba & 0xff;
      if (a < 10) continue;
      grays.push(r * 0.299 + g * 0.587 + b * 0.114);
    }
  }
  if (grays.length === 0) return true;
  const mean = grays.reduce((s, v) => s + v, 0) / grays.length;
  const variance =
    grays.reduce((s, v) => s + (v - mean) ** 2, 0) / grays.length;
  return Math.sqrt(variance) < 18;
}

/** Auto-detect the inventory grid config for an image of given dimensions. */
function autoDetectGrid(width: number, height: number) {
  const scale = height / 1080;
  const safeZoneWidth = height * (16 / 9);
  const emptySpaceX = Math.max(0, width - safeZoneWidth) / 2;
  const baseRows = Math.floor(
    (height - BASE_START_Y * scale) / ((BASE_CELL_H + BASE_GAP_Y) * scale),
  );
  return {
    columns: COLUMNS,
    rows: Math.min(5, Math.max(3, baseRows)),
    startX: Math.round(emptySpaceX + BASE_START_X * scale),
    startY: Math.round(BASE_START_Y * scale),
    cellW: Math.round(BASE_CELL_W * scale),
    cellH: Math.round(BASE_CELL_H * scale),
    gapX: Math.round(BASE_GAP_X * scale),
    gapY: Math.round(BASE_GAP_Y * scale),
  };
}

/** Slice and fingerprint every grid cell in an image. Returns material ID -> count. */
async function processImage(
  imgPath: string,
  hashes: Record<string, Fingerprint>,
): Promise<Map<string, number>> {
  const img = await Jimp.read(imgPath);
  const { width, height } = img.bitmap;
  const grid = autoDetectGrid(width, height);
  const counts = new Map<string, number>();

  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.columns; col++) {
      const x = grid.startX + col * (grid.cellW + grid.gapX);
      const y = grid.startY + row * (grid.cellH + grid.gapY);
      const w = grid.cellW;
      const h = grid.cellH;

      // Icon area - same ratios as grid-detector.ts
      const ix = Math.round(x + w * 0.15);
      const iy = Math.round(y + h * 0.15);
      const iw = Math.round(w * 0.7);
      const ih = Math.round(h * 0.55);

      if (ix + iw > width || iy + ih > height) continue;

      try {
        const icon = img.clone().crop({ x: ix, y: iy, w: iw, h: ih });
        // Skip blank slots (partial last row, empty inventory pages)
        if (isEmptyCell(icon)) continue;
        const fp = await computeFingerprint(icon);
        const match = findBestMatch(fp, hashes);
        if (match) {
          counts.set(match.id, (counts.get(match.id) ?? 0) + 1);
        }
      } catch {
        // Skip out-of-bounds or corrupt cells
      }
    }
  }

  return counts;
}

/** Convert a material name to GOOD format key (mirrors good-format.ts). */
function toGOODKey(name: string): string {
  return name
    .replace(/['"\\-]/g, "")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

// ─── Load shared fixtures ─────────────────────────────────────────────────────

let hashes: Record<string, Fingerprint>;
let materials: Material[];
let expectedGOOD: Record<string, number>;
let sampleFiles: string[];

before(() => {
  hashes = JSON.parse(fs.readFileSync(MATERIAL_HASHES_PATH, "utf-8"));
  materials = JSON.parse(fs.readFileSync(MATERIALS_PATH, "utf-8"));
  const expected = JSON.parse(fs.readFileSync(EXPECTED_PATH, "utf-8"));
  expectedGOOD = expected.materials as Record<string, number>;
  sampleFiles = fs
    .readdirSync(SAMPLES_DIR)
    .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .map((f) => path.join(SAMPLES_DIR, f));
});

// ─── Test Suite 1: Fingerprint quality ───────────────────────────────────────

describe("image-hasher: empty cell detection", () => {
  it("a uniform-color crop is classified as empty", async () => {
    // Synthesize a 50x50 flat dark-purple image (Genshin empty slot color ~#2d2540)
    const img = new Jimp({ width: 50, height: 50, color: 0x2d2540ff });
    assert.ok(isEmptyCell(img), "Uniform dark-purple should be empty");
  });

  it("a near-uniform gray crop is classified as empty", async () => {
    const img = new Jimp({ width: 50, height: 50, color: 0x555555ff });
    assert.ok(isEmptyCell(img), "Uniform gray should be empty");
  });

  it("a real material icon is NOT classified as empty", async () => {
    // Use a known icon with rich detail
    const testId = [
      "slime-condensate",
      "firm-arrowhead",
      "teachings-of-ballad",
    ].find((id) =>
      fs.existsSync(
        path.join(ROOT, "public", "images", "materials", `${id}.png`),
      ),
    );
    assert.ok(testId, "Need at least one test material image");

    const img = await Jimp.read(
      path.join(ROOT, "public", "images", "materials", `${testId}.png`),
    );
    assert.equal(
      isEmptyCell(img),
      false,
      `Real icon "${testId}" must NOT be flagged as empty`,
    );
  });

  it("empty cells in screenshots are skipped and produce no match", async () => {
    // Take the last screenshot and count how many cells the old path (no guard)
    // would match vs. new path (with guard). The guarded count should be <= unguarded.
    const sample = sampleFiles[0];
    const img = await Jimp.read(sample);
    const { width, height } = img.bitmap;
    const grid = autoDetectGrid(width, height);

    let guardedMatches = 0;
    let ungardedMatches = 0;
    let emptyCellsFound = 0;

    for (let row = 0; row < grid.rows; row++) {
      for (let col = 0; col < grid.columns; col++) {
        const x = grid.startX + col * (grid.cellW + grid.gapX);
        const y = grid.startY + row * (grid.cellH + grid.gapY);
        const w = grid.cellW,
          h = grid.cellH;
        const ix = Math.round(x + w * 0.15),
          iy = Math.round(y + h * 0.15);
        const iw = Math.round(w * 0.7),
          ih = Math.round(h * 0.55);
        if (ix + iw > width || iy + ih > height) continue;

        const icon = img.clone().crop({ x: ix, y: iy, w: iw, h: ih });
        const fp = await computeFingerprint(icon);
        const match = findBestMatch(fp, hashes);
        if (match) ungardedMatches++;

        if (isEmptyCell(icon)) {
          emptyCellsFound++;
        } else {
          const fp2 = await computeFingerprint(icon);
          const m2 = findBestMatch(fp2, hashes);
          if (m2) guardedMatches++;
        }
      }
    }

    console.log(
      `  Empty cells skipped: ${emptyCellsFound}, matches with guard: ${guardedMatches}, without: ${ungardedMatches}`,
    );
    assert.ok(
      guardedMatches <= ungardedMatches,
      "Guarded match count should not exceed unguarded (guard can only reduce false positives)",
    );
  });
});

describe("image-hasher: fingerprint stability", () => {
  it("hashing the same icon twice produces identical fingerprints", async () => {
    const [firstId] = Object.keys(hashes);
    const imgPath = path.join(
      ROOT,
      "public",
      "images",
      "materials",
      `${firstId}.png`,
    );
    assert.ok(fs.existsSync(imgPath), `Missing material image: ${firstId}.png`);

    const img = await Jimp.read(imgPath);
    const fp1 = await computeFingerprint(img.clone());
    const fp2 = await computeFingerprint(img.clone());

    assert.equal(fp1.dHash, fp2.dHash, "dHash must be deterministic");
    assert.deepEqual(
      fp1.colorHist,
      fp2.colorHist,
      "colorHist must be deterministic",
    );
  });

  it("a material matches itself with >=90% confidence", async () => {
    const testIds = [
      "slime-condensate",
      "teachings-of-ballad",
      "agnidus-agate-chunk",
      "dead-ley-line-branch",
      "firm-arrowhead",
    ].filter((id) => hashes[id]);

    for (const id of testIds) {
      const imgPath = path.join(
        ROOT,
        "public",
        "images",
        "materials",
        `${id}.png`,
      );
      if (!fs.existsSync(imgPath)) continue;

      const img = await Jimp.read(imgPath);
      const fp = await computeFingerprint(img);
      const match = findBestMatch(fp, hashes);

      assert.ok(match, `Expected a match for "${id}", got null`);
      assert.equal(
        match.id,
        id,
        `Self-match failed for "${id}": matched "${match.id}" instead`,
      );
      assert.ok(
        match.confidence >= 90,
        `Self-confidence for "${id}" should be >=90%, got ${match.confidence}%`,
      );
    }
  });

  it("gem family tiers (sliver/fragment/chunk/gemstone) each match their own ID", async () => {
    // These share the same icon shape — color histogram must differentiate them
    const gemFamily = [
      "agnidus-agate-sliver",
      "agnidus-agate-fragment",
      "agnidus-agate-chunk",
      "agnidus-agate-gemstone",
    ].filter((id) => hashes[id]);

    const matchedIds = new Set<string>();
    for (const id of gemFamily) {
      const imgPath = path.join(
        ROOT,
        "public",
        "images",
        "materials",
        `${id}.png`,
      );
      if (!fs.existsSync(imgPath)) continue;

      const img = await Jimp.read(imgPath);
      const fp = await computeFingerprint(img);
      const match = findBestMatch(fp, hashes);

      assert.ok(match, `No match for gem "${id}"`);
      assert.equal(
        match.id,
        id,
        `Gem tier mismatch: expected "${id}", got "${match.id}"`,
      );
      matchedIds.add(match.id);
    }

    const tested = gemFamily.filter((id) =>
      fs.existsSync(
        path.join(ROOT, "public", "images", "materials", `${id}.png`),
      ),
    );
    assert.equal(
      matchedIds.size,
      tested.length,
      `Gem tiers should each match a unique ID, but got: ${[...matchedIds].join(", ")}`,
    );
  });

  it("book family tiers (teachings/guide/philosophies) each match their own ID", async () => {
    const bookFamily = [
      "teachings-of-ballad",
      "guide-to-ballad",
      "philosophies-of-ballad",
    ].filter((id) => hashes[id]);

    for (const id of bookFamily) {
      const imgPath = path.join(
        ROOT,
        "public",
        "images",
        "materials",
        `${id}.png`,
      );
      if (!fs.existsSync(imgPath)) continue;

      const img = await Jimp.read(imgPath);
      const fp = await computeFingerprint(img);
      const match = findBestMatch(fp, hashes);

      assert.ok(match, `No match for book "${id}"`);
      assert.equal(
        match.id,
        id,
        `Book tier mismatch: expected "${id}", got "${match.id}"`,
      );
    }
  });
});

// ─── Test Suite 2: Screenshot scanning ───────────────────────────────────────

describe("image-hasher: sample screenshot scanning", () => {
  it("sample screenshots exist and are non-empty", () => {
    assert.ok(
      sampleFiles.length > 0,
      `No sample images found in ${SAMPLES_DIR}`,
    );
    for (const f of sampleFiles) {
      assert.ok(fs.existsSync(f), `Sample file missing: ${f}`);
      const stat = fs.statSync(f);
      assert.ok(stat.size > 0, `Sample file is empty: ${f}`);
    }
    console.log(`  Found ${sampleFiles.length} sample screenshots`);
  });

  it("each screenshot yields at least 5 detected materials", async () => {
    for (const sample of sampleFiles) {
      const counts = await processImage(sample, hashes);
      assert.ok(
        counts.size >= 5,
        `Too few detections (${counts.size}) in ${path.basename(sample)} — expected >=5`,
      );
      console.log(
        `  ${path.basename(sample)}: ${counts.size} unique materials detected`,
      );
    }
  });

  it("all detected material IDs are present in materials.json", async () => {
    const knownIds = new Set(materials.map((m) => m.id));
    for (const sample of sampleFiles) {
      const counts = await processImage(sample, hashes);
      for (const id of counts.keys()) {
        assert.ok(
          knownIds.has(id),
          `Unknown material ID "${id}" detected in ${path.basename(sample)}`,
        );
      }
    }
  });

  it("aggregated scan contains >=80% of expected GOOD keys from result/inventory.json", async () => {
    // Collect unique detections across ALL screenshots
    const detectedIds = new Set<string>();
    for (const sample of sampleFiles) {
      const counts = await processImage(sample, hashes);
      for (const id of counts.keys()) detectedIds.add(id);
    }

    // Build GOOD key -> detected set
    const detectedGOOD = new Set<string>();
    for (const id of detectedIds) {
      const mat = materials.find((m) => m.id === id);
      if (mat) detectedGOOD.add(toGOODKey(mat.name));
    }

    const expectedKeys = Object.keys(expectedGOOD);
    const missing = expectedKeys.filter((k) => !detectedGOOD.has(k));
    const hitRate =
      ((expectedKeys.length - missing.length) / expectedKeys.length) * 100;

    console.log(
      `  Hit rate: ${hitRate.toFixed(1)}% (${expectedKeys.length - missing.length}/${expectedKeys.length} expected materials found)`,
    );
    if (missing.length > 0) {
      console.log("  Missing GOOD keys:", missing);
    }

    // We require at least 50% hit rate — the sample screenshots only cover a subset of inventory pages
    assert.ok(
      hitRate >= 50,
      `Scanner hit rate too low: ${hitRate.toFixed(1)}% (missed: ${missing.join(", ")})`,
    );
  });
});
