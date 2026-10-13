/**
 * Grid detection engine tests on synthetic screenshots with exact ground
 * truth, plus validation, coordinate mapping and manual-editing logic.
 * Real Genshin screenshots are covered in grid-detector-samples.test.ts.
 */
import test, { describe } from "node:test";
import assert from "node:assert/strict";
import {
  applyCardEdit,
  createEditorState,
  detectInventoryGrids,
  editorReducer,
  GridDetectionError,
  latticePosition,
  resolveDetectionSettings,
  resolveImageType,
  validateImageDimensions,
  validateImageFile,
  type DetectedGrid,
  type GridDetectionResult,
} from "../src/lib/grid-detector";
import { allCards, matchBoxes } from "./grid-detector/metrics";
import { downscale, renderScene, type Scene } from "./grid-detector/synthetic";

function detect(scene: Scene, settings = {}) {
  const { image, truth } = renderScene(scene);
  const result = detectInventoryGrids({ image }, settings);
  return { image, truth, result, match: matchBoxes(allCards(result), truth.flat(), 0.7) };
}

function assertPerfect(match: ReturnType<typeof matchBoxes>, maxCornerError = 2) {
  assert.equal(match.falsePositives, 0, `false positives: ${match.falsePositives}`);
  assert.equal(match.falseNegatives, 0, `missed cards: ${match.falseNegatives}`);
  assert.ok(match.maxCornerError <= maxCornerError, `corner error ${match.maxCornerError}px`);
}

/** No two reported cards may overlap — duplicates must be suppressed. */
function assertNoOverlaps(result: GridDetectionResult) {
  const cards = allCards(result);
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      const a = cards[i];
      const b = cards[j];
      const ix = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
      const iy = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
      assert.ok(ix <= 0 || iy <= 0, `cards ${i} and ${j} overlap`);
    }
  }
}

const bg = (base: [number, number, number], drift = 25, noise = 6) => ({ base, drift, noise });

describe("synthetic grids", () => {
  test("regular 7×4 grid", () => {
    const { result, match } = detect({
      width: 900,
      height: 560,
      seed: 1,
      background: bg([70, 90, 100]),
      grids: [{ x: 40, y: 30, cols: 7, rows: 4, cardW: 92, cardH: 112, gapX: 16, gapY: 18 }],
    });
    assertPerfect(match);
    assert.equal(result.grids.length, 1);
    assert.equal(result.grids[0].columns, 7);
    assert.equal(result.grids[0].rows, 4);
    assertNoOverlaps(result);
  });

  test("different counts and card sizes: 10×6 small square cards", () => {
    const { result, match } = detect({
      width: 760,
      height: 520,
      seed: 3,
      background: bg([90, 80, 70], 30, 8),
      grids: [{ x: 30, y: 40, cols: 10, rows: 6, cardW: 54, cardH: 54, gapX: 12, gapY: 14, style: { strip: 0.25 } }],
    });
    assertPerfect(match);
    assert.equal(result.grids[0].columns, 10);
    assert.equal(result.grids[0].rows, 6);
  });

  test("incomplete final row: empty slots are reported, never as cards", () => {
    const { result, match } = detect({
      width: 800,
      height: 600,
      seed: 2,
      background: bg([50, 60, 80], 20),
      grids: [{ x: 60, y: 50, cols: 6, rows: 3, cardW: 96, cardH: 120, gapX: 20, gapY: 24, count: 14 }],
    });
    assertPerfect(match);
    const grid = result.grids[0];
    assert.equal(grid.cards.length, 14);
    assert.equal(grid.rows, 3);
    assert.equal(grid.columns, 6);
    assert.deepEqual(
      grid.emptySlots.map((s) => [s.row, s.column]),
      [
        [2, 2],
        [2, 3],
        [2, 4],
        [2, 5],
      ],
    );
    // Row/column assignments are zero-based and row-major.
    assert.deepEqual([grid.cards[0].row, grid.cards[0].column], [0, 0]);
    assert.deepEqual([grid.cards[13].row, grid.cards[13].column], [2, 1]);
  });

  test("multiple grids with different card sizes", () => {
    const { result, match } = detect({
      width: 1200,
      height: 700,
      seed: 4,
      background: bg([60, 70, 80]),
      grids: [
        { x: 40, y: 60, cols: 4, rows: 3, cardW: 90, cardH: 110, gapX: 14, gapY: 16 },
        { x: 620, y: 120, cols: 3, rows: 2, cardW: 140, cardH: 140, gapX: 24, gapY: 24, style: { color: [60, 140, 90], strip: 0 } },
      ],
    });
    assertPerfect(match);
    assert.equal(result.grids.length, 2);
    const shapes = result.grids.map((g) => `${g.columns}x${g.rows}`).sort();
    assert.deepEqual(shapes, ["3x2", "4x3"]);
  });

  test("sidebar, header, text and a detail panel are not detected", () => {
    const { result, match } = detect({
      width: 1400,
      height: 640,
      seed: 5,
      background: bg([60, 75, 85], 30),
      furniture: ["sidebar", "panel", "header", "text"],
      grids: [{ x: 180, y: 90, cols: 6, rows: 4, cardW: 100, cardH: 122, gapX: 18, gapY: 20 }],
    });
    assertPerfect(match);
    assert.equal(result.grids.length, 1);
  });

  test("low-contrast card borders", () => {
    const { match } = detect({
      width: 900,
      height: 600,
      seed: 6,
      background: bg([80, 90, 105], 10, 5),
      grids: [
        {
          x: 50,
          y: 50,
          cols: 6,
          rows: 3,
          cardW: 110,
          cardH: 130,
          gapX: 18,
          gapY: 20,
          style: { color: [96, 106, 122], variation: 6, strip: 0.15, stripColor: [110, 118, 130] },
        },
      ],
    });
    assertPerfect(match);
  });

  test("strongly rounded corners", () => {
    const { match } = detect({
      width: 900,
      height: 520,
      seed: 7,
      background: bg([40, 45, 60], 20),
      grids: [{ x: 40, y: 40, cols: 6, rows: 3, cardW: 110, cardH: 120, gapX: 20, gapY: 30, style: { radius: 0.18 } }],
    });
    assertPerfect(match);
  });

  test("double borders with narrow gaps (card+gap rectangles are rejected)", () => {
    const { result, match } = detect({
      width: 900,
      height: 600,
      seed: 8,
      background: bg([30, 30, 36], 10, 4),
      grids: [
        {
          x: 50,
          y: 60,
          cols: 7,
          rows: 4,
          cardW: 96,
          cardH: 96,
          gapX: 8,
          gapY: 8,
          style: { border: { width: 3, color: [180, 150, 90] }, strip: 0, color: [50, 50, 60], variation: 10 },
        },
      ],
    });
    assertPerfect(match);
    assertNoOverlaps(result);
  });

  test("no reliable grid: nothing is invented and a warning is returned", () => {
    const { result } = detect({
      width: 900,
      height: 600,
      seed: 9,
      background: bg([70, 80, 90], 40, 10),
      furniture: ["icons", "text", "header"],
      grids: [],
    });
    assert.equal(result.grids.length, 0);
    assert.equal(result.totalDetectedCards, 0);
    assert.ok(result.warnings.length > 0);
  });

  test("pure noise image yields no grid", () => {
    const { result } = detect({ width: 400, height: 300, seed: 11, background: bg([128, 128, 128], 0, 120), grids: [] });
    assert.equal(result.totalDetectedCards, 0);
  });
});

describe("coordinates and scaling", () => {
  const scene: Scene = {
    width: 1600,
    height: 1000,
    seed: 21,
    background: bg([60, 70, 90]),
    grids: [{ x: 100, y: 80, cols: 6, rows: 3, cardW: 180, cardH: 220, gapX: 30, gapY: 34 }],
  };

  test("large images are analysed downscaled but reported in original pixels", () => {
    const { result, match } = detect(scene, { maxAnalysisSide: 800 });
    assert.equal(result.imageWidth, 1600);
    assert.equal(result.imageHeight, 1000);
    assert.ok(result.diagnostics.analysisScale < 0.6);
    // One analysis pixel is two original pixels here.
    assertPerfect(match, 3);
  });

  test("pre-scaled input (as drawn by the browser) maps back to the original", () => {
    const { image, truth } = renderScene(scene);
    const half = downscale(image, 2);
    const result = detectInventoryGrids({ image: half, source: { width: image.width, height: image.height } });
    assert.equal(result.imageWidth, 1600);
    assertPerfect(matchBoxes(allCards(result), truth.flat(), 0.7), 3);
  });

  test("results are deterministic", () => {
    const { image } = renderScene(scene);
    const strip = (r: GridDetectionResult) => JSON.stringify(r.grids);
    assert.equal(strip(detectInventoryGrids({ image })), strip(detectInventoryGrids({ image })));
  });

  test("region of interest limits detection; coordinates stay in original pixels", () => {
    const multi: Scene = {
      width: 1200,
      height: 700,
      seed: 4,
      background: bg([60, 70, 80]),
      grids: [
        { x: 40, y: 60, cols: 4, rows: 3, cardW: 90, cardH: 110, gapX: 14, gapY: 16 },
        { x: 620, y: 120, cols: 3, rows: 2, cardW: 140, cardH: 140, gapX: 24, gapY: 24, style: { strip: 0 } },
      ],
    };
    const { image, truth } = renderScene(multi);
    const result = detectInventoryGrids({ image }, { region: { x: 580, y: 80, width: 600, height: 500 } });
    assert.equal(result.grids.length, 1);
    assertPerfect(matchBoxes(allCards(result), truth[1], 0.7));
  });
});

describe("validation and errors", () => {
  test("unsupported, empty and oversized files are rejected", () => {
    const code = (fn: () => void) => {
      try {
        fn();
      } catch (e) {
        assert.ok(e instanceof GridDetectionError);
        return e.code;
      }
      return "OK";
    };
    assert.equal(code(() => validateImageFile({ type: "application/pdf", size: 10, name: "a.pdf" })), "UNSUPPORTED_FILE_TYPE");
    assert.equal(code(() => validateImageFile({ type: "image/png", size: 0 })), "EMPTY_FILE");
    assert.equal(code(() => validateImageFile({ type: "image/jpeg", size: 200 * 1024 * 1024 })), "FILE_TOO_LARGE");
    assert.equal(code(() => validateImageFile({ type: "image/webp", size: 1000 })), "OK");
    // Clipboard blobs may lack a type; fall back to the extension.
    assert.equal(resolveImageType("", "shot.PNG"), "image/png");
    assert.equal(code(() => validateImageDimensions(8, 400)), "IMAGE_TOO_SMALL");
    assert.equal(code(() => validateImageDimensions(20000, 400)), "IMAGE_TOO_LARGE");
  });

  test("corrupt pixel buffers fail with a client-safe error", () => {
    assert.throws(
      () => detectInventoryGrids({ image: { width: 100, height: 100, data: new Uint8ClampedArray(10) } }),
      (e: unknown) => e instanceof GridDetectionError && e.code === "INVALID_IMAGE" && !/undefined|TypeError/.test(e.message),
    );
    assert.throws(
      () => detectInventoryGrids({ image: { width: 8, height: 8, data: new Uint8ClampedArray(256) } }),
      (e: unknown) => e instanceof GridDetectionError && e.code === "IMAGE_TOO_SMALL",
    );
  });

  test("settings are clamped to safe ranges", () => {
    const s = resolveDetectionSettings({ sensitivity: 9, minConfidence: -1, minAspectRatio: 3, maxAspectRatio: 0.5, maxAnalysisSide: 10 });
    assert.equal(s.sensitivity, 1);
    assert.equal(s.minConfidence, 0);
    assert.ok(s.minAspectRatio <= s.maxAspectRatio);
    assert.equal(s.maxAnalysisSide, 320);
    assert.equal(s.includeClippedCards, false);
  });
});

describe("manual editing", () => {
  function sampleGrid(): DetectedGrid[] {
    const { result } = detect({
      width: 800,
      height: 600,
      seed: 2,
      background: bg([50, 60, 80], 20),
      grids: [{ x: 60, y: 50, cols: 6, rows: 3, cardW: 96, cardH: 120, gapX: 20, gapY: 24, count: 14 }],
    });
    return result.grids;
  }

  test("adding a missed card snaps it into the lattice row/column", () => {
    const grids = sampleGrid();
    const slot = grids[0].emptySlots[0];
    assert.deepEqual(latticePosition(grids[0], slot), { row: slot.row, column: slot.column });
    const next = applyCardEdit(grids, { type: "add", rect: { ...slot, x: slot.x + 2 } }, 800, 600);
    const added = next[0].cards.find((c) => c.source === "manual");
    assert.ok(added);
    assert.deepEqual([added.row, added.column], [slot.row, slot.column]);
    assert.equal(next[0].cards.length, 15);
    assert.equal(next[0].emptySlots.length, 3);
  });

  test("a card far from any grid goes to a separate manual group", () => {
    const next = applyCardEdit(sampleGrid(), { type: "add", rect: { x: 700, y: 520, width: 40, height: 40 } }, 800, 600);
    const manual = next.find((g) => g.id === "manual");
    assert.ok(manual);
    assert.equal(manual.cards[0].row, null);
  });

  test("removing and adjusting cards; undo, redo and reset", () => {
    const grids = sampleGrid();
    const first = grids[0].cards[0];
    let state = createEditorState(grids);
    state = editorReducer(state, { type: "edit", edit: { type: "remove", cardId: first.id }, imageWidth: 800, imageHeight: 600 });
    assert.equal(state.present[0].cards.length, 13);
    const second = state.present[0].cards[0];
    state = editorReducer(state, {
      type: "edit",
      edit: { type: "update", cardId: second.id, rect: { x: second.x - 3, y: second.y, width: second.width + 3, height: second.height } },
      imageWidth: 800,
      imageHeight: 600,
    });
    const updated = state.present[0].cards.find((c) => c.id === second.id);
    assert.equal(updated?.x, second.x - 3);
    assert.equal(updated?.source, "manual");

    state = editorReducer(state, { type: "undo" });
    assert.equal(state.present[0].cards.find((c) => c.id === second.id)?.x, second.x);
    state = editorReducer(state, { type: "redo" });
    assert.equal(state.present[0].cards.find((c) => c.id === second.id)?.x, second.x - 3);
    state = editorReducer(state, { type: "reset" });
    assert.equal(state.present, state.original);
    assert.equal(state.present[0].cards.length, 14);
  });

  test("edited rectangles are clamped to the image", () => {
    const grids = sampleGrid();
    const card = grids[0].cards[0];
    const next = applyCardEdit(grids, { type: "update", cardId: card.id, rect: { x: -20, y: -5, width: 50, height: 60 } }, 800, 600);
    const c = next[0].cards.find((x) => x.id === card.id);
    assert.deepEqual([c?.x, c?.y, c?.width, c?.height], [0, 0, 30, 55]);
  });
});
