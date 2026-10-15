"use client";

import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Eye, Film, Square, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadZone } from "./UploadZone";
import { LazyScanReviewModal, preloadScanReviewModal } from "./lazy-modals";
import { isMaterialDetectionError, type CardRecognitionStatus } from "@/lib/material-detector";
import { useMaterialScanClient } from "@/lib/material-detector/react";
import {
  isVideoFile,
  isVideoScanError,
  scanVideo,
  type VideoFrameEvent,
  type VideoMaterial,
  type VideoScanProgress,
} from "@/lib/video-scanner";
import type { PixelRect } from "@/lib/grid-detector";
import { useScannerSettings } from "@/lib/scanner-settings";
import { setScannerInventory } from "@/lib/scanner-inventory";
import type { DetectedItem, EquipmentReviewItem, ScannedReviewItem } from "@/lib/types";
import { getOwnedCharacters } from "@/lib/good-inventory";
import {
  equipmentIcon,
  equipmentReviewItem,
  inventoryPageFor,
  ownedTravelerElement,
  saveScannedEquipment,
  type EquipmentConfirm,
} from "./equipment-review";
import { materialThumbUrl } from "@/lib/material-ui";
import { recordScan } from "@/lib/scan-stats";

interface VideoScannerViewProps {
  id?: string;
  ariaLabelledBy?: string;
}

interface VideoSummary {
  duration: number;
  framesScanned: number;
  failedFrames: number;
  materials: number;
  weapons: number;
  artifacts: number;
  characters: number;
  flagged: number;
  seconds: number;
}

interface TimelineFrame {
  id: number;
  time: number;
  status: VideoFrameEvent["status"];
}

interface FrameView {
  id: number;
  time: number;
  previewUrl: string | null;
  cards: { box: PixelRect; status: CardRecognitionStatus }[] | null;
}

const SAMPLE_RECORDING = {
  url: "/samples/test-set-02/Record_2026-10-13-20-40-16_e80eb31669cc7edfbce1531f4d25a535.mp4",
  fileName: "GenshinImpact_Sample_Recording.mp4",
  type: "video/mp4",
};

/** 83.4 → "1:23.4" */
function formatVideoTime(seconds: number): string {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const rest = (s - m * 60).toFixed(1).padStart(4, "0");
  return `${m}:${rest}`;
}

function progressMessage(p: VideoScanProgress, fileName: string): string {
  if (p.stage === "opening") return `Opening ${fileName}…`;
  if (p.analysedTo < p.duration - 0.3) {
    return `Watching ${formatVideoTime(p.analysedTo)} of ${formatVideoTime(p.duration)} · ${p.framesScanned} frame${p.framesScanned === 1 ? "" : "s"} scanned`;
  }
  return p.framesScanned < p.framesPicked
    ? `Scanning frame ${p.framesScanned + 1} of ${p.framesPicked}…`
    : "Checking that every row was covered…";
}

function reviewReason(m: VideoMaterial): string | undefined {
  if (m.status !== "matched") return "Low confidence";
  if (m.quantity === null) return "Quantity unreadable";
  if (m.quantityConflict) return "Frames disagree on quantity";
  if (m.quantityConfidence < 0.5) return "Check quantity";
  return undefined;
}

/**
 * Video Scanner View
 * Scans a screen recording of the inventory on-device: picks the frames where
 * scrolling settles, recognises each with the local scanner and merges them.
 * Results go through the same review modal and inventory as the other tabs.
 */
export function VideoScannerView({ id = "video-panel", ariaLabelledBy = "video-tab" }: VideoScannerViewProps) {
  // Two workers scan frames side by side. Each starts with its first scan (this
  // tab is mounted even when hidden) and loads the references then.
  const client1 = useMaterialScanClient();
  const client2 = useMaterialScanClient();
  const { settings } = useScannerSettings();

  // Once a scan's materials are added, the app switches to the /inventory page
  const router = useRouter();

  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [fileName, setFileName] = useState("");
  const [video, setVideo] = useState<{ duration: number; width: number; height: number } | null>(null);
  const [analysedTo, setAnalysedTo] = useState(0);
  const [timeline, setTimeline] = useState<TimelineFrame[]>([]);
  const [frameView, setFrameView] = useState<FrameView | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [summary, setSummary] = useState<VideoSummary | null>(null);

  const [reviewItems, setReviewItems] = useState<ScannedReviewItem[]>([]);
  const [reviewEquipment, setReviewEquipment] = useState<EquipmentReviewItem[]>([]);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const controllerRef = useRef<AbortController | null>(null);
  /** Object URLs of the current scan's crops, revoked on the next scan or unmount. */
  const urlsRef = useRef<string[]>([]);
  /** Preview URLs of the frames being scanned and of the one on screen. */
  const previewUrlsRef = useRef(new Map<number, string>());
  const shownFrameRef = useRef<number | null>(null);

  const releasePreviews = () => {
    previewUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    previewUrlsRef.current.clear();
    shownFrameRef.current = null;
  };

  useEffect(() => {
    const urls = urlsRef;
    const previews = previewUrlsRef.current;
    return () => {
      controllerRef.current?.abort();
      urls.current.forEach((u) => URL.revokeObjectURL(u));
      previews.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const trackUrl = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    urlsRef.current.push(url);
    return url;
  };

  /**
   * Scanned quantities replace stored ones: a recording shows the current count.
   * Shared with the other tabs: every scanner fills the same inventory.
   */
  const mergeIntoInventory = useCallback((confirmed: DetectedItem[]) => {
    setScannerInventory((prev) => {
      const byId = new Map(prev.map((i) => [i.id, i]));
      for (const item of confirmed) byId.set(item.id, { ...item });
      return [...byId.values()];
    });
  }, []);

  const handleFrame = useCallback((event: VideoFrameEvent) => {
    setTimeline((prev) => {
      const i = prev.findIndex((f) => f.id === event.id);
      const frame = { id: event.id, time: event.time, status: event.status };
      if (i < 0) return [...prev, frame].sort((a, b) => a.time - b.time);
      const next = prev.slice();
      next[i] = frame;
      return next;
    });
    // The viewport shows the last scanned frame with its cards (or the first
    // frame being scanned, until one is done).
    const previews = previewUrlsRef.current;
    const show = (id: number, cards: FrameView["cards"]) => {
      const previous = shownFrameRef.current;
      if (previous !== null && previous !== id) {
        const url = previews.get(previous);
        if (url) URL.revokeObjectURL(url);
        previews.delete(previous);
      }
      shownFrameRef.current = id;
      setFrameView({ id, time: event.time, previewUrl: previews.get(id) ?? null, cards });
    };
    if (event.status === "scanning") {
      if (event.preview) previews.set(event.id, URL.createObjectURL(event.preview));
      if (shownFrameRef.current === null) show(event.id, null);
    } else if (event.status === "done") {
      show(event.id, event.cards ?? []);
    } else if (event.status === "failed" && event.id !== shownFrameRef.current) {
      const url = previews.get(event.id);
      if (url) URL.revokeObjectURL(url);
      previews.delete(event.id);
    }
  }, []);

  const handleFiles = useCallback(
    async (input: FileList | File[]) => {
      const file = Array.from(input).find((f) => isVideoFile(f));
      if (!file) {
        toast.error("Please choose a video file (MP4, WebM or MOV).");
        return;
      }
      if (isScanning) return;

      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      urlsRef.current = [];
      releasePreviews();

      setScanError(null);
      setSummary(null);
      setIsReviewOpen(false);
      // The review modal opens when the scan finishes: fetch its code meanwhile
      preloadScanReviewModal();
      setFileName(file.name);
      setVideo(null);
      setAnalysedTo(0);
      setTimeline([]);
      setFrameView(null);
      setProgress(1);
      setStatusMessage(`Opening ${file.name}…`);
      setIsScanning(true);

      try {
        // A second worker only pays off with cores left for video decoding and the page.
        const pool = (navigator.hardwareConcurrency || 2) >= 4 ? [client1, client2] : [client1];
        const result = await scanVideo(file, pool, {
          signal: controller.signal,
          onOpen: (info) => setVideo(info),
          onFrame: handleFrame,
          onProgress: (p) => {
            setProgress(Math.max(1, Math.round(p.fraction * 100)));
            setAnalysedTo(p.analysedTo);
            setStatusMessage(progressMessage(p, file.name));
          },
        });

        const review: ScannedReviewItem[] = result.materials.map((m) => ({
          id: `video-${m.materialId}`,
          materialId: m.materialId,
          name: m.name,
          rarity: m.rarity,
          quantity: Math.max(1, m.quantity ?? 1),
          imageSnippet: m.crop ? trackUrl(m.crop) : materialThumbUrl(m.materialId),
          sourceImageName: `Frame at ${formatVideoTime(m.best.time)}`,
          candidates: m.candidates.map((c) => ({
            id: c.id,
            name: c.name,
            rarity: c.rarity,
            confidence: Math.round(c.confidence * 100),
          })),
          reviewReason: reviewReason(m),
        }));
        // Slots that need a second look first, then the order they scrolled by.
        review.sort((a, b) => Number(!!b.reviewReason) - Number(!!a.reviewReason));
        const travelerElement = ownedTravelerElement(getOwnedCharacters());
        const equipment = result.equipment.map((e, k) =>
          equipmentReviewItem(
            e,
            `video-${e.kind}-${k}`,
            e.crop ? trackUrl(e.crop) : equipmentIcon(e),
            `Frame at ${formatVideoTime(e.time)}`,
            travelerElement,
          ),
        );
        const weapons = equipment.filter((e) => e.kind === "weapon").length;
        const artifacts = equipment.filter((e) => e.kind === "artifact").length;
        const characters = equipment.filter((e) => e.kind === "character").length;
        const flagged = review.filter((r) => r.reviewReason).length + equipment.filter((e) => e.reviewReason).length;
        setSummary({
          duration: result.duration,
          framesScanned: result.framesScanned,
          failedFrames: result.failedFrames,
          materials: review.length,
          weapons,
          artifacts,
          characters,
          flagged,
          seconds: result.processingTimeMs / 1000,
        });
        setReviewItems(review);
        setReviewEquipment(equipment);

        if (review.length + equipment.length === 0) {
          if (result.failedFrames < result.framesScanned) {
            toast.info(
              result.cardsRead === 0
                ? "No inventory cards were found. Record a bag tab (materials, weapons or artifacts) while scrolling through it."
                : "Nothing in this recording matched our game data.",
            );
          }
          return;
        }
        recordScan("video", [file]);
        // Weapons and artifacts always get a review: their main stats and replace-or-add need a look.
        if (settings.autoReviewResults || equipment.length > 0) {
          setIsReviewOpen(true);
          const parts = [
            review.length > 0 && `${review.length} material${review.length > 1 ? "s" : ""}`,
            weapons > 0 && `${weapons} weapon${weapons > 1 ? "s" : ""}`,
            artifacts > 0 && `${artifacts} artifact${artifacts > 1 ? "s" : ""}`,
            characters > 0 && `${characters} character${characters > 1 ? "s" : ""}`,
          ].filter(Boolean);
          toast.success(
            `Recognised ${parts.join(", ")}` + (flagged ? ` · ${flagged} to check` : "") + ". Please review the results.",
          );
        } else {
          mergeIntoInventory(
            review.map((r) => ({ id: r.materialId, name: r.name, quantity: r.quantity, rarity: r.rarity })),
          );
          toast.success(`Added ${review.length} material${review.length > 1 ? "s" : ""} to your inventory.`);
          router.push("/inventory/materials");
        }
      } catch (err) {
        if (controller.signal.aborted) {
          toast.info("Scan cancelled.");
          return;
        }
        console.error("Video scan failed:", err);
        setScanError(
          isVideoScanError(err) || isMaterialDetectionError(err) ? err.message : "Scanning failed unexpectedly.",
        );
      } finally {
        if (controllerRef.current === controller) controllerRef.current = null;
        setIsScanning(false);
        setProgress(0);
        setStatusMessage("");
        releasePreviews();
        setFrameView(null);
      }
    },
    // trackUrl and releasePreviews only touch refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [client1, client2, isScanning, handleFrame, mergeIntoInventory, router, settings.autoReviewResults],
  );

  const handleConfirmReview = useCallback(
    (confirmed: DetectedItem[], equipment?: EquipmentConfirm) => {
      if (confirmed.length > 0) mergeIntoInventory(confirmed);
      const saved = equipment ? saveScannedEquipment(equipment) : { weapons: 0, artifacts: 0, characters: 0, skipped: 0 };
      if (saved.skipped > 0) toast.info(`${saved.skipped} unidentified card${saved.skipped > 1 ? "s were" : " was"} left out.`);
      setIsReviewOpen(false);
      router.push(inventoryPageFor({ materials: confirmed.length, ...saved }));
    },
    [mergeIntoInventory, router],
  );

  const handleCloseReview = useCallback(() => setIsReviewOpen(false), []);

  const framesScanned = timeline.filter((f) => f.status === "done" || f.status === "failed").length;

  return (
    <div
      id={id}
      role="tabpanel"
      aria-labelledby={ariaLabelledBy}
      tabIndex={0}
      className="pill-tab-panel w-full space-y-4 focus-visible:outline-none"
    >
      {scanError && !isScanning && (
        <div className="on-dark animate-in fade-in slide-in-from-top-2 mx-auto flex w-full max-w-2xl items-start justify-between gap-3 rounded-2xl border border-rose-500/40 bg-rose-950/50 p-3.5 text-xs text-rose-200 shadow-xl backdrop-blur-xl">
          <div className="flex min-w-0 items-start gap-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
            <div className="min-w-0 space-y-0.5">
              <p className="text-xs font-bold text-white">Scan Error</p>
              <p className="break-words text-[11px] leading-relaxed text-rose-200/90">{scanError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setScanError(null)}
            className="shrink-0 rounded-lg p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            title="Dismiss error"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {summary && !isScanning && (
        <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
          <p className="text-[11px] text-white/70 drop-shadow">
            {formatVideoTime(summary.duration)} recording · {summary.framesScanned} frame
            {summary.framesScanned === 1 ? "" : "s"} scanned ·{" "}
            <span className="font-semibold text-white">
              {[
                summary.materials > 0 || summary.weapons + summary.artifacts + summary.characters === 0
                  ? `${summary.materials} materials`
                  : null,
                summary.weapons > 0 ? `${summary.weapons} weapons` : null,
                summary.artifacts > 0 ? `${summary.artifacts} artifacts` : null,
                summary.characters > 0 ? `${summary.characters} characters` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
            {summary.flagged > 0 && <span className="text-amber-200"> · {summary.flagged} to check</span>}
            {summary.failedFrames > 0 && <span className="text-rose-300"> · {summary.failedFrames} frames failed</span>}
            <span className="text-white/50"> · {summary.seconds.toFixed(1)} s</span>
          </p>
          {reviewItems.length + reviewEquipment.length > 0 && (
            <button
              onClick={() => setIsReviewOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-teal-400/30 bg-teal-500/20 px-3.5 py-1 text-xs font-bold text-teal-200 backdrop-blur-md transition-all hover:scale-105 hover:bg-teal-500/30 active:scale-95"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Review Last Scan ({reviewItems.length + reviewEquipment.length})</span>
            </button>
          )}
        </div>
      )}

      <UploadZone
        isScanning={isScanning}
        progress={progress}
        statusMessage={statusMessage}
        activeImageSrc={frameView?.previewUrl ?? null}
        activeFileName={frameView ? `${fileName} · ${formatVideoTime(frameView.time)}` : fileName}
        providerDisplayName="Video scanner"
        modelName="on-device"
        scanEmptyMessage="Reading the recording..."
        onFilesSelected={handleFiles}
        inputId="video-recording-upload"
        accept="video/*,.mp4,.m4v,.mov,.webm,.mkv"
        multiple={false}
        icon={<Film className="h-7 w-7 text-teal-300 drop-shadow-md sm:h-8 sm:w-8" />}
        title="Click to upload or drag & drop"
        description="Select a screen recording of your bag, scrolling through a tab: materials, weapons or artifacts."
        subDescription="Scroll at a steady pace, pausing briefly between flicks. Runs on your device: nothing uploaded."
        sample={SAMPLE_RECORDING}
        sampleButtonText="Try a sample recording"
        sampleButtonIcon={<Film />}
        accent="teal"
        scanOverlay={video && frameView?.cards ? <FrameOverlay video={video} cards={frameView.cards} /> : null}
        scanFooter={
          video ? (
            <VideoTimeline
              duration={video.duration}
              analysedTo={analysedTo}
              frames={timeline}
              currentId={frameView?.id ?? null}
              framesScanned={framesScanned}
            />
          ) : null
        }
      />

      {isScanning && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => controllerRef.current?.abort()}
            className="on-dark flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3.5 py-1 text-xs font-semibold text-white/80 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
          >
            <Square className="h-3 w-3" />
            Stop scanning
          </button>
        </div>
      )}

      {isReviewOpen && (
        <LazyScanReviewModal
          reviewItems={reviewItems}
          equipment={reviewEquipment}
          onClose={handleCloseReview}
          onConfirm={handleConfirmReview}
        />
      )}
    </div>
  );
}

const CARD_STROKE: Record<CardRecognitionStatus, string> = {
  matched: "rgba(52, 211, 153, 0.95)",
  uncertain: "rgba(251, 191, 36, 0.95)",
  unknown: "rgba(255, 255, 255, 0.45)",
};

/**
 * Boxes of the cards found in the frame on screen. The SVG uses the frame's
 * own pixel space and "slice" scaling, so it lines up with the object-cover image.
 */
const FrameOverlay = memo(function FrameOverlay({
  video,
  cards,
}: {
  video: { width: number; height: number };
  cards: { box: PixelRect; status: CardRecognitionStatus }[];
}) {
  return (
    <svg
      viewBox={`0 0 ${video.width} ${video.height}`}
      preserveAspectRatio="xMidYMid slice"
      className="animate-in fade-in pointer-events-none absolute inset-0 z-10 h-full w-full duration-300"
      aria-hidden="true"
    >
      {cards.map((c, i) => (
        <rect
          key={i}
          x={c.box.x}
          y={c.box.y}
          width={c.box.width}
          height={c.box.height}
          rx={c.box.width * 0.08}
          fill={c.status === "matched" ? "rgba(52, 211, 153, 0.08)" : "rgba(251, 191, 36, 0.06)"}
          stroke={CARD_STROKE[c.status]}
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
});

const TICK_CLASS: Record<VideoFrameEvent["status"], string> = {
  queued: "bg-white/35",
  scanning: "bg-cyan-300 shadow-[0_0_8px_#67e8f9] animate-pulse",
  done: "bg-emerald-400/85",
  failed: "bg-rose-400",
};

/** The recording as a track: how far it has been watched, and every frame picked for scanning. */
const VideoTimeline = memo(function VideoTimeline({
  duration,
  analysedTo,
  frames,
  currentId,
  framesScanned,
}: {
  duration: number;
  analysedTo: number;
  frames: TimelineFrame[];
  currentId: number | null;
  framesScanned: number;
}) {
  const pct = (t: number) => `${Math.min(100, Math.max(0, (t / Math.max(duration, 0.001)) * 100))}%`;
  return (
    <div className="space-y-1.5">
      <div
        className="relative h-6 w-full overflow-hidden rounded-lg border border-white/10 bg-white/5"
        role="img"
        aria-label={`Video timeline: ${frames.length} frames picked, ${framesScanned} scanned`}
      >
        {/* Watched part of the recording */}
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500/10 to-teal-400/15 transition-[width] duration-200 ease-out"
          style={{ width: pct(analysedTo) }}
        />
        {frames.map((f) => (
          <span
            key={f.id}
            title={formatVideoTime(f.time)}
            className={`absolute inset-y-1 w-[3px] -translate-x-1/2 rounded-full ${TICK_CLASS[f.status]} ${
              f.id === currentId ? "inset-y-0 w-1" : ""
            }`}
            style={{ left: pct(f.time) }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[10px] font-medium text-white/50">
        <span>0:00</span>
        <span>
          {framesScanned} of {frames.length} frame{frames.length === 1 ? "" : "s"} scanned
        </span>
        <span>{formatVideoTime(duration)}</span>
      </div>
    </div>
  );
});
