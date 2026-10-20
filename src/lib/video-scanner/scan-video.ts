/**
 * Scanning a screen recording of the inventory, on-device.
 *
 *   1. Analyse: sample the video every ~0.2 s into tiny grayscale thumbnails
 *      and pick the frames where scrolling settles (`KeyframePicker`).
 *   2. Scan: each picked frame goes through the regular screenshot scanner
 *      (grid detection + recognition in a Web Worker, several in parallel)
 *      while the analysis continues on a second <video> element. Once a
 *      frame shows a clear grid, later frames only search its columns.
 *   3. Fill gaps: neighbouring scanned frames that share no material may have
 *      skipped rows, so frames between them are scanned until they overlap.
 *   4. Merge: one entry per material, quantities voted over all frames.
 *      Weapons and artifacts repeat, so their rows are stitched in time
 *      order instead (lib/scan-equipment.ts), and the frames that gave the
 *      final readings are decoded once more to crop those cards.
 *
 * A frame that shows an artifact's detail panel (tapping through artifacts)
 * has it read too (lib/artifact-panel): the reading is attached to the card
 * it describes before stitching. A panel that looks like one already read
 * isn't read again, so a recording that dwells on an artifact costs one
 * read, and an artifact seen only in its panel is kept once.
 */
import type { ArtifactPanelReading } from "../artifact-panel/read";
import type { ArtifactPanelScan } from "../artifact-panel/types";
import { signatureDifference } from "../artifact-panel/engine/capture";
import { cropToBlob } from "../grid-detector/browser";
import type { DetectedGrid, PixelRect } from "../grid-detector/types";
import type { MaterialScanClient } from "../material-detector/client";
import { isMaterialDetectionError } from "../material-detector/engine/errors";
import type {
  CardRecognition,
  MoraReading,
  ScanResult,
} from "../material-detector/types";
import {
  KeyframePicker,
  planGapFills,
  probeInterval,
  probeTimes,
  type CoverageFrame,
} from "./keyframes";
import { SightingMerger, sightingKey } from "./merge";
import {
  EQUIPMENT_KINDS,
  EquipmentStitcher,
  attachPanel,
  equipmentRows,
  panelArtBox,
  uniqueByItem,
  uniquePanels,
  type EquipmentKind,
  type EquipmentSighting,
} from "@/lib/scanner/equipment";
import {
  encodePreview,
  validateVideoFile,
  VideoFrameSource,
  VideoScanError,
} from "./video";

import {
  ANALYSIS_PROGRESS_SHARE,
  MAX_SCANNED_FRAMES,
  MIN_LOCK_CARDS,
  SAME_PANEL_DIFFERENCE,
} from "./constants/video.constants";
import type {
  VideoEquipment,
  VideoFrameEvent,
  VideoMaterial,
  VideoScanOptions,
  VideoScanProgress,
  VideoScanResult,
  VideoScanStage,
} from "./types/video.types";

export { MAX_SCANNED_FRAMES };
export type {
  VideoEquipment,
  VideoFrameEvent,
  VideoMaterial,
  VideoScanOptions,
  VideoScanProgress,
  VideoScanResult,
  VideoScanStage,
};

interface GrabbedFrame {
  index: number;
  time: number;
  bitmap: ImageBitmap;
}

const now = () =>
  typeof performance !== "undefined" ? performance.now() : Date.now();
const cancelled = () =>
  new VideoScanError("CANCELLED", "Scanning was cancelled.");
/** Share of the progress bar given to the motion analysis. */
const ANALYSIS_SHARE = ANALYSIS_PROGRESS_SHARE;
/** Panels whose thumbnails differ less than this (0-255) are the same panel: read once. */
const SAME_PANEL = SAME_PANEL_DIFFERENCE;

/**
 * Scans a recording with one or more scan clients (one worker each; frames
 * are spread over them).
 */
export async function scanVideo(
  file: Blob,
  clients: MaterialScanClient | readonly MaterialScanClient[],
  options: VideoScanOptions = {},
): Promise<VideoScanResult> {
  const t0 = now();
  const { onProgress, onFrame, onOpen } = options;
  const pool = Array.isArray(clients)
    ? clients
    : [clients as MaterialScanClient];
  if (pool.length === 0)
    throw new Error("scanVideo needs at least one scan client.");
  validateVideoFile({
    type: file.type,
    size: file.size,
    name: file instanceof File ? file.name : undefined,
  });

  // One controller for every task: a fatal error in one stops the others.
  const controller = new AbortController();
  const outer = options.signal;
  const onOuterAbort = () => controller.abort();
  if (outer?.aborted) throw cancelled();
  outer?.addEventListener("abort", onOuterAbort, { once: true });
  const signal = controller.signal;

  const url = URL.createObjectURL(file);
  let probe: VideoFrameSource | null = null;
  let reader: VideoFrameSource | null = null;
  try {
    onProgress?.({
      stage: "opening",
      fraction: 0,
      duration: 0,
      analysedTo: 0,
      framesScanned: 0,
      framesPicked: 0,
    });
    // The analysis and the scanners each seek their own element, so they run side by side.
    probe = await VideoFrameSource.open(url, signal);
    reader = await VideoFrameSource.open(url, signal);
    const { duration, width, height } = probe;
    onOpen?.({ duration, width, height });

    const times = probeTimes(duration, probeInterval(duration));
    const picker = new KeyframePicker(options.keyframes);
    const merger = new SightingMerger();
    const crops = new Map<string, Blob | null>();
    /** Latest crop request per (material, quantity); older encodes that finish late are dropped. */
    const cropVersions = new Map<string, number>();
    const pendingCrops: Promise<void>[] = [];
    const coverage: CoverageFrame[] = [];
    /** Weapon and artifact rows per scanned frame, stitched once every frame is in. */
    const equipmentFrames: {
      time: number;
      rows: Record<EquipmentKind, EquipmentSighting[][]>;
    }[] = [];
    /** Artifacts seen only in a panel, with the time of their frame. */
    const panelOnly: { time: number; sighting: EquipmentSighting }[] = [];
    /** Panels read so far, by thumbnail: a frame showing the same panel reuses the reading. */
    const panelReads: {
      signature: Uint8Array;
      reading: Promise<ArtifactPanelReading | null>;
    }[] = [];
    let panelFailure: unknown = null;
    const readPanel =
      options.readPanel ??
      (async (scan: ArtifactPanelScan) =>
        (await import("../artifact-panel/browser")).readPanel(scan));
    const panelReading = (scan: ArtifactPanelScan) => {
      const known = panelReads.find(
        (p) => signatureDifference(p.signature, scan.signature) < SAME_PANEL,
      );
      if (known) return known.reading;
      const reading = readPanel(scan);
      panelReads.push({ signature: scan.signature, reading });
      return reading;
    };
    /** Picked frames that left the queue (grabbed, scanning or scanned). */
    const taken = new Set<number>();
    const queue: number[] = [];
    /** Grabbed frames waiting for a free scanner. */
    const ready: GrabbedFrame[] = [];
    let picked = 0;
    let completed = 0;
    let scanning = 0;
    let frameNo = 0;
    let analysedTo = 0;
    let analysisDone = false;
    /** No more frames will be grabbed. */
    let grabbingDone = false;
    let failedFrames = 0;
    let cardsRead = 0;
    let unknownCards = 0;
    let fraction = 0;
    let fatal: unknown = null;
    /** Columns of the inventory, once a frame has shown them clearly. */
    let gridRegion: PixelRect | null = null;
    /** Highest-confidence Mora count read from the bag header over all frames. */
    const moraRef: { current: MoraReading | null } = { current: null };
    let moraCropPromise: Promise<Blob | null> | null = null;

    let waiters: (() => void)[] = [];
    const notify = () => {
      const w = waiters;
      waiters = [];
      w.forEach((resolve) => resolve());
    };
    const changed = () => new Promise<void>((resolve) => waiters.push(resolve));
    // Wake every waiting task so it sees the abort and stops.
    signal.addEventListener("abort", notify, { once: true });

    const report = () => {
      const analysed = analysisDone
        ? 1
        : times.length > 1
          ? analysedTo / times[times.length - 1]
          : 0;
      // Until the analysis ends, extrapolate how many frames will be picked.
      const expected = analysisDone
        ? picked
        : Math.max(picked, picked / Math.max(analysed, 0.05));
      const scanShare = expected > 0 ? completed / expected : 0;
      fraction = Math.max(
        fraction,
        Math.min(
          0.99,
          ANALYSIS_SHARE * analysed + (1 - ANALYSIS_SHARE) * scanShare,
        ),
      );
      onProgress?.({
        stage: "scanning",
        fraction,
        duration,
        analysedTo,
        framesScanned: completed,
        framesPicked: picked,
      });
    };
    const enqueue = (index: number) => {
      if (taken.has(index) || queue.includes(index)) return;
      queue.push(index);
      picked++;
      onFrame?.({
        id: index,
        time: picker.samples[index].time,
        status: "queued",
      });
      notify();
    };
    const fail = (err: unknown) => {
      fatal ??= err;
      controller.abort();
    };

    const analyse = async () => {
      try {
        for (const t of times) {
          if (signal.aborted) return;
          await probe!.seek(t, signal);
          const pick = picker.push(t, probe!.thumbnail());
          analysedTo = t;
          if (pick !== null) enqueue(pick);
          report();
        }
        const last = picker.finish();
        if (last !== null) enqueue(last);
      } catch (err) {
        if (!signal.aborted) fail(err);
      } finally {
        analysisDone = true;
        notify();
        report();
      }
    };

    /**
     * Decodes picked frames ahead of the scanners (one per scanner), so a
     * worker never waits for a seek. Once everything is scanned, it queues
     * the frames that close coverage gaps.
     */
    const grabber = async () => {
      try {
        while (!signal.aborted) {
          if (ready.length >= pool.length) {
            await changed();
            continue;
          }
          const index = queue.shift();
          if (index === undefined) {
            // Gaps can only be judged once the analysis and every scan are done.
            if (!analysisDone || scanning > 0 || ready.length > 0) {
              await changed();
              continue;
            }
            if (taken.size >= MAX_SCANNED_FRAMES) break;
            const fills = planGapFills(coverage, picker.samples, taken);
            if (fills.length === 0) break;
            fills.forEach(enqueue);
            continue;
          }
          if (taken.size >= MAX_SCANNED_FRAMES) break;
          taken.add(index);
          const time = picker.samples[index].time;
          await reader!.seek(time, signal);
          const bitmap = await reader!.frame();
          if (signal.aborted) {
            bitmap.close();
            break;
          }
          ready.push({ index, time, bitmap });
          notify();
        }
      } catch (err) {
        if (!signal.aborted) fail(err);
      } finally {
        grabbingDone = true;
        notify();
      }
    };

    const detect = async (
      client: MaterialScanClient,
      bitmap: ImageBitmap,
    ): Promise<ScanResult> => {
      const region = gridRegion;
      const settings = options.settings ?? {};
      if (region) {
        const result = await client.scanFrame(
          bitmap,
          { ...settings, grid: { ...settings.grid, region } },
          { signal },
        );
        if (result.detection.grids.length > 0) return result;
        // Another screen, or the layout changed: look at the whole frame.
      }
      const result = await client.scanFrame(bitmap, settings, { signal });
      gridRegion ??= lockRegion(result.detection.grids, width, height);
      return result;
    };

    const scanOne = async (
      client: MaterialScanClient,
      { index, time, bitmap }: GrabbedFrame,
    ) => {
      const frame = frameNo++;
      try {
        // The worker gets its copy right away; the preview is encoded meanwhile.
        const result = detect(client, bitmap);
        result.catch(() => undefined);
        const preview = await encodePreview(bitmap).catch(() => undefined);
        onFrame?.({ id: index, time, status: "scanning", preview });
        let cards: CardRecognition[];
        let panel: ArtifactPanelScan | null = null;
        try {
          const scanned = await result;
          cards = scanned.recognition.cards;
          panel = scanned.panel ?? null;
          if (
            scanned.recognition.mora &&
            scanned.recognition.mora.value !== null
          ) {
            if (
              !moraRef.current ||
              scanned.recognition.mora.confidence > moraRef.current.confidence
            ) {
              moraRef.current = scanned.recognition.mora;
              moraCropPromise = cropToBlob(
                bitmap,
                scanned.recognition.mora.box,
                "image/webp",
              ).catch(() => null);
            }
          }
        } catch (err) {
          if (signal.aborted) throw cancelled();
          // Without reference data no frame can be recognised.
          if (
            isMaterialDetectionError(err) &&
            err.code.startsWith("REFERENCES_")
          )
            throw err;
          failedFrames++;
          coverage.push({ time, materials: new Set() });
          onFrame?.({ id: index, time, status: "failed" });
          return;
        }

        cardsRead += cards.length;
        unknownCards += cards.filter((c) => !c.material).length;
        for (const s of merger.add(frame, time, cards)) {
          const key = sightingKey(s.card.material!.id, s.card.quantity.value);
          const version = (cropVersions.get(key) ?? 0) + 1;
          cropVersions.set(key, version);
          // The crop is drawn right away; only the encoding finishes later.
          pendingCrops.push(
            cropToBlob(bitmap, s.card.box, "image/webp").then(
              (blob) => {
                if (cropVersions.get(key) === version) crops.set(key, blob);
              },
              () => undefined,
            ),
          );
        }
        const rows = equipmentRows(cards, index);
        if (panel && !panelFailure) {
          try {
            const reading = await panelReading(panel);
            if (reading) {
              const targetKind: EquipmentKind =
                reading.kind === "weapon" ? "weapon" : "artifact";
              const attached = attachPanel(
                rows[targetKind],
                reading,
                panel.highlights,
                index,
                panelArtBox(panel.bounds),
              );
              rows[targetKind] = attached.rows;
              if (attached.standalone)
                panelOnly.push({ time, sighting: attached.standalone });
            }
          } catch (err) {
            if (signal.aborted) throw cancelled();
            // The OCR couldn't start (offline?): keep scanning cards without panels.
            panelFailure = err;
          }
        }
        if (EQUIPMENT_KINDS.some((k) => rows[k].length > 0))
          equipmentFrames.push({ time, rows });
        // Coverage by what the frame shows: materials by id, equipment by item and level
        // (neighbouring frames that share none of these may have skipped rows).
        coverage.push({
          time,
          materials: new Set(
            cards
              .filter((c) => c.status === "matched" && c.material)
              .map((c) =>
                c.kind === "material"
                  ? c.material!.id
                  : `${c.kind}:${c.material!.id}:${c.level?.value ?? "?"}`,
              ),
          ),
        });
        onFrame?.({
          id: index,
          time,
          status: "done",
          cards: cards.map((c) => ({ box: c.box, status: c.status })),
        });
      } finally {
        bitmap.close();
      }
    };

    const scanner = async (client: MaterialScanClient) => {
      try {
        while (!signal.aborted) {
          const frame = ready.shift();
          if (!frame) {
            if (grabbingDone) break;
            await changed();
            continue;
          }
          scanning++;
          // A slot in `ready` is free: let the grabber decode the next frame.
          notify();
          try {
            await scanOne(client, frame);
          } finally {
            scanning--;
            completed++;
            notify();
          }
          report();
        }
      } catch (err) {
        if (!signal.aborted) fail(err);
      }
    };

    try {
      await Promise.all([analyse(), grabber(), ...pool.map(scanner)]);
      await Promise.all(pendingCrops);
    } finally {
      // Frames grabbed but never scanned (after an abort).
      ready.splice(0).forEach((f) => f.bitmap.close());
    }
    if (outer?.aborted) throw cancelled();
    if (fatal) throw fatal;

    const materials = merger.result().map((m) => ({
      ...m,
      crop: crops.get(sightingKey(m.materialId, m.quantity)) ?? null,
    }));
    const equipment = await stitchEquipment(
      equipmentFrames,
      panelOnly,
      reader,
      picker.samples,
      signal,
    );
    onProgress?.({
      stage: "scanning",
      fraction: 1,
      duration,
      analysedTo: duration,
      framesScanned: completed,
      framesPicked: picked,
    });
    const moraCrop = moraCropPromise ? await moraCropPromise : null;
    if (moraRef.current && moraCrop) {
      moraRef.current.crop = moraCrop;
    }
    return {
      duration,
      width,
      height,
      framesAnalysed: picker.samples.length,
      framesScanned: completed,
      failedFrames,
      cardsRead,
      unknownCards,
      panelsRead: panelReads.length,
      materials,
      equipment,
      mora: moraRef.current,
      moraCrop,
      processingTimeMs: Math.round(now() - t0),
    };
  } catch (err) {
    if (outer?.aborted) throw cancelled();
    throw err;
  } finally {
    outer?.removeEventListener("abort", onOuterAbort);
    probe?.dispose();
    reader?.dispose();
    URL.revokeObjectURL(url);
  }
}

/**
 * Stitches the weapon and artifact rows of every scanned frame in time
 * order (artifacts seen only in their panel follow, once each), then
 * decodes each frame that supplied a final reading once more to crop its
 * cards (crops of every card of every frame would be thousands).
 */
async function stitchEquipment(
  frames: {
    time: number;
    rows: Record<EquipmentKind, EquipmentSighting[][]>;
  }[],
  panelOnly: { time: number; sighting: EquipmentSighting }[],
  reader: VideoFrameSource,
  samples: readonly { time: number }[],
  signal: AbortSignal,
): Promise<VideoEquipment[]> {
  const ordered = [...frames].sort((a, b) => a.time - b.time);
  const cards: EquipmentSighting[] = [];
  for (const kind of EQUIPMENT_KINDS) {
    const stitcher = new EquipmentStitcher();
    for (const f of ordered) stitcher.add(f.rows[kind]);
    const stitched = stitcher.result();
    if (kind === "character") {
      cards.push(...uniqueByItem(stitched));
    } else if (kind === "artifact") {
      const alone = [...panelOnly]
        .sort((a, b) => a.time - b.time)
        .map((p) => p.sighting);
      cards.push(...stitched, ...uniquePanels(alone, stitched));
    } else {
      cards.push(...stitched);
    }
  }
  const crops = new Map<EquipmentSighting, Blob | null>();
  const bySource = new Map<number, EquipmentSighting[]>();
  for (const c of cards)
    bySource.set(c.source, [...(bySource.get(c.source) ?? []), c]);
  for (const [source, list] of bySource) {
    if (signal.aborted) throw cancelled();
    await reader.seek(samples[source].time, signal);
    const bitmap = await reader.frame();
    try {
      for (const c of list)
        crops.set(
          c,
          await cropToBlob(bitmap, c.card.box, "image/webp").catch(() => null),
        );
    } finally {
      bitmap.close();
    }
  }
  return cards.map((c) => ({
    ...c,
    time: samples[c.source].time,
    crop: crops.get(c) ?? null,
  }));
}

/**
 * The full-height band of columns holding the detected grids, with half a
 * card of margin, or null when the frame shows no clear grid.
 */
export function lockRegion(
  grids: readonly DetectedGrid[],
  width: number,
  height: number,
): PixelRect | null {
  const cards = grids.reduce((n, g) => n + g.cards.length, 0);
  if (cards < MIN_LOCK_CARDS) return null;
  let x0 = Infinity;
  let x1 = -Infinity;
  for (const g of grids) {
    const margin = g.cardWidth / 2;
    x0 = Math.min(x0, g.bounds.x - margin);
    x1 = Math.max(x1, g.bounds.x + g.bounds.width + margin);
  }
  x0 = Math.max(0, Math.floor(x0));
  x1 = Math.min(width, Math.ceil(x1));
  if (x1 - x0 < width * 0.1) return null;
  return { x: x0, y: 0, width: x1 - x0, height };
}
