"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Eye, Scan, Square, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadZone } from "./UploadZone";
import { LazyScanReviewModal, preloadScanReviewModal } from "./lazy-modals";
import type { ScanningFileItem } from "./ScanningAnimation";
import { cropToBlob } from "@/lib/grid-detector";
import { isMaterialDetectionError, type CardRecognition, type ScanProgress } from "@/lib/material-detector";
import { useMaterialScanClient } from "@/lib/material-detector/react";
import { useScannerSettings } from "@/lib/scanner-settings";
import { setScannerInventory } from "@/lib/scanner-inventory";
import type { DetectedItem, EquipmentReviewItem, ScannedReviewItem } from "@/lib/types";
import { materialThumbUrl } from "@/lib/material-ui";
import { recordScan } from "@/lib/scan-stats";
import {
  EQUIPMENT_KINDS,
  EquipmentStitcher,
  equipmentRows,
  uniqueByItem,
  uniquePanels,
  type EquipmentSighting,
} from "@/lib/scan-equipment";
import { getOwnedCharacters } from "@/lib/good-inventory";
import {
  equipmentIcon,
  equipmentReviewItem,
  readAndAttachPanel,
  inventoryPageFor,
  ownedTravelerElement,
  saveScannedEquipment,
  type EquipmentConfirm,
} from "./equipment-review";

interface ClassicScannerViewProps {
  id?: string;
  ariaLabelledBy?: string;
}

interface ScanSummary {
  files: number;
  failedFiles: number;
  cards: number;
  materials: number;
  weapons: number;
  artifacts: number;
  characters: number;
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
      return "Loading the scanner's references…";
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
  // The atlas loads once the page is idle, not during the first render
  const client = useMaterialScanClient({ preload: "idle" });
  const { settings } = useScannerSettings();

  // Once a scan's materials are added, the app switches to the /inventory page
  const router = useRouter();

  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [scanFiles, setScanFiles] = useState<ScanningFileItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scanError, setScanError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ScanSummary | null>(null);

  const [reviewItems, setReviewItems] = useState<ScannedReviewItem[]>([]);
  const [reviewEquipment, setReviewEquipment] = useState<EquipmentReviewItem[]>([]);
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

  /**
   * Scanned quantities replace stored ones: a screenshot shows the current count.
   * Shared with the other tabs: every scanner fills the same inventory.
   */
  const mergeIntoInventory = useCallback((confirmed: DetectedItem[]) => {
    setScannerInventory((prev) => {
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
      // The review modal opens when the scan finishes: fetch its code meanwhile
      preloadScanReviewModal();
      setScanFiles(
        files.map((f, i) => ({ file: f, previewUrl: trackUrl(f), name: f.name, status: i === 0 ? "scanning" : "pending" })),
      );
      setActiveIndex(0);
      setProgress(1);
      setStatusMessage("Starting local scanner…");
      setIsScanning(true);

      // One review slot per material; overlapping screenshots keep the clearest reading.
      const picks = new Map<string, { item: ScannedReviewItem; confidence: number }>();
      // Weapons and artifacts repeat: overlapping screenshots are stitched by rows instead.
      const stitchers = {
        weapon: new EquipmentStitcher(),
        artifact: new EquipmentStitcher(),
        character: new EquipmentStitcher(),
      };
      const equipmentCrops = new Map<EquipmentSighting["card"], string>();
      /** Artifacts seen only in their detail panel (no card for them in the grid). */
      const panelOnly: EquipmentSighting[] = [];
      let panelFailed = false;
      const totals: ScanSummary = {
        files: files.length,
        failedFiles: 0,
        cards: 0,
        materials: 0,
        weapons: 0,
        artifacts: 0,
        characters: 0,
        flagged: 0,
        unknown: 0,
      };

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setActiveIndex(i);
          setScanFiles((prev) =>
            prev.map((f, k) => ({ ...f, status: k === i ? "scanning" : k < i ? "completed" : "pending" })),
          );
          try {
            const { recognition, panel } = await client.scan(
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
                if (card.kind !== "material") continue;
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
                    imageSnippet: crop ? trackUrl(crop) : materialThumbUrl(card.material.id),
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
              const rows = equipmentRows(recognition.cards, i);
              if (panel && !panelFailed) {
                setStatusMessage(`Reading the artifact details in ${file.name}…`);
                try {
                  const attached = await readAndAttachPanel(panel, rows.artifact, i);
                  rows.artifact = attached.rows;
                  if (attached.standalone) {
                    const crop = bitmap ? await cropToBlob(bitmap, attached.standalone.card.box, "image/webp").catch(() => null) : null;
                    if (crop) equipmentCrops.set(attached.standalone.card, trackUrl(crop));
                    panelOnly.push(attached.standalone);
                  }
                } catch (err) {
                  if (controller.signal.aborted) throw err;
                  // Most likely the OCR couldn't be downloaded: the cards are still read.
                  console.error("Reading the artifact panel failed:", err);
                  panelFailed = true;
                  toast.warning("Couldn't read the artifact details panel; the cards were still scanned.");
                }
              }
              for (const kind of EQUIPMENT_KINDS) {
                for (const s of rows[kind].flat()) {
                  const crop = bitmap ? await cropToBlob(bitmap, s.card.box, "image/webp").catch(() => null) : null;
                  if (crop) equipmentCrops.set(s.card, trackUrl(crop));
                }
                stitchers[kind].add(rows[kind]);
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
        const travelerElement = ownedTravelerElement(getOwnedCharacters());
        const equipment = EQUIPMENT_KINDS.flatMap((kind) => {
          const stitched = stitchers[kind].result();
          const cards =
            kind === "character"
              ? uniqueByItem(stitched)
              : kind === "artifact"
                ? [...stitched, ...uniquePanels(panelOnly, stitched)]
                : stitched;
          return cards.map((s, k) =>
            equipmentReviewItem(
              s,
              `${kind}-${k}`,
              equipmentCrops.get(s.card) ?? equipmentIcon(s),
              files[s.source].name,
              travelerElement,
            ),
          );
        });
        totals.materials = review.length;
        totals.weapons = equipment.filter((e) => e.kind === "weapon").length;
        totals.artifacts = equipment.filter((e) => e.kind === "artifact").length;
        totals.characters = equipment.filter((e) => e.kind === "character").length;
        /** Artifacts whose detail panel was read: main stat and substats included. */
        const withStats = equipment.filter((e) => e.fromPanel).length;
        totals.flagged = review.filter((r) => r.reviewReason).length + equipment.filter((e) => e.reviewReason).length;
        setSummary(totals);
        setReviewItems(review);
        setReviewEquipment(equipment);

        const found = review.length + equipment.length;
        if (found === 0) {
          if (totals.failedFiles < files.length) {
            toast.info(
              totals.cards === 0
                ? "No inventory cards were found. Try a screenshot of a bag tab: Character Development Items, Materials, Weapons or Artifacts."
                : "Nothing in these screenshots matched our game data.",
            );
          }
          return;
        }
        recordScan("screenshot", files);
        // Weapons and artifacts always get a review: their main stats and replace-or-add need a look.
        if (settings.autoReviewResults || equipment.length > 0) {
          setIsReviewOpen(true);
          const parts = [
            review.length > 0 && `${review.length} material${review.length > 1 ? "s" : ""}`,
            totals.weapons > 0 && `${totals.weapons} weapon${totals.weapons > 1 ? "s" : ""}`,
            totals.artifacts > 0 &&
              `${totals.artifacts} artifact${totals.artifacts > 1 ? "s" : ""}${withStats ? ` (${withStats} with stats)` : ""}`,
            totals.characters > 0 && `${totals.characters} character${totals.characters > 1 ? "s" : ""}`,
          ].filter(Boolean);
          toast.success(
            `Recognised ${parts.join(", ")}` +
              (totals.flagged ? ` · ${totals.flagged} to check` : "") +
              ". Please review the results.",
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
    [client, isScanning, mergeIntoInventory, router, settings.autoReviewResults],
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
            {summary.files} screenshot{summary.files > 1 ? "s" : ""} · {summary.cards} cards ·{" "}
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
            {summary.unknown > 0 && <span className="text-white/50"> · {summary.unknown} not in catalog</span>}
            {summary.failedFiles > 0 && <span className="text-rose-300"> · {summary.failedFiles} failed</span>}
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
        description="Select screenshots of your bag: materials, weapons or artifacts, with their counts and levels."
        subDescription="Runs on your device: no API key, nothing uploaded."
        sampleButtonIcon={<Scan />}
        accent="teal"
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
