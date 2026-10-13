/**
 * Stages 6–7 — Row/column detection and grid reconstruction.
 *
 * Within one size cluster, real cards sit on a lattice:
 *   left = x0 + col · pitchX,   top = y0 + row · pitchY.
 * We estimate the pitch by voting over pairwise distances, keep the members
 * that agree with it (outliers seed further lattices — e.g. a second grid that
 * uses the same card size), split lattices with large empty regions into
 * separate grids, then use the lattice to recover cards that rectangle
 * detection missed and to pick up cards clipped by the image or a viewport.
 */
import { median } from "./cluster";
import type { EdgeMaps } from "./edges";
import { horizontalSupport, verticalSupport } from "./edges";
import { refineRect } from "./candidates";
import { assessAt, combineQuality, type Candidate } from "./filter";

export interface LatticeCard {
  row: number;
  col: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
  quality: number;
  source: "detected" | "recovered";
  clipped: boolean;
  /** Distance from the lattice prediction relative to the alignment tolerance (0 = perfect, 1 = at tolerance). */
  misalignment: number;
}

export interface Lattice {
  x0: number;
  y0: number;
  /** Pitch between card origins; estimated from the other axis when only one row/column exists. */
  px: number;
  py: number;
  /** False when the pitch along that axis was guessed rather than measured. */
  pxMeasured: boolean;
  pyMeasured: boolean;
  cw: number;
  ch: number;
  cards: LatticeCard[];
}

/**
 * Votes for the fundamental spacing between aligned members. Every pairwise
 * distance d proposes pitches d/1 … d/6; a pitch is supported by each distance
 * that is (close to) an integer multiple of it, weighted by 1/multiple so the
 * fundamental beats its multiples. Pitches below the card size are impossible
 * (cards would overlap), which also rules out sub-multiples.
 */
export function estimatePitch(
  members: Candidate[],
  horizontal: boolean,
  cardSize: number,
  crossSize: number,
): number {
  const ds: number[] = [];
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const a = members[i];
      const b = members[j];
      const across = horizontal
        ? Math.abs(a.top - b.top)
        : Math.abs(a.left - b.left);
      if (across > 0.25 * crossSize) continue;
      const d = horizontal
        ? Math.abs(a.left - b.left)
        : Math.abs(a.top - b.top);
      if (d < 0.85 * cardSize) continue;
      ds.push(d);
    }
  }
  if (ds.length === 0) return NaN;

  let best = NaN;
  let bestSupport = 0;
  for (const d of ds) {
    for (let k = 1; k <= 6; k++) {
      const p = d / k;
      if (p < 0.85 * cardSize || p > 3 * cardSize) continue;
      const tol = Math.max(2.5, 0.06 * p);
      let support = 0;
      for (const e of ds) {
        const m = Math.round(e / p);
        if (m >= 1 && Math.abs(e - m * p) <= tol) support += 1 / m;
      }
      if (support > bestSupport + 1e-9) {
        bestSupport = support;
        best = p;
      }
    }
  }
  if (!Number.isFinite(best)) return NaN;
  // Refine with every consistent distance.
  const tol = Math.max(2.5, 0.06 * best);
  const refined: number[] = [];
  for (const e of ds) {
    const m = Math.round(e / best);
    if (m >= 1 && m <= 8 && Math.abs(e - m * best) <= tol) refined.push(e / m);
  }
  return refined.length ? median(refined) : best;
}

/** Least-squares fit of `pos = origin + index · pitch`; keeps the voted pitch if the fit is implausible. */
function fitAxis(
  points: { index: number; pos: number }[],
  pitch: number,
): { origin: number; pitch: number } {
  const distinct = new Set(points.map((p) => p.index)).size;
  if (distinct >= 2) {
    const n = points.length;
    let si = 0,
      sp = 0,
      sii = 0,
      sip = 0;
    for (const p of points) {
      si += p.index;
      sp += p.pos;
      sii += p.index * p.index;
      sip += p.index * p.pos;
    }
    const den = n * sii - si * si;
    if (den !== 0) {
      const slope = (n * sip - si * sp) / den;
      if (Math.abs(slope - pitch) <= 0.08 * pitch) {
        return { origin: (sp - slope * si) / n, pitch: slope };
      }
    }
  }
  return { origin: median(points.map((p) => p.pos - p.index * pitch)), pitch };
}

/** Splits cells into groups connected through neighbours at most two slots apart. */
function connectedGroups<T extends { row: number; col: number }>(
  cells: T[],
): T[][] {
  const seen = new Set<T>();
  const groups: T[][] = [];
  for (const start of cells) {
    if (seen.has(start)) continue;
    const group: T[] = [];
    const queue = [start];
    seen.add(start);
    while (queue.length) {
      const cur = queue.pop() as T;
      group.push(cur);
      for (const other of cells) {
        if (seen.has(other)) continue;
        if (
          Math.abs(other.row - cur.row) <= 2 &&
          Math.abs(other.col - cur.col) <= 2
        ) {
          seen.add(other);
          queue.push(other);
        }
      }
    }
    groups.push(group);
  }
  return groups;
}

/**
 * Fits one or more lattices to the members of a size cluster.
 * `alignTol` is the allowed misalignment as a fraction of the pitch.
 */
export function fitLattices(members: Candidate[], alignTol: number): Lattice[] {
  let remaining = [...members].sort((a, b) => b.quality - a.quality);
  const lattices: Lattice[] = [];

  for (let guard = 0; remaining.length > 0 && guard < 64; guard++) {
    const cw0 = median(remaining.slice(0, 40).map((m) => m.right - m.left));
    const ch0 = median(remaining.slice(0, 40).map((m) => m.bottom - m.top));
    const pool = remaining.slice(0, 80);
    // Measure the pitch on well-supported members first: weaker same-size
    // rectangles (shifted by a gutter, fragments) would otherwise vote for
    // spurious spacings.
    const strong = pool.filter((m) => m.quality >= 0.8 * pool[0].quality);
    const pitchOf = (horizontal: boolean) => {
      const a = horizontal ? cw0 : ch0;
      const b = horizontal ? ch0 : cw0;
      const fromStrong = strong.length >= 2 ? estimatePitch(strong, horizontal, a, b) : NaN;
      return Number.isFinite(fromStrong) ? fromStrong : estimatePitch(pool, horizontal, a, b);
    };
    let px = pitchOf(true);
    let py = pitchOf(false);
    const pxMeasured = Number.isFinite(px);
    const pyMeasured = Number.isFinite(py);
    // A single row/column gives no pitch on the other axis. Assume the same
    // gutter as the measured axis (or a small one); recovery only accepts
    // cards at guessed positions when the image confirms them.
    const gapGuess = pyMeasured
      ? py - ch0
      : pxMeasured
        ? px - cw0
        : 0.12 * Math.min(cw0, ch0);
    if (!pxMeasured) px = cw0 + Math.max(0, gapGuess);
    if (!pyMeasured) py = ch0 + Math.max(0, gapGuess);

    const seed = remaining[0];
    const tolX = Math.max(2, alignTol * px);
    const tolY = Math.max(2, alignTol * py);
    const inliers: { m: Candidate; col: number; row: number }[] = [];
    const outliers: Candidate[] = [];
    for (const m of remaining) {
      const dx = m.left - seed.left;
      const dy = m.top - seed.top;
      const col = Math.round(dx / px);
      const row = Math.round(dy / py);
      const okX = Math.abs(dx - col * px) <= tolX && (pxMeasured || col === 0);
      const okY = Math.abs(dy - row * py) <= tolY && (pyMeasured || row === 0);
      if (okX && okY) inliers.push({ m, col, row });
      else outliers.push(m);
    }
    remaining = outliers;

    // One candidate per lattice cell (best quality wins).
    const byCell = new Map<
      string,
      { m: Candidate; col: number; row: number }
    >();
    for (const it of inliers) {
      const key = `${it.row},${it.col}`;
      const prev = byCell.get(key);
      if (!prev || prev.m.quality < it.m.quality) byCell.set(key, it);
    }
    const cells = [...byCell.values()];

    const fx = fitAxis(
      cells.map((c) => ({ index: c.col, pos: c.m.left })),
      px,
    );
    const fy = fitAxis(
      cells.map((c) => ({ index: c.row, pos: c.m.top })),
      py,
    );
    const cw = median(cells.map((c) => c.m.right - c.m.left));
    const ch = median(cells.map((c) => c.m.bottom - c.m.top));

    for (const group of connectedGroups(cells)) {
      lattices.push({
        x0: fx.origin,
        y0: fy.origin,
        px: fx.pitch,
        py: fy.pitch,
        pxMeasured,
        pyMeasured,
        cw,
        ch,
        cards: group.map(({ m, row, col }) => {
          const predL = fx.origin + col * fx.pitch;
          const predT = fy.origin + row * fy.pitch;
          return {
            row,
            col,
            left: m.left,
            top: m.top,
            right: m.right,
            bottom: m.bottom,
            quality: m.quality,
            source: "detected" as const,
            clipped: false,
            misalignment: Math.min(
              1,
              Math.max(
                Math.abs(m.left - predL) / tolX,
                Math.abs(m.top - predT) / tolY,
              ),
            ),
          };
        }),
      });
    }
  }
  return lattices;
}

export interface CompletionContext {
  edges: EdgeMaps;
  /** All filtered candidates, used to find cards clipped by a viewport. */
  candidates: Candidate[];
  /** Lazily built edge maps at a lower threshold, for faint borders. */
  faintEdges: () => EdgeMaps;
  recover: boolean;
  includeClipped: boolean;
  /** Minimum quality to accept a card inside the grid's current extent. */
  recoverQuality: number;
  /** Minimum quality to grow the grid by a row/column. */
  extendQuality: number;
  sizeTolerance: number;
  alignTol: number;
}

function predicted(lat: Lattice, row: number, col: number) {
  const left = lat.x0 + col * lat.px;
  const top = lat.y0 + row * lat.py;
  return { left, top, right: left + lat.cw, bottom: top + lat.ch };
}

function extent(lat: Lattice) {
  let rMin = Infinity,
    rMax = -Infinity,
    cMin = Infinity,
    cMax = -Infinity;
  for (const c of lat.cards) {
    rMin = Math.min(rMin, c.row);
    rMax = Math.max(rMax, c.row);
    cMin = Math.min(cMin, c.col);
    cMax = Math.max(cMax, c.col);
  }
  return { rMin, rMax, cMin, cMax };
}

/**
 * Quality of a card whose position and size come from the lattice. The shape
 * penalties (gutter band, band slice, outer flank) guard free-standing
 * detections against wrong shapes; here the shape is dictated by the grid, so
 * only the border support itself counts.
 */
function latticeBackedQuality(c: Candidate): number {
  return combineQuality(c.edge, c.minSide, 0, 0, 0);
}

/** Full-card evidence at a lattice position that lies entirely inside the image. */
function tryFullCard(
  lat: Lattice,
  row: number,
  col: number,
  ctx: CompletionContext,
  minQuality: number,
  /** Accept one faint side — only for holes inside an established grid. */
  lenient: boolean,
): LatticeCard | null {
  const p = predicted(lat, row, col);
  const radius = Math.max(2, Math.round(0.04 * Math.min(lat.cw, lat.ch)));
  // The lattice already predicts a card here, so less border evidence is
  // needed than for a free-standing detection (one faint side is fine) — but
  // an empty slot shows no card borders at all.
  const supported = (cand: Candidate, scale = 1) =>
    cand.quality >= minQuality ||
    (lenient &&
      cand.band < 0.5 &&
      cand.strongSides >= 3 &&
      cand.edge >= 0.6 * scale);
  let c = assessAt(ctx.edges, p.left, p.top, p.right, p.bottom, radius);
  if (!supported(c)) {
    // Low-contrast cards (dark card on a dark background): retry against
    // fainter edges. Inside the grid one faint side may remain; when growing
    // the grid the card must be complete on the faint edges too, which keeps
    // out rows that fade out under a scroll viewport.
    const faint = assessAt(
      ctx.faintEdges(),
      p.left,
      p.top,
      p.right,
      p.bottom,
      radius,
    );
    if (lenient ? !supported(faint, 1.15) : faint.quality < minQuality) return null;
    c = { ...faint, quality: latticeBackedQuality(faint) * 0.85 };
  } else if (c.quality < minQuality) {
    c = { ...c, quality: latticeBackedQuality(c) };
  }
  if (!lenient && c.quality < minQuality) return null;
  // Cards of a regular grid share one size and sit where the lattice says.
  // Refinement may still lock onto a stray line (e.g. inside a row that
  // fades out under a scroll viewport), so the result must stay close to
  // the prediction on every side.
  const w = c.right - c.left;
  const h = c.bottom - c.top;
  const drift = radius + 1;
  if (
    Math.abs(w - lat.cw) > Math.max(2, 0.04 * lat.cw) ||
    Math.abs(h - lat.ch) > Math.max(2, 0.04 * lat.ch) ||
    Math.abs(c.left - p.left) > drift ||
    Math.abs(c.right - p.right) > drift ||
    Math.abs(c.top - p.top) > drift ||
    Math.abs(c.bottom - p.bottom) > drift
  ) {
    return null;
  }
  const tolX = Math.max(2, ctx.alignTol * lat.px);
  const tolY = Math.max(2, ctx.alignTol * lat.py);
  return {
    row,
    col,
    left: c.left,
    top: c.top,
    right: c.right,
    bottom: c.bottom,
    quality: c.quality,
    source: "recovered",
    clipped: false,
    misalignment: Math.min(
      1,
      Math.max(
        Math.abs(c.left - p.left) / tolX,
        Math.abs(c.top - p.top) / tolY,
      ),
    ),
  };
}

/**
 * A lattice position cut by the image border: score only the sides that are
 * visible, and keep the visible part of the card.
 */
function tryBorderClipped(
  lat: Lattice,
  row: number,
  col: number,
  ctx: CompletionContext,
): LatticeCard | null {
  const { width: W, height: H } = ctx.edges;
  const p = predicted(lat, row, col);
  const vis = {
    left: Math.max(0, p.left),
    top: Math.max(0, p.top),
    right: Math.min(W - 1, p.right),
    bottom: Math.min(H - 1, p.bottom),
  };
  const vw = vis.right - vis.left;
  const vh = vis.bottom - vis.top;
  if (vw <= 0 || vh <= 0) return null;
  if ((vw * vh) / (lat.cw * lat.ch) < 0.25) return null;
  const iy = Math.max(1, Math.round(0.1 * vh));
  const ix = Math.max(1, Math.round(0.1 * vw));
  const covs: number[] = [];
  if (p.left >= 1)
    covs.push(
      verticalSupport(ctx.edges, p.left, vis.top + iy, vis.bottom - iy),
    );
  if (p.right <= W - 2)
    covs.push(
      verticalSupport(ctx.edges, p.right, vis.top + iy, vis.bottom - iy),
    );
  if (p.top >= 1)
    covs.push(
      horizontalSupport(ctx.edges, p.top, vis.left + ix, vis.right - ix),
    );
  if (p.bottom <= H - 2)
    covs.push(
      horizontalSupport(ctx.edges, p.bottom, vis.left + ix, vis.right - ix),
    );
  if (covs.length < 2) return null;
  const mean = covs.reduce((a, b) => a + b, 0) / covs.length;
  if (mean < 0.6 || Math.min(...covs) < 0.3) return null;
  return {
    row,
    col,
    ...vis,
    quality: mean * 0.8,
    source: "recovered",
    clipped: true,
    misalignment: 0,
  };
}

/**
 * A card cut by a scroll viewport inside the image: some filtered candidate
 * spans the cell's full width (or height) and shares its top or bottom (left
 * or right) border, but is shorter than a card.
 */
function tryViewportClipped(
  lat: Lattice,
  row: number,
  col: number,
  ctx: CompletionContext,
): LatticeCard | null {
  const p = predicted(lat, row, col);
  const tolX = Math.max(2, ctx.alignTol * lat.px * 0.5);
  const tolY = Math.max(2, ctx.alignTol * lat.py * 0.5);
  let best: Candidate | null = null;
  for (const c of ctx.candidates) {
    if (c.quality < 0.45) continue;
    const w = c.right - c.left;
    const h = c.bottom - c.top;
    const sameCols =
      Math.abs(c.left - p.left) <= tolX && Math.abs(c.right - p.right) <= tolX;
    const sameRows =
      Math.abs(c.top - p.top) <= tolY && Math.abs(c.bottom - p.bottom) <= tolY;
    const clippedV =
      sameCols &&
      h >= 0.12 * lat.ch &&
      h <= 0.92 * lat.ch &&
      (Math.abs(c.top - p.top) <= tolY ||
        Math.abs(c.bottom - p.bottom) <= tolY);
    const clippedH =
      sameRows &&
      w >= 0.12 * lat.cw &&
      w <= 0.92 * lat.cw &&
      (Math.abs(c.left - p.left) <= tolX ||
        Math.abs(c.right - p.right) <= tolX);
    if (!clippedV && !clippedH) continue;
    if (!best || c.quality > best.quality) best = c;
  }
  if (!best) return null;
  return {
    row,
    col,
    left: best.left,
    top: best.top,
    right: best.right,
    bottom: best.bottom,
    quality: best.quality * 0.8,
    source: "detected",
    clipped: true,
    misalignment: 0,
  };
}

function insideImage(
  lat: Lattice,
  row: number,
  col: number,
  e: EdgeMaps,
): boolean {
  const p = predicted(lat, row, col);
  return (
    p.left >= 1 &&
    p.top >= 1 &&
    p.right <= e.width - 2 &&
    p.bottom <= e.height - 2
  );
}

function overlapsImage(
  lat: Lattice,
  row: number,
  col: number,
  e: EdgeMaps,
): boolean {
  const p = predicted(lat, row, col);
  return (
    p.right > 0 && p.bottom > 0 && p.left < e.width - 1 && p.top < e.height - 1
  );
}

/**
 * Grid reconstruction: fill holes inside the grid, grow it while the image
 * confirms further rows/columns, and attach clipped cards at its border.
 * Positions without evidence stay empty — they are never invented.
 */
export function completeLattice(lat: Lattice, ctx: CompletionContext): void {
  if (lat.cards.length === 0) return;
  const occupied = new Set(lat.cards.map((c) => `${c.row},${c.col}`));
  const add = (card: LatticeCard | null) => {
    if (!card) return false;
    lat.cards.push(card);
    occupied.add(`${card.row},${card.col}`);
    return true;
  };
  const attempt = (
    row: number,
    col: number,
    minQuality: number,
    lenient = false,
  ): boolean => {
    if (occupied.has(`${row},${col}`)) return false;
    if (!overlapsImage(lat, row, col, ctx.edges)) return false;
    if (insideImage(lat, row, col, ctx.edges)) {
      if (
        ctx.recover &&
        add(tryFullCard(lat, row, col, ctx, minQuality, lenient))
      )
        return true;
      return ctx.includeClipped && add(tryViewportClipped(lat, row, col, ctx));
    }
    return ctx.includeClipped && add(tryBorderClipped(lat, row, col, ctx));
  };

  // 1. Holes inside the current extent.
  let ext = extent(lat);
  for (let r = ext.rMin; r <= ext.rMax; r++) {
    for (let c = ext.cMin; c <= ext.cMax; c++)
      attempt(r, c, ctx.recoverQuality, true);
  }

  // 2. Grow outward one row/column at a time while the image confirms new
  //    cards. A direction stops when nothing new is found, or when the new
  //    row/column consists only of clipped cards (nothing lies beyond them).
  //    A new row has no directly detected cards at all, so its cards must be
  //    about as convincing as the grid's own: a row fading out under a
  //    scroll viewport only ever reaches borderline quality.
  const detectedQualities = lat.cards
    .filter((c) => c.source === "detected" && !c.clipped)
    .map((c) => c.quality);
  const growQuality = Math.max(
    ctx.extendQuality,
    detectedQualities.length ? 0.8 * median(detectedQualities) : 0,
  );
  const open = { up: true, down: true, left: true, right: true };
  const onlyClipped = (pred: (c: LatticeCard) => boolean) => {
    const cards = lat.cards.filter(pred);
    return cards.length > 0 && cards.every((c) => c.clipped);
  };
  for (
    let iter = 0;
    iter < 64 && (open.up || open.down || open.left || open.right);
    iter++
  ) {
    ext = extent(lat);
    if (open.up) {
      let grew = false;
      for (let c = ext.cMin; c <= ext.cMax; c++)
        grew = attempt(ext.rMin - 1, c, growQuality) || grew;
      if (!grew || onlyClipped((card) => card.row === ext.rMin - 1))
        open.up = false;
    }
    if (open.down) {
      let grew = false;
      for (let c = ext.cMin; c <= ext.cMax; c++)
        grew = attempt(ext.rMax + 1, c, growQuality) || grew;
      if (!grew || onlyClipped((card) => card.row === ext.rMax + 1))
        open.down = false;
    }
    if (open.left) {
      let grew = false;
      for (let r = ext.rMin; r <= ext.rMax; r++)
        grew = attempt(r, ext.cMin - 1, growQuality) || grew;
      if (!grew || onlyClipped((card) => card.col === ext.cMin - 1))
        open.left = false;
    }
    if (open.right) {
      let grew = false;
      for (let r = ext.rMin; r <= ext.rMax; r++)
        grew = attempt(r, ext.cMax + 1, growQuality) || grew;
      if (!grew || onlyClipped((card) => card.col === ext.cMax + 1))
        open.right = false;
    }
  }

  // 3. Holes created by growth (e.g. the corner of a newly added row).
  ext = extent(lat);
  for (let r = ext.rMin; r <= ext.rMax; r++) {
    for (let c = ext.cMin; c <= ext.cMax; c++)
      attempt(r, c, ctx.recoverQuality, true);
  }

  snapOutliersToLattice(lat, ctx.edges);
}

/**
 * Cards of one grid share a size. A detection that is noticeably larger or
 * smaller than the grid's card (a selection frame around the card, a badge
 * extending its top edge) is replaced by the lattice box, nudged by at most a
 * pixel or two onto the nearest borders.
 */
function snapOutliersToLattice(lat: Lattice, e: EdgeMaps): void {
  const tolW = Math.max(2, 0.04 * lat.cw);
  const tolH = Math.max(2, 0.04 * lat.ch);
  for (const card of lat.cards) {
    if (card.clipped) continue;
    const w = card.right - card.left;
    const h = card.bottom - card.top;
    if (Math.abs(w - lat.cw) <= tolW && Math.abs(h - lat.ch) <= tolH) continue;
    const p = predicted(lat, card.row, card.col);
    const r = refineRect(e, p.left, p.top, p.right, p.bottom, 2);
    card.left = r.left;
    card.top = r.top;
    card.right = r.right;
    card.bottom = r.bottom;
  }
}
