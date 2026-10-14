"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadZone } from "./UploadZone";
import {
  LazyScanReviewModal,
  LazyScannerSettingsModal,
  preloadScanReviewModal,
} from "./lazy-modals";
import { DetectedItem, ScannedReviewItem } from "@/lib/types";
import { materialThumbUrl } from "@/lib/materials";
import { recordScan } from "@/lib/scan-stats";
import {
  useScannerSettings,
  getActiveProviderConfig,
} from "@/lib/scanner-settings";
import { getAiAdapter } from "@/lib/ai/adapters";
import { setScannerInventory } from "@/lib/scanner-inventory";
import {
  Eye,
  Settings,
  Sparkles,
  KeyRound,
  AlertCircle,
  X,
} from "lucide-react";
import { ScanningFileItem } from "./ScanningAnimation";

/**
 * Simulates a smooth, realistic gradual progress increase during asynchronous AI Vision scans.
 * Prevents the progress bar from remaining stuck at a static percentage (e.g. 10%) while waiting for model inference.
 */
function startProgressSimulation(
  fileIndex: number,
  totalFiles: number,
  onProgress: (pct: number) => void,
  onStatus: (status: string) => void,
  adapterName: string,
  modelName: string,
  fileName: string,
) {
  const startPct = Math.round((fileIndex / totalFiles) * 100);
  const endPct = Math.round(((fileIndex + 1) / totalFiles) * 100);
  const range = endPct - startPct;
  const maxSimulatedPct = Math.min(
    endPct - 2,
    Math.round(startPct + range * 0.94),
  );

  let current = Math.max(10, startPct + Math.round(range * 0.1));
  onProgress(current);

  const timer = setInterval(() => {
    if (current < maxSimulatedPct) {
      if (current < startPct + range * 0.3) {
        current += Math.random() * 1.8 + 1.2;
        onStatus(`Ingesting screenshot buffer for ${fileName}...`);
      } else if (current < startPct + range * 0.65) {
        current += Math.random() * 1.2 + 0.8;
        onStatus(
          `Analyzing inventory items with ${adapterName} (${modelName})...`,
        );
      } else if (current < startPct + range * 0.85) {
        current += Math.random() * 0.6 + 0.4;
        onStatus(`Matching visual features against 475 canonical materials...`);
      } else {
        current += Math.random() * 0.25 + 0.1;
        onStatus(`Resolving item quantities and verifying slots...`);
      }

      current = Math.min(current, maxSimulatedPct);
      onProgress(Math.round(current));
    }
  }, 250);

  return {
    stop: () => clearInterval(timer),
    complete: () => {
      clearInterval(timer);
      onProgress(endPct);
    },
  };
}

interface AiScannerViewProps {
  id?: string;
  ariaLabelledBy?: string;
}

/**
 * AI Vision Scanner View
 * Dedicated modular component for Multimodal AI vision inventory scanning.
 * Separated for optimal code organization and accessibility.
 * Reads API keys ONLY from user configuration (stored in localStorage).
 */
export function AiScannerView({
  id = "ai-panel",
  ariaLabelledBy = "ai-tab",
}: AiScannerViewProps) {
  const { settings, updateSetting } = useScannerSettings();
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  // Once a scan's materials are added, the app switches to the /inventory page.
  // The inventory (lib/scanner-inventory) is shared: every scanner fills it.
  const router = useRouter();
  const [scanError, setScanError] = useState<string | null>(null);

  // Scanning animation states
  const [activeImagePreview, setActiveImagePreview] = useState<string | null>(
    null,
  );
  const [activeFileName, setActiveFileName] = useState<string>("");
  const [activeFileIndex, setActiveFileIndex] = useState<number>(1);
  const [totalFilesCount, setTotalFilesCount] = useState<number>(1);
  const [scanningFilesList, setScanningFilesList] = useState<
    ScanningFileItem[]
  >([]);

  // Modal states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lastReviewItems, setLastReviewItems] = useState<ScannedReviewItem[]>(
    [],
  );

  const activeAdapter = getAiAdapter(settings.aiProvider);
  const activeConfig = getActiveProviderConfig(settings);

  // API key is strictly read from user settings (localStorage) - never from server env!
  const hasKeyConfigured = Boolean(activeConfig.apiKey?.trim());

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const executeScan = useCallback(
    async (files: File[]) => {
      if (!files || files.length === 0) return;

      const currentConfig = getActiveProviderConfig(settings);
      const currentAdapter = getAiAdapter(settings.aiProvider);

      // AI key must be provided by user
      if (!currentConfig.apiKey?.trim()) {
        toast.error(
          `Please configure your ${currentAdapter.displayName} API Key in Scanner Settings first.`,
          {
            action: {
              label: "Open Settings",
              onClick: () => setIsSettingsOpen(true),
            },
          },
        );
        setIsSettingsOpen(true);
        return;
      }

      setScanError(null);

      // Prepare file previews immediately
      setTotalFilesCount(files.length);
      setActiveFileIndex(1);
      setActiveFileName(files[0]?.name || "");

      const initialQueue: ScanningFileItem[] = [];
      for (let idx = 0; idx < files.length; idx++) {
        const file = files[idx];
        const previewUrl = await readFileAsDataUrl(file);
        initialQueue.push({
          file,
          previewUrl,
          name: file.name,
          status: idx === 0 ? "scanning" : "pending",
        });
      }

      setScanningFilesList(initialQueue);
      if (initialQueue.length > 0) {
        setActiveImagePreview(initialQueue[0].previewUrl);
      }

      setIsScanning(true);
      // The review modal opens when the scan finishes: fetch its code meanwhile
      preloadScanReviewModal();
      setProgress(10);
      setStatusMessage(`Starting ${currentAdapter.displayName} Vision AI...`);

      const allDetected: DetectedItem[] = [];
      const allReview: ScannedReviewItem[] = [];
      let activeProgressSim: ReturnType<typeof startProgressSimulation> | null =
        null;

      try {
        const totalFiles = files.length;

        for (let i = 0; i < totalFiles; i++) {
          const file = files[i];
          const currentQueueItem = initialQueue[i];
          const dataUrl =
            currentQueueItem?.previewUrl || (await readFileAsDataUrl(file));

          setActiveImagePreview(dataUrl);
          setActiveFileName(file.name);
          setActiveFileIndex(i + 1);

          setScanningFilesList((prev) =>
            prev.map((item, idx) => ({
              ...item,
              status:
                idx === i ? "scanning" : idx < i ? "completed" : "pending",
            })),
          );

          activeProgressSim = startProgressSimulation(
            i,
            totalFiles,
            (pct) => setProgress(pct),
            (status) => setStatusMessage(status),
            currentAdapter.displayName,
            currentConfig.model,
            file.name,
          );

          const controller = new AbortController();
          const clientTimeout = setTimeout(() => controller.abort(), 95_000);

          let response: Response;
          try {
            response = await fetch("/api/scanner/ai-vision", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              signal: controller.signal,
              body: JSON.stringify({
                action: "scan",
                provider: currentConfig.provider,
                apiKey: currentConfig.apiKey, // Strictly user-set key
                model: currentConfig.model,
                baseUrl: currentConfig.baseUrl,
                image: dataUrl,
              }),
            });
          } catch (fetchErr: any) {
            clearTimeout(clientTimeout);
            activeProgressSim?.stop();
            if (fetchErr.name === "AbortError") {
              throw new Error(
                "Scan timed out after 95s while waiting for AI model response. Please try again or switch model in Settings.",
              );
            }
            throw fetchErr;
          } finally {
            clearTimeout(clientTimeout);
          }

          let data: any = {};
          try {
            data = await response.json();
          } catch {
            activeProgressSim?.stop();
            const rawText = await response.text().catch(() => "");
            throw new Error(
              `Server error (${response.status}): ${rawText || "Request failed or timed out"}`,
            );
          }

          if (!response.ok || !data.success) {
            activeProgressSim?.stop();
            const errorMsg =
              data.error ||
              data.message ||
              `Failed scanning ${file.name} (Status: ${response.status})`;
            throw new Error(errorMsg);
          }

          activeProgressSim.complete();

          const fileItems: DetectedItem[] = data.items || [];

          setScanningFilesList((prev) =>
            prev.map((item, idx) =>
              idx === i
                ? { ...item, status: "completed", itemCount: fileItems.length }
                : item,
            ),
          );

          for (const item of fileItems) {
            allDetected.push(item);
            allReview.push({
              id: `${file.name}-${item.id}-${Math.random().toString(36).slice(2, 7)}`,
              materialId: item.id,
              name: item.name,
              quantity: item.quantity,
              rarity: item.rarity,
              imageSnippet: materialThumbUrl(item.id),
              sourceImageName: file.name,
            });
          }
        }

        if (allDetected.length === 0) {
          toast.info("No materials detected in the uploaded screenshot(s).");
          return;
        }
        recordScan("ai", files);

        setLastReviewItems(allReview);

        if (settings.autoReviewResults && allReview.length > 0) {
          setIsReviewModalOpen(true);
          toast.success(
            `AI Vision Scan complete! Detected ${allDetected.length} items. Please review results.`,
          );
        } else {
          setScannerInventory((prev) => {
            const merged = [...prev];
            for (const item of allDetected) {
              const idx = merged.findIndex((i) => i.id === item.id);
              // Replace rather than mutate: the inventory is shared between tabs
              if (idx >= 0) {
                merged[idx] = { ...merged[idx], quantity: merged[idx].quantity + item.quantity };
              } else {
                merged.push(item);
              }
            }
            return merged;
          });
          toast.success(
            `AI Vision Scan complete! Added ${allDetected.length} materials.`,
          );
          router.push("/inventory");
        }
      } catch (error: any) {
        console.error("AI Vision Scan Error:", error);
        const errorMsg = error.message || "Unknown scan error";
        setScanError(errorMsg);
        toast.error(`Scan failed: ${errorMsg}`, { duration: 9000 });
      } finally {
        activeProgressSim?.stop();
        setIsScanning(false);
        setProgress(0);
        setStatusMessage("");
        setActiveImagePreview(null);
        setScanningFilesList([]);
      }
    },
    [router, settings],
  );

  const handleFiles = useCallback(
    (incomingFiles: FileList | File[]) => {
      if (!incomingFiles || incomingFiles.length === 0) return;
      const fileArray = Array.from(incomingFiles);
      executeScan(fileArray);
    },
    [executeScan],
  );

  const handleConfirmReview = useCallback((confirmedItems: DetectedItem[]) => {
    setScannerInventory((prev) => {
      const merged = [...prev];
      for (const item of confirmedItems) {
        const idx = merged.findIndex((i) => i.id === item.id);
        // Replace rather than mutate: the inventory is shared between tabs
        if (idx >= 0) {
          merged[idx] = { ...merged[idx], quantity: merged[idx].quantity + item.quantity };
        } else {
          merged.push(item);
        }
      }
      return merged;
    });
    setIsReviewModalOpen(false);
    router.push("/inventory");
  }, [router]);

  const handleCloseReview = useCallback(() => setIsReviewModalOpen(false), []);

  return (
    <div
      id={id}
      role="tabpanel"
      aria-labelledby={ariaLabelledBy}
      tabIndex={0}
      className="pill-tab-panel w-full space-y-4 focus-visible:outline-none"
    >
      {/* Scan Error Banner */}
      {scanError && !isScanning && (
        <div className="on-dark animate-in fade-in slide-in-from-top-2 mx-auto flex w-full max-w-2xl items-start justify-between gap-3 rounded-2xl border border-rose-500/40 bg-rose-950/50 p-3.5 text-xs text-rose-200 shadow-xl backdrop-blur-xl">
          <div className="flex min-w-0 items-start gap-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
            <div className="min-w-0 space-y-0.5">
              <p className="text-xs font-bold text-white">AI Scan Error</p>
              <p className="break-words leading-relaxed text-rose-200/90 text-[11px]">
                {scanError}
              </p>
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

      {/* Review Last Scan Action (when available) */}
      {lastReviewItems.length > 0 && !isScanning && (
        <div className="flex justify-end pb-1">
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/20 px-3.5 py-1 text-xs font-bold text-primary backdrop-blur-md transition-all hover:scale-105 hover:bg-primary/30 active:scale-95"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Review Last Scan ({lastReviewItems.length})</span>
          </button>
        </div>
      )}

      {/* Upload Zone & Scanning Chamber */}
      <UploadZone
        isScanning={isScanning}
        progress={progress}
        statusMessage={statusMessage}
        activeImageSrc={activeImagePreview}
        activeFileName={activeFileName}
        fileIndex={activeFileIndex}
        totalFiles={totalFilesCount}
        providerDisplayName={activeAdapter.displayName}
        modelName={activeConfig.model}
        scanningFiles={scanningFilesList}
        onFilesSelected={handleFiles}
        sampleButtonIcon={<Sparkles />}
        onSelectThumbnail={(idx) => {
          if (scanningFilesList[idx]) {
            setActiveImagePreview(scanningFilesList[idx].previewUrl);
            setActiveFileName(scanningFilesList[idx].name);
            setActiveFileIndex(idx + 1);
          }
        }}
      />

      {/* Post-Scan Review Modal (loaded and mounted only while open) */}
      {isReviewModalOpen && (
        <LazyScanReviewModal
          reviewItems={lastReviewItems}
          onClose={handleCloseReview}
          onConfirm={handleConfirmReview}
        />
      )}

      {/* Settings Modal (loaded and mounted only while open) */}
      {isSettingsOpen && (
        <LazyScannerSettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}
    </div>
  );
}

