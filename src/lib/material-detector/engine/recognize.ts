/**
 * Material recognition pipeline (runs after grid detection):
 *
 *   per card
 *     1. sample the card into a canonical 64 px frame; find a "New" badge   (card.ts)
 *     2. coarse pass: composite error of all references at 32 px            (match.ts)
 *     3. rarity: star-row width + background colour                         (rarity.ts)
 *     4. shortlist (coarse error + rarity penalty) → fine pass at 64 px
 *     5. alignment: pattern search over shift/scale of the card box
 *     6. quantity: digit segmentation + template correlation                 (quantity.ts)
 *   per grid
 *     7. inventory-order decoding among near-identical candidates           (context.ts)
 *   8. confidence, status and aggregation into items
 *
 * Pure TypeScript over typed arrays: runs in a Web Worker and in Node (tests).
 * Deterministic for a given input, bank and settings.
 */
import type { DetectedCard, DetectedGrid, PixelRect } from "../../grid-detector/types";
import type { RgbaImage } from "../../grid-detector/engine/image";
import { validateRgbaImage } from "../../grid-detector/engine/image";
import defaultDigitTemplates from "../../../data/digit-templates.json";
import { resolveRecognitionSettings } from "../settings";
import type {
  CardRecognition,
  MaterialCandidate,
  MaterialRecognitionResult,
  QuantityReading,
  RarityReading,
  RecognitionSettings,
  RecognizedItem,
} from "../types";
import { COARSE_SIZE, FINE_SIZE, type ReferenceBank } from "./bank";
import {
  type Alignment,
  artRows,
  badgeMask,
  cardHeight,
  detectNewBadge,
  type Frame,
  halve,
  IDENTITY_ALIGNMENT,
  alignedRect,
  normalizeCardBox,
  sampleCard,
  scaleBadge,
  snapToFooter,
} from "./card";
import { decodeInventoryOrder } from "./context";
import { MaterialDetectionError, toMaterialDetectionError } from "./errors";
import { backgroundColor, compositeError, patternSearch, peakBlockError } from "./match";
import { type DigitTemplates, readQuantity } from "./quantity";
import { classifyBackground, combineRarity, readStars } from "./rarity";

export interface RecognitionInput {
  /** Pixels to analyse (the whole screenshot). */
  image: RgbaImage;
  /**
   * Set when `image` is a downscaled rendering of the original; card boxes
   * (original pixels) are mapped onto it.
   */
  source?: { width: number; height: number };
  /** Grids from `detectInventoryGrids` (possibly edited). */
  grids: DetectedGrid[];
  /** Called after each card (e.g. to drive a progress bar). */
  onProgress?: (done: number, total: number) => void;
}

// ── Tuning (from the reference screenshots; see docs/material-detector.md) ──
/** Error added to candidates whose rarity disagrees with a confident reading. */
const RARITY_PENALTY = 0.05;
/** Confidence lost (× rarity confidence) when the chosen material's rarity contradicts the reading. */
const RARITY_CLASH = 0.6;
/** A best fine error above this means the card is not in the catalog. */
const UNKNOWN_ERROR = 0.3;
/** Mean error up to which the fit is fully convincing. */
const GOOD_ERROR = 0.12;
/** Peak 8 × 8 block error (fine frame) up to which no part of the icon disagrees… */
const GOOD_PEAK = 0.35;
/** …and from which some part clearly belongs to a different icon. */
const BAD_PEAK = 0.6;
const PEAK_BLOCK = 8;
/** Candidates whose peak error is measured (any of them may be chosen by the order context). */
const PEAK_TOP = 3;
/**
 * Alternatives are reported with the best's confidence × exp(−Δerror / this):
 * a near-tie (Δ 0.02) keeps ~50%, a clearly worse icon (Δ 0.1) ~3%.
 */
const ALTERNATIVE_DECAY = 0.03;
/** Margin to the runner-up that counts as a clear decision. */
const CLEAR_MARGIN = 0.025;
const ORDER_PENALTY = 0.02;
const ORDER_WINDOW = 0.02;
/** Candidates individually re-aligned after the shared alignment (when close). */
const REALIGN_TOP = 3;
/** Candidates further than this behind the leader are not re-scored after alignment. */
const RESCORE_WINDOW = 0.06;
/**
 * Footer snapping is tried when the best coarse error at the given box is
 * above this: on the reference screenshots detector boxes reach at most
 * 0.105 (p95 0.079) and boxes displaced by ~10% at least 0.113.
 */
const SNAP_TRIGGER = 0.09;
/** …and only when the snapped box moves an edge by more than this (× card width). */
const SNAP_MIN_SHIFT = 0.03;

const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

interface Scored {
  index: number;
  /** Fine error (or coarse, before the fine pass). */
  error: number;
  /** error + rarity penalty: what candidates are ranked by. */
  rank: number;
  alignment: Alignment;
  /** Worst local (block) error at `alignment`; measured for the top candidates only. */
  peak?: number;
}

interface CardAnalysis {
  card: DetectedCard;
  grid: DetectedGrid;
  /** Card box in analysed-image pixels after aspect correction. */
  box: PixelRect;
  ranked: Scored[];
  rarity: RarityReading;
  quantity: QuantityReading;
  hasNewBadge: boolean;
  evaluations: number;
}

class Timer {
  readonly totals: Record<string, number> = {};
  time<T>(stage: string, fn: () => T): T {
    const t0 = now();
    try {
      return fn();
    } finally {
      this.totals[stage] = (this.totals[stage] ?? 0) + now() - t0;
    }
  }
}

/** Canonical frames of one candidate card box and the coarse pass over the whole catalog. */
function prepareBox(image: RgbaImage, box: PixelRect, bank: ReferenceBank, timer: Timer) {
  const fineRows = artRows(FINE_SIZE);
  const coarseRows = artRows(COARSE_SIZE);
  const frames = timer.time("sample", () => {
    const fine0 = sampleCard(image, box, FINE_SIZE);
    const badge = detectNewBadge(fine0);
    return {
      fine0,
      badge,
      fineMask: badgeMask(FINE_SIZE, fineRows, badge),
      coarseMask: badgeMask(COARSE_SIZE, coarseRows, scaleBadge(badge, FINE_SIZE, COARSE_SIZE)),
      coarse: halve(fine0),
    };
  });
  const coarseErrors = timer.time("coarse", () =>
    bank.coarse.map((t) => compositeError(frames.coarse, t, frames.coarseMask)),
  );
  let bestCoarse = 0;
  for (let i = 1; i < coarseErrors.length; i++) if (coarseErrors[i] < coarseErrors[bestCoarse]) bestCoarse = i;
  return { box, ...frames, coarseErrors, bestCoarse };
}

/** True when two boxes differ by more than `tol` of the card width anywhere. */
const boxesDiffer = (a: PixelRect, b: PixelRect, tol: number) =>
  Math.max(
    Math.abs(a.x - b.x),
    Math.abs(a.y - b.y),
    Math.abs(a.x + a.width - b.x - b.width),
    Math.abs(a.y + a.height - b.y - b.height),
  ) >
  tol * a.width;

function analyseCard(
  image: RgbaImage,
  givenBox: PixelRect,
  bank: ReferenceBank,
  settings: RecognitionSettings,
  digits: DigitTemplates,
  timer: Timer,
): Omit<CardAnalysis, "card" | "grid"> {
  const fineRows = artRows(FINE_SIZE);

  // 1–2. Frames and coarse pass. A box that is off by more than the alignment
  //      search can fix (e.g. hand-drawn) is re-located from the card's
  //      footer; the snapped box is kept only if the catalog fits it better.
  let prepared = prepareBox(image, givenBox, bank, timer);
  if (settings.refineAlignment && prepared.coarseErrors[prepared.bestCoarse] > SNAP_TRIGGER) {
    const snapped = timer.time("sample", () => snapToFooter(image, givenBox));
    if (snapped && boxesDiffer(givenBox, snapped, SNAP_MIN_SHIFT)) {
      const alt = prepareBox(image, snapped, bank, timer);
      if (alt.coarseErrors[alt.bestCoarse] < prepared.coarseErrors[prepared.bestCoarse]) prepared = alt;
    }
  }
  const { box, fine0, badge, fineMask, coarseErrors, bestCoarse } = prepared;

  // 3. Rarity (always read for reporting; used for ranking when enabled).
  const rarity = timer.time("rarity", () => {
    const stars = readStars(image, box, IDENTITY_ALIGNMENT);
    const bg = classifyBackground(backgroundColor(fine0, bank.fine(bestCoarse), fineMask));
    return combineRarity(stars, bg);
  });
  const penalty = (index: number) =>
    settings.useRarity && rarity.value !== null && bank.entries[index].rarity !== rarity.value
      ? RARITY_PENALTY * rarity.confidence
      : 0;

  // 4. Shortlist and fine pass at the detected box.
  const shortlist = coarseErrors
    .map((e, index) => ({ index, rank: e + penalty(index) }))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, settings.shortlistSize);

  const frames = new Map<string, Frame>([[key(IDENTITY_ALIGNMENT), fine0]]);
  const frameAt = (a: Alignment) => {
    const k = key(a);
    let f = frames.get(k);
    if (!f) {
      f = sampleCard(image, box, FINE_SIZE, a);
      frames.set(k, f);
    }
    return f;
  };
  let evaluations = 0;
  const fineError = (index: number, a: Alignment) => {
    evaluations++;
    return compositeError(frameAt(a), bank.fine(index), fineMask);
  };

  let ranked: Scored[] = timer.time("fine", () =>
    shortlist
      .map(({ index }) => {
        const error = fineError(index, IDENTITY_ALIGNMENT);
        return { index, error, rank: error + penalty(index), alignment: IDENTITY_ALIGNMENT };
      })
      .sort((a, b) => a.rank - b.rank),
  );

  // 5. Alignment: one shared search on the leader, then a short individual
  //    search for the closest contenders so none is judged at a pose that
  //    only suits another icon.
  if (settings.refineAlignment) {
    ranked = timer.time("align", () => {
      const fy = 1 / cardHeight(FINE_SIZE);
      const fx = 1 / FINE_SIZE;
      const lead = ranked[0];
      const shared = patternSearch((p) => fineError(lead.index, p), IDENTITY_ALIGNMENT, lead.error, {
        step: { dx: fx, dy: fy, scale: 0.025 },
        minStep: fx / 4,
        maxEvaluations: 24,
        limit: { dx: 0.06, dy: 0.05, scale: 0.08 },
      });
      // Only candidates that could still overtake the leader are worth re-scoring.
      const realigned = ranked.map((s) => {
        if (s.index !== lead.index && s.rank - lead.rank > RESCORE_WINDOW) return s;
        const error = s.index === lead.index ? shared.error : fineError(s.index, shared.best);
        const best = Math.min(error, s.error);
        return { ...s, error: best, rank: best + penalty(s.index), alignment: error <= s.error ? shared.best : s.alignment };
      });
      realigned.sort((a, b) => a.rank - b.rank);
      const contenders = realigned.filter((s, k) => k < REALIGN_TOP && s.rank - realigned[0].rank < 2 * CLEAR_MARGIN);
      // A clear winner needs no individual search.
      for (const s of contenders.length > 1 ? contenders : []) {
        const local = patternSearch((p) => fineError(s.index, p), s.alignment, s.error, {
          step: { dx: fx / 2, dy: fy / 2, scale: 0.0125 },
          minStep: fx / 4,
          maxEvaluations: 10,
          limit: { dx: 0.06, dy: 0.05, scale: 0.08 },
        });
        s.error = local.error;
        s.rank = local.error + penalty(s.index);
        s.alignment = local.best;
      }
      return realigned.sort((a, b) => a.rank - b.rank);
    });
  }

  // Local disagreement of the leading candidates (see matchConfidence).
  timer.time("fine", () => {
    const residual = new Float32Array(FINE_SIZE * fineRows);
    for (const s of ranked.slice(0, PEAK_TOP)) {
      compositeError(frameAt(s.alignment), bank.fine(s.index), fineMask, residual);
      s.peak = peakBlockError(residual, FINE_SIZE, fineRows, PEAK_BLOCK);
    }
  });

  // 6. Quantity, read at the leader's alignment.
  const quantity = settings.readQuantity
    ? timer.time("quantity", () => readQuantity(image, box, ranked[0].alignment, digits))
    : { value: null, text: "", confidence: 0 };

  return { box, ranked, rarity, quantity, hasNewBadge: badge !== null, evaluations };
}

const key = (a: Alignment) => `${a.dx.toFixed(5)},${a.dy.toFixed(5)},${a.scale.toFixed(5)}`;

/**
 * 0–1 confidence of the material decision.
 *
 * - fit: the best candidate must explain the card everywhere — a low mean
 *   error *and* no hot spot (`peak`). A material missing from the catalog is
 *   usually matched to a sibling (same book, other emblem; same gem, other
 *   colour) whose mean error looks fine but whose emblem or facets don't.
 * - margin: how far ahead of the runner-up it is.
 */
export function matchConfidence(best: number, runnerUp: number | undefined, peak = 0): number {
  const fitMean = Math.min(1, Math.max(0, (UNKNOWN_ERROR - best) / (UNKNOWN_ERROR - GOOD_ERROR)));
  const fitPeak = Math.min(1, Math.max(0, (BAD_PEAK - peak) / (BAD_PEAK - GOOD_PEAK)));
  const fit = Math.min(fitMean, fitPeak);
  const margin = runnerUp === undefined ? 1 : Math.min(1, Math.max(0, (runnerUp - best) / CLEAR_MARGIN));
  return Math.round(fit * (0.35 + 0.65 * margin) * 1000) / 1000;
}

function toCandidate(bank: ReferenceBank, s: Scored, confidence: number): MaterialCandidate {
  const e = bank.entries[s.index];
  return { id: e.id, name: e.name, rarity: e.rarity, error: Math.round(s.error * 10000) / 10000, confidence };
}

function mapBox(card: DetectedCard, sx: number, sy: number): PixelRect {
  return { x: card.x * sx, y: card.y * sy, width: card.width * sx, height: card.height * sy };
}

const unmapBox = (r: PixelRect, sx: number, sy: number): PixelRect => ({
  x: r.x / sx,
  y: r.y / sy,
  width: r.width / sx,
  height: r.height / sy,
});

const roundRect = (r: PixelRect): PixelRect => ({
  x: Math.round(r.x * 10) / 10,
  y: Math.round(r.y * 10) / 10,
  width: Math.round(r.width * 10) / 10,
  height: Math.round(r.height * 10) / 10,
});

export function recognizeMaterials(
  input: RecognitionInput,
  bank: ReferenceBank,
  partialSettings: Partial<RecognitionSettings> = {},
  digits: DigitTemplates = defaultDigitTemplates as DigitTemplates,
): MaterialRecognitionResult {
  const started = now();
  const settings = resolveRecognitionSettings(partialSettings);
  const timer = new Timer();
  try {
    validateRgbaImage(input.image);
  } catch (err) {
    throw toMaterialDetectionError(err);
  }
  if (!bank || bank.coarse.length === 0) {
    throw new MaterialDetectionError("REFERENCES_INVALID", "No material references are loaded.");
  }
  const sourceW = input.source?.width ?? input.image.width;
  const sourceH = input.source?.height ?? input.image.height;
  const sx = input.image.width / sourceW;
  const sy = input.image.height / sourceH;

  // Per card analysis.
  const analyses: CardAnalysis[] = [];
  const work = input.grids.flatMap((grid) =>
    [...grid.cards]
      .filter((c) => !c.clipped && c.width >= 8 && c.height >= 8)
      .sort((a, b) => (a.row ?? 0) - (b.row ?? 0) || (a.column ?? 0) - (b.column ?? 0) || a.y - b.y || a.x - b.x)
      .map((card) => ({ grid, card })),
  );
  try {
    for (const { grid, card } of work) {
      const box = normalizeCardBox(mapBox(card, sx, sy));
      analyses.push({ card, grid, ...analyseCard(input.image, box, bank, settings, digits, timer) });
      input.onProgress?.(analyses.length, work.length);
    }
  } catch (err) {
    throw toMaterialDetectionError(err, "Material recognition failed unexpectedly.");
  }

  // Inventory-order context, grid by grid.
  const chosen = analyses.map(() => 0);
  if (settings.useInventoryOrder) {
    timer.time("context", () => {
      for (const grid of input.grids) {
        const members = analyses.map((a, i) => ({ a, i })).filter(({ a }) => a.grid === grid);
        const seq = members.map(({ a }) =>
          a.ranked[0].error > UNKNOWN_ERROR
            ? []
            : a.ranked.map((s) => ({ order: bank.entries[s.index].order, error: s.rank })),
        );
        decodeInventoryOrder(seq, { penalty: ORDER_PENALTY, window: ORDER_WINDOW }).forEach((k, j) => {
          chosen[members[j].i] = k;
        });
      }
    });
  }

  // Confidence, status, serialisation.
  const cards: CardRecognition[] = analyses.map((a, i) => {
    const pick = chosen[i];
    const ordered = pick === 0 ? a.ranked : [a.ranked[pick], ...a.ranked.filter((_, k) => k !== pick)];
    const best = ordered[0];
    const runnerUp = ordered[1];
    // An order-based pick is only as sure as the visual tie it broke allows.
    // A material whose tier contradicts the stars and background is likely
    // a sibling of the real one (e.g. a material missing from the catalog).
    const rarityClash =
      settings.useRarity && a.rarity.value !== null && bank.entries[best.index].rarity !== a.rarity.value
        ? 1 - RARITY_CLASH * a.rarity.confidence
        : 1;
    const confidence =
      matchConfidence(best.rank, runnerUp ? Math.max(runnerUp.rank, best.rank) : undefined, best.peak) *
      (pick === 0 ? 1 : 0.8) *
      rarityClash;
    const unknown = best.error > UNKNOWN_ERROR;
    const candidates = ordered.slice(0, settings.candidateCount).map((s, k) =>
      toCandidate(
        bank,
        s,
        k === 0 ? confidence : Math.round(confidence * Math.exp(-(s.rank - best.rank) / ALTERNATIVE_DECAY) * 1000) / 1000,
      ),
    );
    const quantityFactor = settings.readQuantity ? 0.6 + 0.4 * a.quantity.confidence : 1;
    return {
      cardId: a.card.id,
      gridId: a.grid.id,
      row: a.card.row,
      column: a.card.column,
      box: { x: a.card.x, y: a.card.y, width: a.card.width, height: a.card.height },
      matchedBox: roundRect(unmapBox(alignedRect(a.box, best.alignment), sx, sy)),
      status: unknown ? "unknown" : confidence >= settings.minConfidence ? "matched" : "uncertain",
      material: unknown ? null : candidates[0],
      candidates,
      rarity: a.rarity,
      quantity: a.quantity,
      hasNewBadge: a.hasNewBadge,
      orderAdjusted: pick !== 0,
      confidence: unknown ? 0 : Math.round(confidence * quantityFactor * 1000) / 1000,
    };
  });

  const items = aggregate(cards);
  const review = cards.filter((c) => c.status !== "matched").length;
  const warnings: string[] = [];
  if (analyses.length === 0) warnings.push("No complete cards to recognise.");
  if (review > 0) warnings.push(`${review} card${review > 1 ? "s" : ""} could not be identified with confidence.`);
  const unreadable = cards.filter((c) => c.status !== "unknown" && settings.readQuantity && c.quantity.value === null).length;
  if (unreadable > 0) warnings.push(`${unreadable} quantit${unreadable > 1 ? "ies" : "y"} could not be read.`);

  const round1 = (v: number) => Math.round(v * 10) / 10;
  return {
    imageWidth: sourceW,
    imageHeight: sourceH,
    cards,
    items,
    processingTimeMs: round1(now() - started),
    warnings,
    settings,
    diagnostics: {
      referenceCount: bank.entries.length,
      bankVersion: bank.version,
      alignmentEvaluations: analyses.length
        ? Math.round((analyses.reduce((s, a) => s + a.evaluations, 0) / analyses.length) * 10) / 10
        : 0,
      stageTimingsMs: Object.fromEntries(Object.entries(timer.totals).map(([k, v]) => [k, round1(v)])),
    },
  };
}

/** Groups recognised cards by material; overlapping screenshots show a material more than once. */
export function aggregate(cards: CardRecognition[]): RecognizedItem[] {
  const byId = new Map<string, RecognizedItem & { qtyConfidence: number }>();
  for (const c of cards) {
    if (!c.material) continue;
    const q = c.quantity.value;
    const existing = byId.get(c.material.id);
    if (!existing) {
      byId.set(c.material.id, {
        materialId: c.material.id,
        name: c.material.name,
        rarity: c.material.rarity,
        quantity: q,
        cardIds: [c.cardId],
        confidence: c.confidence,
        qtyConfidence: q === null ? -1 : c.quantity.confidence,
      });
      continue;
    }
    existing.cardIds.push(c.cardId);
    existing.confidence = Math.max(existing.confidence, c.confidence);
    if (q !== null && c.quantity.confidence > existing.qtyConfidence) {
      existing.quantity = q;
      existing.qtyConfidence = c.quantity.confidence;
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return [...byId.values()].map(({ qtyConfidence, ...item }) => item);
}
