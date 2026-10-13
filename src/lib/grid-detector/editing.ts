/**
 * Manual correction of detection results: add missed cards, remove false
 * positives, adjust boundaries — with undo/redo and reset. Pure functions so
 * the UI stays thin and the logic is unit-testable.
 *
 * All rectangles are original-image pixels.
 */
import type { DetectedCard, DetectedGrid, GridSlot, PixelRect } from "./types";

export const MANUAL_GRID_ID = "manual";

function median(values: number[]): number {
  if (values.length === 0) return NaN;
  const s = [...values].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Clamps a rectangle to the image and rounds it to whole pixels. */
export function clampRect(rect: PixelRect, imageWidth: number, imageHeight: number): PixelRect {
  const x0 = Math.max(0, Math.min(imageWidth - 1, Math.round(Math.min(rect.x, rect.x + rect.width))));
  const y0 = Math.max(0, Math.min(imageHeight - 1, Math.round(Math.min(rect.y, rect.y + rect.height))));
  const x1 = Math.max(x0 + 1, Math.min(imageWidth, Math.round(Math.max(rect.x, rect.x + rect.width))));
  const y1 = Math.max(y0 + 1, Math.min(imageHeight, Math.round(Math.max(rect.y, rect.y + rect.height))));
  return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
}

/** Lattice origin implied by the cards that have row/column assignments. */
function latticeOrigin(grid: DetectedGrid): { x0: number; y0: number } | null {
  const placed = grid.cards.filter((c) => c.row !== null && c.column !== null && !c.clipped);
  if (placed.length === 0) return null;
  return {
    x0: median(placed.map((c) => c.x - (c.column as number) * grid.pitchX)),
    y0: median(placed.map((c) => c.y - (c.row as number) * grid.pitchY)),
  };
}

/** Row/column for a rectangle if it sits on the grid's lattice, else null. */
export function latticePosition(
  grid: DetectedGrid,
  rect: PixelRect,
  tolerance = 0.25,
): { row: number; column: number } | null {
  const o = latticeOrigin(grid);
  if (!o || grid.pitchX <= 0 || grid.pitchY <= 0) return null;
  const column = Math.round((rect.x - o.x0) / grid.pitchX);
  const row = Math.round((rect.y - o.y0) / grid.pitchY);
  const dx = Math.abs(rect.x - (o.x0 + column * grid.pitchX));
  const dy = Math.abs(rect.y - (o.y0 + row * grid.pitchY));
  const sizeOk =
    Math.abs(rect.width - grid.cardWidth) <= 0.35 * grid.cardWidth &&
    Math.abs(rect.height - grid.cardHeight) <= 0.35 * grid.cardHeight;
  if (dx > tolerance * grid.pitchX || dy > tolerance * grid.pitchY || !sizeOk) return null;
  return { row, column };
}

/**
 * Recomputes a grid's derived fields after edits: zero-based row/column
 * indices, row/column counts, bounds, card ids and empty slots.
 */
export function normalizeGrid(grid: DetectedGrid): DetectedGrid {
  if (grid.cards.length === 0) return { ...grid, rows: 0, columns: 0, emptySlots: [] };
  const placed = grid.cards.filter((c) => c.row !== null && c.column !== null);
  const rMin = placed.length ? Math.min(...placed.map((c) => c.row as number)) : 0;
  const cMin = placed.length ? Math.min(...placed.map((c) => c.column as number)) : 0;
  const cards = grid.cards
    .map((c) =>
      c.row !== null && c.column !== null
        ? { ...c, row: c.row - rMin, column: c.column - cMin }
        : c,
    )
    .sort(
      (a, b) =>
        (a.row ?? Infinity) - (b.row ?? Infinity) ||
        (a.column ?? Infinity) - (b.column ?? Infinity) ||
        a.y - b.y ||
        a.x - b.x,
    );
  const rows = placed.length ? Math.max(...cards.map((c) => c.row ?? 0)) + 1 : 0;
  const columns = placed.length ? Math.max(...cards.map((c) => c.column ?? 0)) + 1 : 0;

  const x0 = Math.min(...cards.map((c) => c.x));
  const y0 = Math.min(...cards.map((c) => c.y));
  const x1 = Math.max(...cards.map((c) => c.x + c.width));
  const y1 = Math.max(...cards.map((c) => c.y + c.height));

  const normalized: DetectedGrid = {
    ...grid,
    cards,
    rows,
    columns,
    bounds: { x: x0, y: y0, width: x1 - x0, height: y1 - y0 },
  };

  const emptySlots: GridSlot[] = [];
  const origin = latticeOrigin(normalized);
  if (origin) {
    const occupied = new Set(cards.map((c) => `${c.row},${c.column}`));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        if (occupied.has(`${r},${c}`)) continue;
        emptySlots.push({
          row: r,
          column: c,
          x: Math.round(origin.x0 + c * grid.pitchX),
          y: Math.round(origin.y0 + r * grid.pitchY),
          width: grid.cardWidth,
          height: grid.cardHeight,
        });
      }
    }
  }
  normalized.emptySlots = emptySlots;
  return normalized;
}

let manualCounter = 0;
function manualId(): string {
  manualCounter += 1;
  return `manual-${Date.now().toString(36)}-${manualCounter}`;
}

export type CardEdit =
  | { type: "add"; rect: PixelRect }
  | { type: "remove"; cardId: string }
  | { type: "update"; cardId: string; rect: PixelRect };

/** Applies one edit and returns new grids (inputs are never mutated). */
export function applyCardEdit(
  grids: DetectedGrid[],
  edit: CardEdit,
  imageWidth: number,
  imageHeight: number,
): DetectedGrid[] {
  if (edit.type === "remove") {
    return grids
      .map((g) =>
        g.cards.some((c) => c.id === edit.cardId)
          ? normalizeGrid({ ...g, cards: g.cards.filter((c) => c.id !== edit.cardId) })
          : g,
      )
      .filter((g) => g.cards.length > 0);
  }

  const rect = clampRect(edit.rect, imageWidth, imageHeight);

  if (edit.type === "update") {
    return grids.map((g) => {
      if (!g.cards.some((c) => c.id === edit.cardId)) return g;
      const cards = g.cards.map((c) =>
        c.id === edit.cardId
          ? { ...c, ...rect, source: "manual" as const, confidence: 1, clipped: false }
          : c,
      );
      return normalizeGrid({ ...g, cards });
    });
  }

  // add: attach to the grid whose lattice it fits best, otherwise to a
  // free-form "manual" grid without row/column assignments.
  let target: DetectedGrid | null = null;
  let position: { row: number; column: number } | null = null;
  for (const g of grids) {
    if (g.id === MANUAL_GRID_ID) continue;
    const pos = latticePosition(g, rect);
    if (pos && !g.cards.some((c) => c.row === pos.row && c.column === pos.column)) {
      target = g;
      position = pos;
      break;
    }
  }
  const card: DetectedCard = {
    id: manualId(),
    ...rect,
    row: position?.row ?? null,
    column: position?.column ?? null,
    confidence: 1,
    source: "manual",
    clipped: false,
  };
  if (target) {
    const t = target;
    return grids.map((g) => (g === t ? normalizeGrid({ ...g, cards: [...g.cards, card] }) : g));
  }
  const manual = grids.find((g) => g.id === MANUAL_GRID_ID);
  if (manual) {
    return grids.map((g) =>
      g === manual ? normalizeGrid({ ...g, cards: [...g.cards, card] }) : g,
    );
  }
  return [
    ...grids,
    normalizeGrid({
      id: MANUAL_GRID_ID,
      bounds: rect,
      rows: 0,
      columns: 0,
      confidence: 1,
      cards: [card],
      cardWidth: rect.width,
      cardHeight: rect.height,
      pitchX: 0,
      pitchY: 0,
      emptySlots: [],
    }),
  ];
}

// ---------------------------------------------------------------------------
// Undo / redo history
// ---------------------------------------------------------------------------

export interface EditorState {
  /** Result of the last automatic detection (target of "reset"). */
  original: DetectedGrid[];
  present: DetectedGrid[];
  past: DetectedGrid[][];
  future: DetectedGrid[][];
}

export type EditorAction =
  | { type: "load"; grids: DetectedGrid[]; original?: DetectedGrid[] }
  | { type: "edit"; edit: CardEdit; imageWidth: number; imageHeight: number }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset" };

const HISTORY_LIMIT = 100;

export function createEditorState(grids: DetectedGrid[] = []): EditorState {
  return { original: grids, present: grids, past: [], future: [] };
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "load":
      return createEditorStateWith(action.grids, action.original ?? action.grids);
    case "edit": {
      const next = applyCardEdit(state.present, action.edit, action.imageWidth, action.imageHeight);
      if (next === state.present) return state;
      return {
        ...state,
        present: next,
        past: [...state.past, state.present].slice(-HISTORY_LIMIT),
        future: [],
      };
    }
    case "undo": {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        ...state,
        present: previous,
        past: state.past.slice(0, -1),
        future: [state.present, ...state.future],
      };
    }
    case "redo": {
      if (state.future.length === 0) return state;
      const [next, ...rest] = state.future;
      return { ...state, present: next, past: [...state.past, state.present], future: rest };
    }
    case "reset":
      if (state.present === state.original) return state;
      return {
        ...state,
        present: state.original,
        past: [...state.past, state.present].slice(-HISTORY_LIMIT),
        future: [],
      };
  }
}

function createEditorStateWith(present: DetectedGrid[], original: DetectedGrid[]): EditorState {
  return { original, present, past: [], future: [] };
}

export function countCards(grids: DetectedGrid[]): number {
  return grids.reduce((s, g) => s + g.cards.length, 0);
}

export function findCard(
  grids: DetectedGrid[],
  cardId: string | null,
): { grid: DetectedGrid; card: DetectedCard } | null {
  if (!cardId) return null;
  for (const grid of grids) {
    const card = grid.cards.find((c) => c.id === cardId);
    if (card) return { grid, card };
  }
  return null;
}
