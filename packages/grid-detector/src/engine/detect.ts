/**
 * Inventory grid detection pipeline.
 *
 *   1. validate & normalise   (image.ts)
 *   2. edge extraction        (edges.ts)
 *   3. candidate rectangles   (candidates.ts)
 *   4. filter & deduplicate   (filter.ts)
 *   5. size clustering        (cluster.ts)
 *   6. rows/columns + 7. grid reconstruction (lattice.ts, resolve.ts)
 *   8. confidence + 9. serialisation          (serialize.ts)
 *
 * Pure TypeScript over typed arrays: runs unchanged in the browser main
 * thread, in a Web Worker and in Node (tests). Deterministic for a given
 * input and settings.
 */
import type {
  DetectionSettings,
  GridDetectionResult,
  PixelRect,
} from "../types";
import { resolveDetectionSettings } from "../settings";
import { generateCandidates } from "./candidates";
import { clusterBySize } from "./cluster";
import { computeEdgeMaps, type EdgeMaps, withThreshold } from "./edges";
import { GridDetectionError, toGridDetectionError } from "./errors";
import { filterCandidates } from "./filter";
import {
  computeAnalysisSize,
  type CoordinateFrame,
  denoise,
  type RgbaImage,
  resampleToPlanar,
  validateRgbaImage,
} from "./image";
import { completeLattice, fitLattices, type Lattice } from "./lattice";
import { handleClippedExtensions, resolveLattices } from "./resolve";
import { serializeLattices } from "./serialize";

export interface DetectionInput {
  /** Pixels to analyse. */
  image: RgbaImage;
  /**
   * Set when `image` is an already-downscaled rendering of (a region of) the
   * original — e.g. drawn by the browser onto an OffscreenCanvas. Results are
   * mapped back to `width × height` original pixels.
   */
  source?: { width: number; height: number; region?: PixelRect };
}

const now = () =>
  typeof performance !== "undefined" ? performance.now() : Date.now();

function clipRegion(region: PixelRect | null, w: number, h: number): PixelRect {
  if (!region) return { x: 0, y: 0, width: w, height: h };
  const x = Math.max(0, Math.min(w, region.x));
  const y = Math.max(0, Math.min(h, region.y));
  const x1 = Math.max(0, Math.min(w, region.x + region.width));
  const y1 = Math.max(0, Math.min(h, region.y + region.height));
  if (x1 - x < 16 || y1 - y < 16) {
    throw new GridDetectionError(
      "INVALID_REGION",
      "The selected region is empty or too small to analyse.",
    );
  }
  return { x, y, width: x1 - x, height: y1 - y };
}

function runStage<T>(
  name: string,
  timings: Record<string, number>,
  fn: () => T,
): T {
  const t0 = now();
  try {
    return fn();
  } catch (err) {
    throw toGridDetectionError(err, `Grid detection failed during ${name}.`);
  } finally {
    timings[name] = Math.round((now() - t0) * 10) / 10;
  }
}

export function detectInventoryGrids(
  input: DetectionInput,
  partialSettings: Partial<DetectionSettings> = {},
): GridDetectionResult {
  const started = now();
  const settings = resolveDetectionSettings(partialSettings);
  const timings: Record<string, number> = {};

  // ── 1. Validation & normalisation ─────────────────────────────────────────
  const { planar, frame } = runStage("normalize", timings, () => {
    validateRgbaImage(input.image);
    const img = input.image;
    let frame: CoordinateFrame;
    let region: PixelRect;
    if (input.source) {
      // Pre-scaled input: the image depicts `source.region` of the original.
      const srcRegion = input.source.region ?? {
        x: 0,
        y: 0,
        width: input.source.width,
        height: input.source.height,
      };
      region = { x: 0, y: 0, width: img.width, height: img.height };
      const size = computeAnalysisSize(
        img.width,
        img.height,
        settings.maxAnalysisSide,
      );
      frame = {
        sourceWidth: input.source.width,
        sourceHeight: input.source.height,
        region: srcRegion,
        scaleX: (img.width / srcRegion.width) * size.scale,
        scaleY: (img.height / srcRegion.height) * size.scale,
      };
      const planar = resampleToPlanar(img, region, size.width, size.height);
      denoise(planar);
      return { planar, frame };
    }
    region = clipRegion(settings.region, img.width, img.height);
    const size = computeAnalysisSize(
      region.width,
      region.height,
      settings.maxAnalysisSide,
    );
    frame = {
      sourceWidth: img.width,
      sourceHeight: img.height,
      region,
      scaleX: size.width / region.width,
      scaleY: size.height / region.height,
    };
    const planar = resampleToPlanar(img, region, size.width, size.height);
    denoise(planar);
    return { planar, frame };
  });

  const scale = Math.min(frame.scaleX, frame.scaleY);
  const aw = planar.width;
  const ah = planar.height;
  const limits = {
    minW: Math.max(8, settings.minCardSize * scale),
    minH: Math.max(8, settings.minCardSize * scale),
    maxW: Math.max(10, settings.maxCardSizeRatio * aw),
    maxH: Math.max(10, settings.maxCardSizeRatio * ah),
    minAspect: settings.minAspectRatio,
    maxAspect: settings.maxAspectRatio,
  };
  // Sensitivity also relaxes how much border evidence a card needs.
  const minQuality = 0.55 - 0.2 * (settings.sensitivity - 0.5);

  // ── 2. Edges ──────────────────────────────────────────────────────────────
  const edges = runStage("edges", timings, () =>
    computeEdgeMaps(planar, settings.sensitivity),
  );

  // ── 3. Candidates ─────────────────────────────────────────────────────────
  const generated = runStage("candidates", timings, () =>
    generateCandidates(edges, limits),
  );

  // ── 4. Filtering & deduplication ──────────────────────────────────────────
  const filtered = runStage("filter", timings, () =>
    filterCandidates(generated.candidates, edges, minQuality),
  );

  // ── 5. Size clustering ────────────────────────────────────────────────────
  const clusters = runStage("cluster", timings, () =>
    clusterBySize(filtered, settings.sizeTolerance),
  );

  // ── 6/7. Lattices, recovery and arbitration ───────────────────────────────
  const lattices = runStage("lattice", timings, () => {
    const all: Lattice[] = [];
    for (const cluster of clusters) {
      all.push(...fitLattices(cluster.members, settings.alignmentTolerance));
    }
    let faint: EdgeMaps | null = null;
    const ctx = {
      edges,
      faintEdges: () =>
        (faint ??= withThreshold(edges, Math.max(2.5, edges.threshold * 0.5))),
      candidates: filtered,
      recover: settings.recoverMissedCards,
      includeClipped: settings.includeClippedCards,
      recoverQuality: Math.max(0.3, minQuality - 0.15),
      extendQuality: minQuality,
      sizeTolerance: settings.sizeTolerance,
      alignTol: settings.alignmentTolerance,
    };
    const imageArea = aw * ah;
    // Only complete plausible hypotheses: completing every icon fragment
    // cluster would be wasted work.
    const first = resolveLattices(all, imageArea);
    for (const lat of first) completeLattice(lat, ctx);
    return handleClippedExtensions(
      resolveLattices(first, imageArea),
      settings.includeClippedCards,
    );
  });

  // ── 8/9. Confidence & serialisation ───────────────────────────────────────
  const grids = runStage("serialize", timings, () =>
    serializeLattices(lattices, frame, settings.minConfidence),
  );

  const totalDetectedCards = grids.reduce((s, g) => s + g.cards.length, 0);
  const warnings: string[] = [];
  if (grids.length === 0) {
    warnings.push(
      "No reliable inventory grid was found. Try raising the sensitivity, lowering the minimum card size, or selecting the grid region.",
    );
  }

  return {
    imageWidth: frame.sourceWidth,
    imageHeight: frame.sourceHeight,
    grids,
    totalDetectedCards,
    processingTimeMs: Math.round((now() - started) * 10) / 10,
    warnings,
    settings,
    diagnostics: {
      analysisWidth: aw,
      analysisHeight: ah,
      analysisScale: Math.round(scale * 10000) / 10000,
      edgeThreshold: Math.round(edges.threshold * 100) / 100,
      segmentCount: generated.segmentCount,
      rawCandidateCount: generated.candidates.length,
      filteredCandidateCount: filtered.length,
      sizeClusterCount: clusters.length,
      stageTimingsMs: timings,
    },
  };
}
