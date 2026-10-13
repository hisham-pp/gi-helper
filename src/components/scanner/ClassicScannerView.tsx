"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Eye, Scan, Square, X } from "lucide-react";
import { toast } from "sonner";
import { UploadZone } from "./UploadZone";
import { ResultGrid } from "./ResultGrid";
import { ScanReviewModal } from "./ScanReviewModal";
import type { ScanningFileItem } from "./ScanningAnimation";
import { cropToBlob } from "@/lib/grid-detector";
import { isMaterialDetectionError, type CardRecognition, type ScanProgress } from "@/lib/material-detector";
import { useMaterialScanClient } from "@/lib/material-detector/react";
import { useScannerSettings } from "@/lib/scanner-settings";
import { exportToGOODFormat } from "@/lib/good-format";
import { useScannerInventory } from "@/lib/scanner-inventory";
import type { DetectedItem, ScannedReviewItem } from "@/lib/types";

interface ClassicScannerViewProps {
  id?: string;
  ariaLabelledBy?: string;
}

interface ScanSummary {
  files: number;
  failedFiles: number;
  cards: number;
  materials: number;
  flagged: number;
  unknown: number;
}

/** Share of a file's progress bar reached when each stage starts. */
const STAGE_START: Record<ScanProgress["stage"], number> = {
  decoding: 0,
  detecting: 0.05,
  "loading-references": 0.2,
  recognizing: 0.25,
};

function stageMessage(p: ScanProgress, fileName: string): string {
  switch (p.stage) {
    case "decoding":
      return `Reading ${fileName}…`;
    case "detecting":
      return `Finding the inventory grid in ${fileName}…`;
    case "loading-references":
      return "Loading material references…";
    case "recognizing":
      return p.total > 0 ? `Identifying card ${p.done} of ${p.total}…` : "Identifying cards…";
  }
}

function reviewReason(card: CardRecognition): string | undefined {
  if (card.status !== "matched") return "Low confidence";
  if (card.quantity.value === null) return "Quantity unreadable";
  if (card.quantity.confidence < 0.5) return "Check quantity";
  return undefined;
}

/**
 * Local Scanner View
 * Runs grid detection and material recognition on-device (Web Worker): no API
 * key, no upload. Results go through the same review modal and inventory as
 * the AI Vision tab.
 */
export function ClassicScannerView({ id = "scanner-panel", ariaLabelledBy = "scanner-tab" }: ClassicScannerViewProps) {
  const client = useMaterialScanClient({ preload: true });
  const { settings } = useScannerSettings();

  /** Shared with the AI Vision tab: both scanners fill the same inventory. */
  const [items, setItems] = useScannerInventory();

  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [scanFiles, setScanFiles] = useState<ScanningFileItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scanError, setScanError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ScanSummary | null>(null);

  const [reviewItems, setReviewItems] = useState<ScannedReviewItem[]>([]);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const controllerRef = useRef<AbortController | null>(null);
  /** Object URLs of the current scan (previews and crops), revoked on the next scan or unmount. */
  const urlsRef = useRef<string[]>([]);

  useEffect(() => {
    const urls = urlsRef;
    return () => {
      controllerRef.current?.abort();
      urls.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const trackUrl = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    urlsRef.current.push(url);
    return url;
  };

  /** Scanned quantities replace stored ones: a screenshot shows the current count. */
  const mergeIntoInventory = useCallback((confirmed: DetectedItem[]) => {
    setItems((prev) => {
      const byId = new Map(prev.map((i) => [i.id, i]));
      for (const item of confirmed) byId.set(item.id, { ...item });
      return [...byId.values()];
    });
  }, []);

  const handleFiles = useCallback(
    async (input: FileList | File[]) => {
      const files = Array.from(input).filter(
        (f) => f.type.startsWith("image/") || /\.(png|jpe?g|webp|bmp|gif)$/i.test(f.name),
      );
      if (files.length === 0) {
        toast.error("Please choose image files (PNG, JPEG or WebP).");
        return;
      }
      if (isScanning) return;

      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      urlsRef.current = [];

      setScanError(null);
      setSummary(null);
      setIsReviewOpen(false);
      setScanFiles(
        files.map((f, i) => ({ file: f, previewUrl: trackUrl(f), name: f.name, status: i === 0 ? "scanning" : "pending" })),
      );
      setActiveIndex(0);
      setProgress(1);
      setStatusMessage("Starting local scanner…");
      setIsScanning(true);

      // One review slot per material; overlapping screenshots keep the clearest reading.
      const picks = new Map<string, { item: ScannedReviewItem; confidence: number }>();
      const totals: ScanSummary = { files: files.length, failedFiles: 0, cards: 0, materials: 0, flagged: 0, unknown: 0 };

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setActiveIndex(i);
          setScanFiles((prev) =>
            prev.map((f, k) => ({ ...f, status: k === i ? "scanning" : k < i ? "completed" : "pending" })),
          );
          try {
            const { recognition } = await client.scan(
              file,
              {},
              {
                signal: controller.signal,
                onProgress: (p) => {
                  const within =
                    STAGE_START[p.stage] + (p.stage === "recognizing" && p.total > 0 ? (0.75 * p.done) / p.total : 0);
                  setProgress(Math.max(1, Math.round(((i + within) / files.length) * 100)));
                  setStatusMessage(stageMessage(p, file.name));
                },
              },
            );

            const bitmap = await createImageBitmap(file).catch(() => null);
            try {
              for (const card of recognition.cards) {
                totals.cards++;
                if (!card.material) {
                  totals.unknown++;
                  continue;
                }
                const existing = picks.get(card.material.id);
                if (existing && existing.confidence >= card.confidence) continue;
                const crop = bitmap ? await cropToBlob(bitmap, card.box, "image/webp").catch(() => null) : null;
                picks.set(card.material.id, {
                  confidence: card.confidence,
                  item: {
                    id: `${i}-${card.cardId}`,
                    materialId: card.material.id,
                    name: card.material.name,
                    rarity: card.material.rarity,
                    quantity: Math.max(1, card.quantity.value ?? 1),
                    imageSnippet: crop ? trackUrl(crop) : `/images/materials/${card.material.id}.png`,
                    sourceImageName: file.name,
                    row: card.row ?? undefined,
                    col: card.column ?? undefined,
                    candidates: card.candidates.map((c) => ({
                      id: c.id,
                      name: c.name,
                      rarity: c.rarity,
                      confidence: Math.round(c.confidence * 100),
                    })),
                    reviewReason: reviewReason(card),
                  },
                });
              }
            } finally {
              bitmap?.close();
            }
            setScanFiles((prev) =>
              prev.map((f, k) =>
                k === i ? { ...f, status: "completed", itemCount: recognition.cards.filter((c) => c.material).length } : f,
              ),
            );
          } catch (err) {
            if (controller.signal.aborted) throw err;
            totals.failedFiles++;
            const message = isMaterialDetectionError(err) ? err.message : "Scanning failed unexpectedly.";
            toast.error(`${file.name}: ${message}`);
            setScanFiles((prev) => prev.map((f, k) => (k === i ? { ...f, status: "completed", itemCount: 0 } : f)));
            // Reference data is needed for every file: no point continuing.
            if (isMaterialDetectionError(err) && err.code.startsWith("REFERENCES_")) {
              setScanError(message);
              break;
            }
          }
        }

        const review = [...picks.values()].map((p) => p.item);
        // Slots that need a second look first, then reading order.
        review.sort((a, b) => Number(!!b.reviewReason) - Number(!!a.reviewReason));
        totals.materials = review.length;
        totals.flagged = review.filter((r) => r.reviewReason).length;
        setSummary(totals);
        setReviewItems(review);

        if (review.length === 0) {
          if (totals.failedFiles < files.length) {
            toast.info(
              totals.cards === 0
                ? "No inventory cards were found. Try a screenshot of the Character Development Items tab."
                : "No catalog materials were recognised in these screenshots.",
            );
          }
          return;
        }
        if (settings.autoReviewResults) {
          setIsReviewOpen(true);
          toast.success(
            `Recognised ${review.length} material${review.length > 1 ? "s" : ""}` +
              (totals.flagged ? ` · ${totals.flagged} to check` : "") +
              ". Please review the results.",
          );
        } else {
          mergeIntoInventory(
            review.map((r) => ({ id: r.materialId, name: r.name, quantity: r.quantity, rarity: r.rarity })),
          );
          toast.success(`Added ${review.length} material${review.length > 1 ? "s" : ""} to your inventory.`);
        }
      } catch (err) {
        if (controller.signal.aborted) {
          toast.info("Scan cancelled.");
          return;
        }
        console.error("Local scan failed:", err);
        setScanError(isMaterialDetectionError(err) ? err.message : "Scanning failed unexpectedly.");
      } finally {
        if (controllerRef.current === controller) controllerRef.current = null;
        setIsScanning(false);
        setProgress(0);
        setStatusMessage("");
      }
    },
    // trackUrl only touches a ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [client, isScanning, mergeIntoInventory, settings.autoReviewResults],
  );

  const handleConfirmReview = (confirmed: DetectedItem[]) => {
    mergeIntoInventory(confirmed);
    setIsReviewOpen(false);
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all scanned items?")) {
      setItems([]);
      toast.success("Items cleared");
    }
  };

  const handleExport = () => {
    if (items.length === 0) {
      toast.error("No items to export");
      return;
    }
    exportToGOODFormat(items);
    toast.success("Exported to GOOD format!");
  };

  const activeFile = scanFiles[activeIndex];

  return (
    <div
      id={id}
      role="tabpanel"
      aria-labelledby={ariaLabelledBy}
      tabIndex={0}
      className="pill-tab-panel w-full space-y-4 focus-visible:outline-none"
    >
      {scanError && !isScanning && (
        <div className="animate-in fade-in slide-in-from-top-2 mx-auto flex w-full max-w-2xl items-start justify-between gap-3 rounded-2xl border border-rose-500/40 bg-rose-950/50 p-3.5 text-xs text-rose-200 shadow-xl backdrop-blur-xl">
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
            {summary.files} screenshot{summary.files > 1 ? "s" : ""} · {summary.cards} cards ·{" "}
            <span className="font-semibold text-white">{summary.materials} materials</span>
            {summary.flagged > 0 && <span className="text-amber-200"> · {summary.flagged} to check</span>}
            {summary.unknown > 0 && <span className="text-white/50"> · {summary.unknown} not in catalog</span>}
            {summary.failedFiles > 0 && <span className="text-rose-300"> · {summary.failedFiles} failed</span>}
          </p>
          {reviewItems.length > 0 && (
            <button
              onClick={() => setIsReviewOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-teal-400/30 bg-teal-500/20 px-3.5 py-1 text-xs font-bold text-teal-200 backdrop-blur-md transition-all hover:scale-105 hover:bg-teal-500/30 active:scale-95"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Review Last Scan ({reviewItems.length})</span>
            </button>
          )}
        </div>
      )}

      <UploadZone
        isScanning={isScanning}
        progress={progress}
        statusMessage={statusMessage}
        activeImageSrc={activeFile?.previewUrl ?? null}
        activeFileName={activeFile?.name}
        fileIndex={activeIndex + 1}
        totalFiles={scanFiles.length}
        providerDisplayName="Local scanner"
        modelName="on-device"
        scanningFiles={scanFiles}
        onFilesSelected={handleFiles}
        onSelectThumbnail={(idx) => scanFiles[idx] && setActiveIndex(idx)}
        inputId="classic-screenshot-upload"
        icon={<Scan className="h-7 w-7 text-teal-300 drop-shadow-md sm:h-8 sm:w-8" />}
        title="Click to upload or drag & drop"
        description="Select inventory screenshots to recognise materials, rarity and quantities."
        subDescription="Runs on your device: no API key, nothing uploaded."
        sampleButtonIcon={<Scan />}
        accent="teal"
      />

      {isScanning && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => controllerRef.current?.abort()}
            className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3.5 py-1 text-xs font-semibold text-white/80 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
          >
            <Square className="h-3 w-3" />
            Stop scanning
          </button>
        </div>
      )}

      {items.length > 0 && (
        <div className="w-full pt-4">
          <ResultGrid
            items={items}
            onClear={handleClear}
            onExport={handleExport}
            onUpdateQuantity={(itemId, quantity) =>
              setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity: Math.max(1, quantity) } : i)))
            }
            onRemoveItem={(itemId) => setItems((prev) => prev.filter((i) => i.id !== itemId))}
          />
        </div>
      )}

      <ScanReviewModal
        isOpen={isReviewOpen}
        reviewItems={reviewItems}
        onClose={() => setIsReviewOpen(false)}
        onConfirm={handleConfirmReview}
      />
    </div>
  );
}
