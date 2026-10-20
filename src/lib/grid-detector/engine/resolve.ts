/**
 * Grid-level arbitration between competing lattice hypotheses.
 *
 * Several lattices usually explain the same region: the real cards, card
 * sub-parts (e.g. the artwork panel or the quantity strip, which repeat just
 * like cards do), and occasionally multi-card blocks. Repetition alone cannot
 * tell them apart, so we use containment relationships plus total evidence.
 */
import { containment, rectIoU } from "./filter";
import type { Lattice, LatticeCard } from "./lattice";

const SOURCE_WEIGHT = { detected: 1, recovered: 0.8 } as const;

/**
 * Evidence contributed by one card: how much supported border it has
 * (quality² × perimeter). Summing plain quality would let many mediocre
 * fragments (half-cards, slivers between lines) outvote fewer, excellent
 * complete cards; border length grows with card size, quality² rewards
 * clean borders.
 */
function cardWeight(c: LatticeCard): number {
  const perimeter = 2 * (c.right - c.left + (c.bottom - c.top));
  return (
    (c.clipped ? 0.4 : SOURCE_WEIGHT[c.source]) *
    c.quality *
    c.quality *
    perimeter
  );
}

export function latticeScore(lat: Lattice): number {
  return lat.cards.reduce((s, c) => s + cardWeight(c), 0);
}

function fullCards(lat: Lattice): LatticeCard[] {
  return lat.cards.filter((c) => !c.clipped);
}

function meanQuality(lat: Lattice): number {
  const full = fullCards(lat);
  if (full.length === 0) return 0;
  return full.reduce((s, c) => s + c.quality, 0) / full.length;
}

/**
 * Minimal evidence for a grid to be reported. Very small grids need stronger
 * evidence because coincidental pairs of same-sized rectangles do occur
 * inside artwork. A lone card is only accepted when it dominates the image
 * (a screenshot/crop of a single item).
 */
export function isPlausibleGrid(lat: Lattice, imageArea: number): boolean {
  const full = fullCards(lat);
  const q = meanQuality(lat);
  if (full.length === 0) return false;
  // Cards of one grid never overlap: a measured pitch smaller than the card
  // means the "cards" are overlapping blocks (e.g. pairs of touching cards).
  if (lat.pxMeasured && lat.px < 0.9 * lat.cw) return false;
  if (lat.pyMeasured && lat.py < 0.9 * lat.ch) return false;
  if (full.length === 1) {
    const c = full[0];
    const area = (c.right - c.left) * (c.bottom - c.top);
    return q >= 0.7 && area >= 0.35 * imageArea;
  }
  if (full.length === 2) {
    const cols = new Set(full.map((c) => c.col)).size;
    const totalArea = full.reduce(
      (s, c) => s + (c.right - c.left) * (c.bottom - c.top),
      0,
    );
    if (cols === 1 && totalArea < 0.35 * imageArea) return false;
    return q >= 0.7;
  }
  return q >= 0.5;
}

function area(c: { left: number; top: number; right: number; bottom: number }) {
  return (c.right - c.left) * (c.bottom - c.top);
}

/** True when every pair of boxes is separated by at least `gap` pixels on some axis. */
function allSeparated(boxes: LatticeCard[], gap: number): boolean {
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      const sepX = Math.max(b.left - a.right, a.left - b.right);
      const sepY = Math.max(b.top - a.bottom, a.top - b.bottom);
      if (Math.max(sepX, sepY) < gap) return false;
    }
  }
  return true;
}

export function resolveLattices(
  lattices: Lattice[],
  imageArea: number,
): Lattice[] {
  let pool = lattices.filter((l) => isPlausibleGrid(l, imageArea));
  const dropped = new Set<Lattice>();

  for (const a of pool) {
    for (const b of pool) {
      if (a === b || dropped.has(a) || dropped.has(b)) continue;
      if (a.cw * a.ch >= b.cw * b.ch) continue; // a: smaller cards, b: larger
      const aFull = fullCards(a);
      const bFull = fullCards(b);
      if (aFull.length === 0 || bFull.length === 0) continue;

      const insideOf = bFull.map((cb) =>
        aFull.filter((ca) => containment(ca, cb) >= 0.8),
      );

      // b's "cards" are blocks of several *separate* a-cards (a visible gap
      // between them) → b is a container, not a card grid. Stars or digits
      // inside a card don't tile it, and two halves of one card touch each
      // other, so neither counts.
      let containers = 0;
      bFull.forEach((cb, i) => {
        const inside = insideOf[i];
        if (inside.length < 2) return;
        const covered = inside.reduce((s, ca) => s + area(ca), 0);
        if ((covered >= 0.35 * area(cb) || inside.length >= 3) && allSeparated(inside, 2)) containers++;
      });
      // Only when the contained cards are at least as convincing — otherwise
      // a good card is being "tiled" by weak slivers.
      if (
        containers >= 0.5 * bFull.length &&
        meanQuality(a) >= 0.8 * meanQuality(b)
      ) {
        dropped.add(b);
        continue;
      }

      // a-cards inside (non-container) b-cards are fragments of a card: its
      // artwork panel, quantity strip, star icons, two halves split by a
      // divider... Prefer the complete card when its evidence is comparable —
      // both per card and in total, so one large stray rectangle (bounded by
      // long UI lines) cannot swallow a well-supported grid.
      // This applies ONLY when b does not contain multiple separate cards.
      const hasMultipleInside = insideOf.some((inside) => inside.length >= 2);
      if (!hasMultipleInside) {
        const insideAny = new Set(insideOf.flat());
        if (
          insideAny.size >= 0.5 * aFull.length &&
          meanQuality(b) >= 0.75 * meanQuality(a) &&
          latticeScore(b) >= 0.4 * latticeScore(a)
        ) {
          dropped.add(a);
        }
      }
    }
  }
  pool = pool.filter((l) => !dropped.has(l));

  // Greedy acceptance by total evidence; later hypotheses lose overlapping cards.
  pool.sort((x, y) => latticeScore(y) - latticeScore(x));
  const accepted: Lattice[] = [];
  const taken: LatticeCard[] = [];
  for (const lat of pool) {
    const keep = lat.cards.filter(
      (c) =>
        !taken.some(
          (t) =>
            rectIoU(c, t) >= 0.2 ||
            containment(c, t) >= 0.5 ||
            containment(t, c) >= 0.5,
        ),
    );
    if (keep.length < 0.6 * lat.cards.length) continue;
    const trimmed: Lattice = { ...lat, cards: keep };
    if (!isPlausibleGrid(trimmed, imageArea)) continue;
    accepted.push(trimmed);
    taken.push(...keep);
  }
  return dropMinorGrids(accepted);
}

/**
 * A row (or column) of cards cut off by a scroll viewport forms its own small
 * lattice: same card width and column positions as the main grid, but
 * shorter cards whose top (or bottom) border lines up with the main grid's
 * next row. Recognising this lets us drop incomplete cards — or attach them
 * to the main grid as clipped cards when requested.
 */
function clippedExtensionOf(g: Lattice, m: Lattice): boolean {
  const alignedOn = (
    pos: number,
    origin: number,
    pitch: number,
    tol: number,
  ): number | null => {
    const k = Math.round((pos - origin) / pitch);
    return Math.abs(pos - (origin + k * pitch)) <= tol ? k : null;
  };
  const tolX = Math.max(3, 0.05 * m.px);
  const tolY = Math.max(3, 0.05 * m.py);
  const sameWidth = Math.abs(g.cw - m.cw) <= 0.08 * m.cw;
  const sameHeight = Math.abs(g.ch - m.ch) <= 0.08 * m.ch;
  // Most (not necessarily all) cards must line up: completion may have added
  // a stray cell to the clipped row's own lattice.
  const mostly = (ok: (c: LatticeCard) => boolean) =>
    g.cards.filter(ok).length >= Math.max(1, 0.7 * g.cards.length);
  if (sameWidth && g.ch < 0.92 * m.ch) {
    return mostly((c) => {
      if (alignedOn(c.left, m.x0, m.px, tolX) === null) return false;
      const byTop = alignedOn(c.top, m.y0, m.py, tolY);
      const byBottom = alignedOn(c.bottom - m.ch, m.y0, m.py, tolY);
      return byTop !== null || byBottom !== null;
    });
  }
  if (sameHeight && g.cw < 0.92 * m.cw) {
    return mostly((c) => {
      if (alignedOn(c.top, m.y0, m.py, tolY) === null) return false;
      const byLeft = alignedOn(c.left, m.x0, m.px, tolX);
      const byRight = alignedOn(c.right - m.cw, m.x0, m.px, tolX);
      return byLeft !== null || byRight !== null;
    });
  }
  return false;
}

/**
 * Removes (or merges as clipped cards) lattices that are viewport-clipped
 * extensions of a stronger lattice.
 */
export function handleClippedExtensions(
  grids: Lattice[],
  includeClipped: boolean,
): Lattice[] {
  const ordered = [...grids].sort((a, b) => latticeScore(b) - latticeScore(a));
  const result: Lattice[] = [];
  for (const g of ordered) {
    const host = result.find((m) => clippedExtensionOf(g, m));
    if (!host) {
      result.push(g);
      continue;
    }
    if (!includeClipped) continue;
    const occupied = new Set(host.cards.map((c) => `${c.row},${c.col}`));
    for (const c of g.cards) {
      const col = Math.round((c.left - host.x0) / host.px);
      const topRow = Math.round((c.top - host.y0) / host.py);
      const bottomRow = Math.round((c.bottom - host.ch - host.y0) / host.py);
      const row =
        Math.abs(c.top - (host.y0 + topRow * host.py)) <=
        Math.abs(c.bottom - host.ch - (host.y0 + bottomRow * host.py))
          ? topRow
          : bottomRow;
      const key = `${row},${col}`;
      if (occupied.has(key)) continue;
      occupied.add(key);
      host.cards.push({ ...c, row, col, clipped: true });
    }
  }
  return result;
}

/**
 * Screens full of UI (sidebars, headers, text, detail panels) contain small
 * coincidental repetitions of rectangles. Once a strong grid has been found,
 * additional grids must look like real inventories too: at least three
 * well-supported cards of a comparable size, and a meaningful share of the
 * evidence. Separate grids with different card sizes still pass.
 */
function dropMinorGrids(grids: Lattice[]): Lattice[] {
  if (grids.length <= 1) return grids;
  const scored = grids.map((g) => ({ g, s: latticeScore(g) }));
  scored.sort((a, b) => b.s - a.s);
  const main = scored[0];
  const mainArea = main.g.cw * main.g.ch;
  return scored
    .filter(({ g, s }, i) => {
      if (i === 0) return true;
      return (
        fullCards(g).length >= 3 &&
        meanQuality(g) >= 0.75 &&
        s >= 0.15 * main.s &&
        g.cw * g.ch >= 0.15 * mainArea
      );
    })
    .map(({ g }) => g);
}
