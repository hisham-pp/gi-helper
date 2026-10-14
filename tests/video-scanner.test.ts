/**
 * Video scanner: frame selection, coverage gaps, merging the cards read in
 * many frames, and upload validation. The browser parts (seeking a <video>,
 * the scan workers) are exercised on public/samples/test-set-02 in the app.
 */
import test, { describe } from "node:test";
import assert from "node:assert/strict";
import type { DetectedGrid } from "../src/lib/grid-detector";
import type { CardRecognition, CardRecognitionStatus } from "../src/lib/material-detector";
import {
  KeyframePicker,
  SightingMerger,
  frameDifference,
  isVideoFile,
  lockRegion,
  pickBetween,
  planGapFills,
  probeInterval,
  probeTimes,
  sightingKey,
  validateVideoFile,
  type ProbeSample,
} from "../src/lib/video-scanner";

/** A flat thumbnail; its value stands in for what is on screen. */
const thumb = (value: number, size = 64) => new Uint8Array(size).fill(value);

/** Feeds thumbnails 0.2 s apart and returns the picked times. */
function pick(values: number[]): number[] {
  const picker = new KeyframePicker();
  const picked: number[] = [];
  values.forEach((v, i) => {
    const p = picker.push(i * 0.2, thumb(v));
    if (p !== null) picked.push(p);
  });
  const last = picker.finish();
  if (last !== null) picked.push(last);
  return picked;
}

describe("frameDifference", () => {
  test("is the mean absolute difference", () => {
    assert.equal(frameDifference(new Uint8Array([0, 10, 20]), new Uint8Array([10, 10, 50])), 40 / 3);
    assert.equal(frameDifference(thumb(7), thumb(7)), 0);
  });

  test("rejects thumbnails of different sizes", () => {
    assert.throws(() => frameDifference(thumb(0, 4), thumb(0, 5)));
  });
});

describe("KeyframePicker", () => {
  test("picks the first frame and the end of each flick", () => {
    // Two flicks: the content changes fast, slows down, then the next flick starts.
    const values = [0, 40, 70, 90, 100, 104, 150, 190, 215, 225, 228];
    // Differences: 40 30 20 10 4 | 46 40 25 10 3 → minima at 104 (index 5) and the last frame.
    assert.deepEqual(pick(values), [0, 5, 10]);
  });

  test("scans a paused stretch once", () => {
    assert.deepEqual(pick([0, 0, 0, 0, 0, 0]), [0]);
  });

  test("skips settled frames that look like the last pick", () => {
    // Small jitter (< duplicate threshold) after the first frame: nothing new to scan.
    assert.deepEqual(pick([50, 52, 51, 52, 51, 52]), [0]);
  });

  test("picks a still frame again once the content has changed", () => {
    // Paused, scrolled, paused again.
    assert.deepEqual(pick([0, 0, 0, 60, 120, 120, 120]), [0, 5]);
  });

  test("records the motion of every sample", () => {
    const picker = new KeyframePicker();
    picker.push(0, thumb(0));
    picker.push(0.2, thumb(30));
    assert.equal(picker.samples[0].motion, Infinity);
    assert.equal(picker.samples[1].motion, 30);
    assert.equal(picker.samples[1].time, 0.2);
  });
});

const samples = (motions: number[]): ProbeSample[] => motions.map((motion, i) => ({ time: i * 0.2, motion }));

describe("coverage gaps", () => {
  test("frames that share a material leave no gap", () => {
    const fills = planGapFills(
      [
        { time: 0, materials: new Set(["a", "b"]) },
        { time: 1, materials: new Set(["b", "c"]) },
      ],
      samples([Infinity, 5, 5, 5, 5, 5]),
      new Set([0, 5]),
    );
    assert.deepEqual(fills, []);
  });

  test("a gap is filled with the calmest frame near its middle", () => {
    // Samples 0.0 … 2.0 s; gap between 0 and 2 s; middle half is 0.5–1.5 s.
    const motion = [Infinity, 9, 20, 3, 15, 8, 20, 1, 30, 30, 9];
    const fills = planGapFills(
      [
        { time: 0, materials: new Set(["a"]) },
        { time: 2, materials: new Set(["z"]) },
      ],
      samples(motion),
      new Set([0, 10]),
    );
    // Index 7 (1.4 s) is calmest inside the middle half; index 1 is calm but too close to the edge.
    assert.deepEqual(fills, [7]);
  });

  test("frames without inventory are not compared", () => {
    const fills = planGapFills(
      [
        { time: 0, materials: new Set(["a"]) },
        { time: 1, materials: new Set() },
        { time: 2, materials: new Set(["z"]) },
      ],
      samples([Infinity, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]),
      new Set([0, 5, 10]),
    );
    assert.deepEqual(fills, []);
  });

  test("adjacent samples can't be split further", () => {
    assert.equal(pickBetween(samples([Infinity, 1]), 0, 0.2), null);
    assert.equal(pickBetween(samples([Infinity, 1, 1]), 0, 0.4, new Set([1])), null);
  });

  test("falls back to the frame nearest the middle when the middle half is taken", () => {
    // Gap 0–2 s; its middle half (0.5–1.5 s) is already scanned. 0.4 s and 1.6 s
    // are equally close to the middle, so the earlier one is chosen.
    const motion = [Infinity, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
    assert.equal(pickBetween(samples(motion), 0, 2, new Set([3, 4, 5, 6, 7])), 2);
    assert.equal(pickBetween(samples(motion), 0, 2, new Set([2, 3, 4, 5, 6, 7])), 8);
  });
});

describe("sampling", () => {
  test("every 0.2 s for normal recordings, coarser for long ones", () => {
    assert.equal(probeInterval(22.4), 0.2);
    assert.equal(probeInterval(600), 0.5);
    assert.equal(probeInterval(Number.NaN), 0.2);
  });

  test("covers the video up to just before its end", () => {
    const times = probeTimes(1.03, 0.2);
    assert.deepEqual(times, [0, 0.2, 0.4, 0.6, 0.8, 0.98]);
    assert.deepEqual(probeTimes(0.01, 0.2), [0]);
  });
});

let nextCard = 0;
function card(
  materialId: string | null,
  quantity: number | null,
  {
    confidence = 0.95,
    quantityConfidence = 0.9,
    status = "matched" as CardRecognitionStatus,
    row = 0,
    column = 0,
  } = {},
): CardRecognition {
  const box = { x: 10 * column, y: 12 * row, width: 10, height: 12 };
  const material = materialId
    ? { id: materialId, name: materialId.toUpperCase(), rarity: 3 as const, error: 0.05, confidence }
    : null;
  return {
    cardId: `c${nextCard++}`,
    gridId: "g0",
    row,
    column,
    box,
    matchedBox: box,
    status: materialId ? status : "unknown",
    material,
    candidates: material ? [material] : [],
    rarity: { value: 3, stars: 3, background: 3, confidence: 1 },
    quantity: { value: quantity, text: quantity === null ? "" : String(quantity), confidence: quantityConfidence },
    hasNewBadge: false,
    orderAdjusted: false,
    confidence: materialId ? confidence : 0,
  };
}

describe("SightingMerger", () => {
  test("one entry per material, in the order they scrolled by", () => {
    const merger = new SightingMerger();
    merger.add(0, 0, [card("a", 1, { column: 0 }), card("b", 2, { column: 1 }), card(null, null)]);
    merger.add(1, 0.8, [card("b", 2), card("c", 3)]);
    const result = merger.result();
    assert.deepEqual(
      result.map((m) => [m.materialId, m.quantity, m.sightings]),
      [
        ["a", 1, 1],
        ["b", 2, 2],
        ["c", 3, 1],
      ],
    );
    assert.equal(merger.size, 3);
  });

  test("clean frames outvote a misread quantity", () => {
    const merger = new SightingMerger();
    merger.add(0, 0, [card("a", 63)]);
    merger.add(1, 1, [card("a", 68, { confidence: 0.97, quantityConfidence: 0.95 })]);
    merger.add(2, 2, [card("a", 63)]);
    merger.add(3, 3, [card("a", 63)]);
    const [a] = merger.result();
    assert.equal(a.quantity, 63);
    assert.equal(a.agreeing, 3);
    assert.equal(a.quantityConflict, false);
    // The crop and candidates come from a sighting that agrees with the vote.
    assert.equal(a.best.card.quantity.value, 63);
  });

  test("an even split is flagged", () => {
    const merger = new SightingMerger();
    merger.add(0, 0, [card("a", 17)]);
    merger.add(1, 1, [card("a", 11)]);
    assert.equal(merger.result()[0].quantityConflict, true);
  });

  test("a readable quantity wins over unreadable ones", () => {
    const merger = new SightingMerger();
    merger.add(0, 0, [card("a", null, { quantityConfidence: 0 })]);
    merger.add(1, 1, [card("a", null, { quantityConfidence: 0 })]);
    merger.add(2, 2, [card("a", 5, { quantityConfidence: 0.3 })]);
    const [a] = merger.result();
    assert.equal(a.quantity, 5);
    assert.equal(a.quantityConflict, false);
  });

  test("unreadable everywhere stays null", () => {
    const merger = new SightingMerger();
    merger.add(0, 0, [card("a", null, { quantityConfidence: 0 })]);
    assert.equal(merger.result()[0].quantity, null);
  });

  test("the best status and confidence over all frames", () => {
    const merger = new SightingMerger();
    merger.add(0, 0, [card("a", 4, { status: "uncertain", confidence: 0.4 })]);
    merger.add(1, 1, [card("a", 4, { confidence: 0.9 })]);
    const [a] = merger.result();
    assert.equal(a.status, "matched");
    assert.equal(a.confidence, 0.9);
  });

  test("reports the sightings that improve their crop", () => {
    const merger = new SightingMerger();
    const first = merger.add(0, 0, [card("a", 4, { confidence: 0.8 })]);
    assert.equal(first.length, 1);
    assert.equal(merger.add(1, 1, [card("a", 4, { confidence: 0.7 })]).length, 0);
    const better = merger.add(2, 2, [card("a", 4, { confidence: 0.9 })]);
    assert.equal(better.length, 1);
    assert.equal(better[0].frame, 2);
    // A new quantity value gets its own crop.
    assert.equal(merger.add(3, 3, [card("a", 5, { confidence: 0.5 })]).length, 1);
    assert.equal(sightingKey("a", 4), "a|4");
    assert.equal(sightingKey("a", null), "a|?");
  });

  test("a material listed twice in one frame counts once", () => {
    const merger = new SightingMerger();
    merger.add(0, 0, [card("a", 4, { confidence: 0.6 }), card("a", 4, { confidence: 0.9, column: 1 })]);
    const [a] = merger.result();
    assert.equal(a.sightings, 1);
    assert.equal(a.confidence, 0.9);
  });
});

function grid(x: number, width: number, cards: number, cardWidth = 100): DetectedGrid {
  return {
    id: "g",
    bounds: { x, y: 50, width, height: 400 },
    rows: 1,
    columns: cards,
    confidence: 0.9,
    cards: Array.from({ length: cards }, (_, i) => ({
      id: `c${i}`,
      x: x + i * 110,
      y: 50,
      width: cardWidth,
      height: 122,
      row: 0,
      column: i,
      confidence: 0.9,
      source: "detected" as const,
      clipped: false,
    })),
    cardWidth,
    cardHeight: 122,
    pitchX: 110,
    pitchY: 140,
    emptySlots: [],
  } as DetectedGrid;
}

describe("lockRegion", () => {
  test("the grid's columns, full height, with half a card of margin", () => {
    assert.deepEqual(lockRegion([grid(200, 760, 7)], 1584, 720), { x: 150, y: 0, width: 860, height: 720 });
  });

  test("stays inside the frame", () => {
    assert.deepEqual(lockRegion([grid(20, 760, 7)], 800, 720), { x: 0, y: 0, width: 800, height: 720 });
  });

  test("needs a clear grid", () => {
    assert.equal(lockRegion([], 1584, 720), null);
    assert.equal(lockRegion([grid(200, 300, 3)], 1584, 720), null);
  });
});

describe("video uploads", () => {
  test("recognises videos by type or extension", () => {
    assert.equal(isVideoFile({ type: "video/mp4", name: "x" }), true);
    assert.equal(isVideoFile({ type: "", name: "Record.MOV" }), true);
    assert.equal(isVideoFile({ type: "image/png", name: "shot.png" }), false);
  });

  test("rejects empty, non-video and oversized files with readable errors", () => {
    assert.throws(() => validateVideoFile({ type: "video/mp4", size: 0 }), { code: "EMPTY_FILE" });
    assert.throws(() => validateVideoFile({ type: "image/png", size: 10, name: "a.png" }), {
      code: "UNSUPPORTED_FILE_TYPE",
    });
    assert.throws(() => validateVideoFile({ type: "video/mp4", size: 3 * 1024 ** 3 }), { code: "FILE_TOO_LARGE" });
    assert.doesNotThrow(() => validateVideoFile({ type: "video/webm", size: 1024 }));
  });
});
