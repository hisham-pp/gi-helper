"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Maximize, Minus, Plus, Loader2 } from "lucide-react";
import type { CardEdit, DetectedCard, DetectedGrid, PixelRect } from "@/lib/grid-detector";

export type EditorTool = "select" | "add" | "region";

interface DetectionCanvasProps {
  imageUrl: string | null;
  /** Original image size — the coordinate system of every box. */
  imageWidth: number;
  imageHeight: number;
  grids: DetectedGrid[];
  selectedCardId: string | null;
  onSelectCard: (id: string | null) => void;
  onEdit: (edit: CardEdit) => void;
  tool: EditorTool;
  region: PixelRect | null;
  onRegionChange: (region: PixelRect | null) => void;
  showEmptySlots: boolean;
  /** Cards at or above this confidence are drawn as "high confidence". */
  highConfidence: number;
  busy: boolean;
  /** Increment to request a fit-to-view (e.g. when a new image is shown). */
  fitRequest: number;
  /** Optional per-card caption (e.g. the recognised material), drawn under the card. */
  cardLabels?: Record<string, CardLabel>;
}

export interface CardLabel {
  text: string;
  color: string;
}

type Handle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

type Drag =
  | { kind: "pan"; startX: number; startY: number; viewX: number; viewY: number; moved: boolean }
  | { kind: "move"; cardId: string; start: Point; rect: PixelRect }
  | { kind: "resize"; cardId: string; handle: Handle; rect: PixelRect }
  | { kind: "draw"; start: Point; tool: "add" | "region" };

interface Point {
  x: number;
  y: number;
}

interface View {
  zoom: number;
  x: number;
  y: number;
}

const COLORS = {
  high: "#34d399",
  low: "#fbbf24",
  manual: "#38bdf8",
  clipped: "#a78bfa",
  selected: "#ffffff",
  empty: "rgba(255,255,255,0.35)",
  region: "#22d3ee",
  draft: "#38bdf8",
};

const HANDLES: Handle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

function normalizeRect(a: Point, b: Point): PixelRect {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(b.x - a.x),
    height: Math.abs(b.y - a.y),
  };
}

function handlePoint(rect: PixelRect, h: Handle): Point {
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  const x = h.includes("w") ? rect.x : h.includes("e") ? rect.x + rect.width : cx;
  const y = h.includes("n") ? rect.y : h.includes("s") ? rect.y + rect.height : cy;
  return { x, y };
}

function resizeRect(rect: PixelRect, h: Handle, p: Point): PixelRect {
  let x0 = rect.x;
  let y0 = rect.y;
  let x1 = rect.x + rect.width;
  let y1 = rect.y + rect.height;
  if (h.includes("w")) x0 = Math.min(p.x, x1 - 2);
  if (h.includes("e")) x1 = Math.max(p.x, x0 + 2);
  if (h.includes("n")) y0 = Math.min(p.y, y1 - 2);
  if (h.includes("s")) y1 = Math.max(p.y, y0 + 2);
  return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
}

const cursorFor: Record<Handle, string> = {
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  nw: "nwse-resize",
  se: "nwse-resize",
};

function cardColor(card: DetectedCard, highConfidence: number): string {
  if (card.source === "manual") return COLORS.manual;
  if (card.clipped) return COLORS.clipped;
  return card.confidence >= highConfidence ? COLORS.high : COLORS.low;
}

export function DetectionCanvas({
  imageUrl,
  imageWidth,
  imageHeight,
  grids,
  selectedCardId,
  onSelectCard,
  onEdit,
  tool,
  region,
  onRegionChange,
  showEmptySlots,
  highConfidence,
  busy,
  fitRequest,
  cardLabels,
}: DetectionCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [view, setView] = useState<View>({ zoom: 1, x: 0, y: 0 });
  const viewRef = useRef(view);
  viewRef.current = view;
  const dragRef = useRef<Drag | null>(null);
  const [draft, setDraft] = useState<{ cardId: string; rect: PixelRect } | null>(null);
  const [drawRect, setDrawRect] = useState<PixelRect | null>(null);

  const fitZoom = useCallback(() => {
    const el = containerRef.current;
    if (!el || imageWidth <= 0 || imageHeight <= 0) return 1;
    return Math.min(el.clientWidth / imageWidth, el.clientHeight / imageHeight) * 0.98;
  }, [imageWidth, imageHeight]);

  const fit = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const zoom = fitZoom();
    setView({
      zoom,
      x: (el.clientWidth - imageWidth * zoom) / 2,
      y: (el.clientHeight - imageHeight * zoom) / 2,
    });
  }, [fitZoom, imageWidth, imageHeight]);

  useLayoutEffect(() => {
    fit();
  }, [fit, fitRequest]);

  // Keep the image fitted when the panel is resized, unless the user zoomed in.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    let lastFit = fitZoom();
    const ro = new ResizeObserver(() => {
      const wasFitted = Math.abs(viewRef.current.zoom - lastFit) < 1e-3;
      lastFit = fitZoom();
      if (wasFitted) fit();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fit, fitZoom]);

  const zoomAt = useCallback(
    (factor: number, clientX?: number, clientY?: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const mx = clientX !== undefined ? clientX - rect.left : rect.width / 2;
      const my = clientY !== undefined ? clientY - rect.top : rect.height / 2;
      setView((v) => {
        const min = fitZoom() * 0.5;
        const zoom = Math.min(16, Math.max(min, v.zoom * factor));
        const k = zoom / v.zoom;
        return { zoom, x: mx - (mx - v.x) * k, y: my - (my - v.y) * k };
      });
    },
    [fitZoom],
  );

  // Ctrl/⌘ + wheel (and trackpad pinch, which browsers report as ctrl+wheel)
  // zooms around the pointer; a plain wheel keeps scrolling the page. This
  // needs a non-passive listener to be able to prevent the browser zoom.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX, e.clientY);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  /** Client coordinates → original-image pixels (exact at any zoom/pan). */
  const toImage = (clientX: number, clientY: number): Point => {
    const el = containerRef.current;
    const v = viewRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(imageWidth, (clientX - rect.left - v.x) / v.zoom)),
      y: Math.max(0, Math.min(imageHeight, (clientY - rect.top - v.y) / v.zoom)),
    };
  };

  const startDrag = (e: React.PointerEvent, drag: Drag) => {
    dragRef.current = drag;
    containerRef.current?.setPointerCapture(e.pointerId);
  };

  const onBackgroundPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.button !== 1) return;
    if (tool === "select" || e.button === 1) {
      const v = viewRef.current;
      startDrag(e, { kind: "pan", startX: e.clientX, startY: e.clientY, viewX: v.x, viewY: v.y, moved: false });
    } else {
      const p = toImage(e.clientX, e.clientY);
      startDrag(e, { kind: "draw", start: p, tool });
      setDrawRect({ x: p.x, y: p.y, width: 0, height: 0 });
    }
  };

  const onCardPointerDown = (e: React.PointerEvent, card: DetectedCard) => {
    if (tool !== "select" || e.button !== 0) return;
    e.stopPropagation();
    onSelectCard(card.id);
    startDrag(e, {
      kind: "move",
      cardId: card.id,
      start: toImage(e.clientX, e.clientY),
      rect: { x: card.x, y: card.y, width: card.width, height: card.height },
    });
  };

  const onHandlePointerDown = (e: React.PointerEvent, card: DetectedCard, handle: Handle) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    startDrag(e, {
      kind: "resize",
      cardId: card.id,
      handle,
      rect: { x: card.x, y: card.y, width: card.width, height: card.height },
    });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    if (drag.kind === "pan") {
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
      setView((v) => ({ ...v, x: drag.viewX + dx, y: drag.viewY + dy }));
      return;
    }
    const p = toImage(e.clientX, e.clientY);
    if (drag.kind === "move") {
      const dx = p.x - drag.start.x;
      const dy = p.y - drag.start.y;
      const x = Math.max(0, Math.min(imageWidth - drag.rect.width, drag.rect.x + dx));
      const y = Math.max(0, Math.min(imageHeight - drag.rect.height, drag.rect.y + dy));
      setDraft({ cardId: drag.cardId, rect: { ...drag.rect, x, y } });
    } else if (drag.kind === "resize") {
      setDraft({ cardId: drag.cardId, rect: resizeRect(drag.rect, drag.handle, p) });
    } else {
      setDrawRect(normalizeRect(drag.start, p));
    }
  };

  const onPointerUp = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    if (drag.kind === "pan") {
      if (!drag.moved) onSelectCard(null);
      return;
    }
    if (drag.kind === "move" || drag.kind === "resize") {
      if (draft && draft.cardId === drag.cardId) {
        const r = draft.rect;
        const o = drag.rect;
        const changed =
          Math.abs(r.x - o.x) >= 0.5 ||
          Math.abs(r.y - o.y) >= 0.5 ||
          Math.abs(r.width - o.width) >= 0.5 ||
          Math.abs(r.height - o.height) >= 0.5;
        if (changed) onEdit({ type: "update", cardId: drag.cardId, rect: r });
      }
      setDraft(null);
      return;
    }
    const rect = drawRect;
    setDrawRect(null);
    if (!rect || rect.width < 4 || rect.height < 4) return;
    if (drag.tool === "add") onEdit({ type: "add", rect });
    else onRegionChange(rect);
  };

  const unit = 1 / view.zoom; // one screen pixel in image pixels
  const handleSize = 9 * unit;

  return (
    <div
      ref={containerRef}
      onPointerDown={onBackgroundPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={`relative h-[62vh] min-h-[320px] w-full touch-none select-none overflow-hidden rounded-3xl border border-white/10 bg-black/60 shadow-2xl ${
        tool === "select" ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"
      }`}
    >
      {imageUrl && (
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: imageWidth,
            height: imageHeight,
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Screenshot being analysed"
            draggable={false}
            width={imageWidth}
            height={imageHeight}
            className="pointer-events-none block max-w-none"
            style={{ width: imageWidth, height: imageHeight }}
          />
          <svg
            className="absolute inset-0 overflow-visible"
            width={imageWidth}
            height={imageHeight}
            viewBox={`0 0 ${imageWidth} ${imageHeight}`}
          >
            {region && (
              <g pointerEvents="none">
                <path
                  fill="rgba(0,0,0,0.45)"
                  fillRule="evenodd"
                  d={`M0 0H${imageWidth}V${imageHeight}H0Z M${region.x} ${region.y}h${region.width}v${region.height}h${-region.width}Z`}
                />
                <rect
                  x={region.x}
                  y={region.y}
                  width={region.width}
                  height={region.height}
                  fill="none"
                  stroke={COLORS.region}
                  strokeWidth={2}
                  strokeDasharray="8 5"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            )}

            {showEmptySlots &&
              grids.flatMap((g) =>
                g.emptySlots.map((s) => (
                  <rect
                    key={`${g.id}-empty-${s.row}-${s.column}`}
                    x={s.x}
                    y={s.y}
                    width={s.width}
                    height={s.height}
                    fill="none"
                    stroke={COLORS.empty}
                    strokeWidth={1}
                    strokeDasharray="3 4"
                    vectorEffect="non-scaling-stroke"
                    pointerEvents="none"
                  />
                )),
              )}

            {grids.flatMap((g) =>
              g.cards.map((card) => {
                const isSelected = card.id === selectedCardId;
                const rect = draft && draft.cardId === card.id ? draft.rect : card;
                const color = isSelected ? COLORS.selected : cardColor(card, highConfidence);
                const low = card.source !== "manual" && card.confidence < highConfidence;
                return (
                  <rect
                    key={card.id}
                    x={rect.x}
                    y={rect.y}
                    width={rect.width}
                    height={rect.height}
                    fill={isSelected ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0)"}
                    stroke={color}
                    strokeWidth={isSelected ? 3 : 2}
                    strokeDasharray={low && !isSelected ? "6 4" : undefined}
                    vectorEffect="non-scaling-stroke"
                    className={tool === "select" ? "cursor-move" : undefined}
                    pointerEvents={tool === "select" ? "all" : "none"}
                    onPointerDown={(e) => onCardPointerDown(e, card)}
                  >
                    <title>
                      {`${card.row !== null ? `Row ${card.row + 1}, column ${(card.column ?? 0) + 1}` : "Unassigned"} · ${Math.round(card.confidence * 100)}% · ${card.source}`}
                    </title>
                  </rect>
                );
              }),
            )}

            {cardLabels &&
              grids.flatMap((g) =>
                g.cards.map((card) => {
                  const label = cardLabels[card.id];
                  if (!label) return null;
                  // Drawn in the gutter under the card so the quantity stays visible.
                  const fontSize = Math.max(8, card.width * 0.075);
                  const h = fontSize * 1.45;
                  return (
                    <g key={`label-${card.id}`} pointerEvents="none">
                      <rect
                        x={card.x}
                        y={card.y + card.height + fontSize * 0.2}
                        width={card.width}
                        height={h}
                        rx={h / 2}
                        fill="rgba(2,6,23,0.82)"
                        stroke={label.color}
                        strokeWidth={1}
                        vectorEffect="non-scaling-stroke"
                      />
                      <text
                        x={card.x + card.width / 2}
                        y={card.y + card.height + fontSize * 0.2 + h / 2}
                        fill={label.color}
                        fontSize={fontSize}
                        fontWeight={700}
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {label.text}
                      </text>
                    </g>
                  );
                }),
              )}

            {(() => {
              if (tool !== "select" || !selectedCardId) return null;
              const card = grids.flatMap((g) => g.cards).find((c) => c.id === selectedCardId);
              if (!card) return null;
              const rect = draft && draft.cardId === card.id ? draft.rect : card;
              return HANDLES.map((h) => {
                const p = handlePoint(rect, h);
                return (
                  <rect
                    key={h}
                    x={p.x - handleSize / 2}
                    y={p.y - handleSize / 2}
                    width={handleSize}
                    height={handleSize}
                    fill={COLORS.selected}
                    stroke="#0f172a"
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                    style={{ cursor: cursorFor[h] }}
                    onPointerDown={(e) => onHandlePointerDown(e, card, h)}
                  />
                );
              });
            })()}

            {drawRect && (
              <rect
                x={drawRect.x}
                y={drawRect.y}
                width={drawRect.width}
                height={drawRect.height}
                fill="rgba(56,189,248,0.12)"
                stroke={tool === "region" ? COLORS.region : COLORS.draft}
                strokeWidth={2}
                strokeDasharray="6 4"
                vectorEffect="non-scaling-stroke"
                pointerEvents="none"
              />
            )}
          </svg>
        </div>
      )}

      {busy && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/70 px-4 py-2 text-xs font-bold text-white">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Detecting cards…
          </div>
        </div>
      )}

      <div
        className="absolute bottom-3 right-3 flex items-center gap-1 rounded-xl border border-white/10 bg-black/70 p-1 text-white"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => zoomAt(1 / 1.25)}
          className="rounded-lg p-1.5 hover:bg-white/10"
          aria-label="Zoom out"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-12 text-center font-mono text-[11px] text-white/80">
          {Math.round(view.zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => zoomAt(1.25)}
          className="rounded-lg p-1.5 hover:bg-white/10"
          aria-label="Zoom in"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={fit}
          className="rounded-lg p-1.5 hover:bg-white/10"
          aria-label="Fit image to view"
        >
          <Maximize className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
