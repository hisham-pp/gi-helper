"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { UploadZone } from "./UploadZone";
import { ResultGrid } from "./ResultGrid";
import { ScanReviewModal } from "./ScanReviewModal";
import { ScannerSettingsModal } from "./ScannerSettingsModal";
import { DetectedItem, ScannedReviewItem } from "@/lib/types";
import { exportToGOODFormat } from "@/lib/good-format";
import {
  useScannerSettings,
  getActiveProviderConfig,
  ServerEnvProviderInfo,
  AiProvider,
} from "@/lib/scanner-settings";
import { getAiAdapter } from "@/lib/ai/adapters";
import {
  Eye,
  Settings,
  Sparkles,
  KeyRound,
  AlertCircle,
  X,
} from "lucide-react";
import { ScanningFileItem } from "./ScanningAnimation";

export type { ServerEnvProviderInfo };

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

export function Scanner() {
  const { settings, updateSetting } = useScannerSettings();
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);
  const [scanError, setScanError] = useState<string | null>(null);
  const [serverEnv, setServerEnv] = useState<
    Record<string, ServerEnvProviderInfo>
  >({});
  const hasAutoSwitchedRef = useRef(false);

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

  // Check server environment configuration on mount
  useEffect(() => {
    fetch("/api/scanner/ai-vision")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.providers) {
          setServerEnv(data.providers);

          // If current provider has NO key (neither locally nor on server),
          // automatically switch to a provider that has a server key configured!
          if (!hasAutoSwitchedRef.current) {
            const currentConfig = getActiveProviderConfig(settings);
            const currentHasKey = Boolean(
              currentConfig.apiKey?.trim() ||
              data.providers[settings.aiProvider]?.hasKey,
            );

            if (!currentHasKey) {
              const readyProviderId = (
                Object.keys(data.providers) as AiProvider[]
              ).find((p) => Boolean(data.providers[p]?.hasKey));

              if (readyProviderId) {
                hasAutoSwitchedRef.current = true;
                updateSetting("aiProvider", readyProviderId);
              }
            }
          }
        }
      })
      .catch(() => {});
  }, [settings, updateSetting]);

  const activeAdapter = getAiAdapter(settings.aiProvider);
  const activeConfig = getActiveProviderConfig(settings);
  const serverHasKey = Boolean(serverEnv[settings.aiProvider]?.hasKey);
  const hasKeyConfigured = Boolean(activeConfig.apiKey?.trim() || serverHasKey);

  // Load any previously detected items from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("scanner_detected_items");
    if (saved) {
      try {
        setDetectedItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved items", e);
      }
    }
  }, []);

  // Save to localStorage whenever detected items change
  useEffect(() => {
    localStorage.setItem(
      "scanner_detected_items",
      JSON.stringify(detectedItems),
    );
  }, [detectedItems]);

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
      const envHasKey = Boolean(serverEnv[settings.aiProvider]?.hasKey);

      // If neither browser localStorage nor server has a key, prompt user to configure in settings
      if (!currentConfig.apiKey?.trim() && !envHasKey) {
        const readyProvider = (Object.keys(serverEnv) as AiProvider[]).find(
          (p) => Boolean(serverEnv[p]?.hasKey),
        );

        if (readyProvider) {
          const readyAdapter = getAiAdapter(readyProvider);
          toast.error(
            `${currentAdapter.displayName} has no API key configured. Switch to ${readyAdapter.displayName} to scan.`,
            {
              action: {
                label: `Use ${readyAdapter.displayName}`,
                onClick: () => {
                  updateSetting("aiProvider", readyProvider);
                  toast.success(`Switched to ${readyAdapter.displayName}`);
                },
              },
            },
          );
        } else {
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
        }
        return;
      }

      setScanError(null);

      // Prepare file previews immediately so active image preview and queue appear instantly
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

          // Start gradual progress simulation for this file
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
                apiKey: currentConfig.apiKey,
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
                "Scan timed out after 95s while waiting for AI model response. Please try again or switch to Gemini 2.0 Flash in Settings.",
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

          // Complete progress for this file
          activeProgressSim.complete();

          const fileItems: DetectedItem[] = data.items || [];

          // Mark current item completed with detected count
          setScanningFilesList((prev) =>
            prev.map((item, idx) =>
              idx === i
                ? { ...item, status: "completed", itemCount: fileItems.length }
                : item,
            ),
          );

          // Add to detected items
          for (const item of fileItems) {
            allDetected.push(item);
            allReview.push({
              id: `${file.name}-${item.id}-${Math.random().toString(36).slice(2, 7)}`,
              materialId: item.id,
              name: item.name,
              quantity: item.quantity,
              rarity: item.rarity,
              imageSnippet: `/images/materials/${item.id}.png`,
              sourceImageName: file.name,
            });
          }
        }

        if (allDetected.length === 0) {
          toast.info("No materials detected in the uploaded screenshot(s).");
          return;
        }

        setLastReviewItems(allReview);

        // Open review modal if autoReviewResults is enabled
        if (settings.autoReviewResults && allReview.length > 0) {
          setIsReviewModalOpen(true);
          toast.success(
            `AI Vision Scan complete! Detected ${allDetected.length} items. Please review results.`,
          );
        } else {
          // Merge directly
          setDetectedItems((prev) => {
            const merged = [...prev];
            for (const item of allDetected) {
              const existing = merged.find((i) => i.id === item.id);
              if (existing) {
                existing.quantity += item.quantity;
              } else {
                merged.push(item);
              }
            }
            return merged;
          });
          toast.success(
            `AI Vision Scan complete! Added ${allDetected.length} materials.`,
          );
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
    [settings, serverEnv],
  );

  const handleFiles = useCallback(
    (incomingFiles: FileList | File[]) => {
      if (!incomingFiles || incomingFiles.length === 0) return;
      const fileArray = Array.from(incomingFiles);
      executeScan(fileArray);
    },
    [executeScan],
  );

  const handleConfirmReview = (confirmedItems: DetectedItem[]) => {
    setDetectedItems((prev) => {
      const merged = [...prev];
      for (const item of confirmedItems) {
        const existing = merged.find((i) => i.id === item.id);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          merged.push(item);
        }
      }
      return merged;
    });
    setIsReviewModalOpen(false);
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all scanned items?")) {
      setDetectedItems([]);
      toast.success("Items cleared");
    }
  };

  const handleExport = () => {
    if (detectedItems.length === 0) {
      toast.error("No items to export");
      return;
    }
    exportToGOODFormat(detectedItems);
    toast.success("Exported to GOOD format!");
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setDetectedItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item,
      ),
    );
  };

  const handleRemoveItem = (id: string) => {
    setDetectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto w-full max-w-5xl space-y-10 duration-700">
      {/* Title & Introduction */}
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] md:text-5xl">
          Inventory Scanner
        </h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          Upload screenshots of your Genshin Impact inventory to instantly
          extract materials using Multimodal AI Vision.
        </p>

        {/* AI Provider Status Pill */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`group flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold backdrop-blur-md transition-all hover:scale-105 active:scale-95 ${
              hasKeyConfigured
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                : "border-amber-500/50 bg-amber-500/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:bg-amber-500/30"
            }`}
          >
            {hasKeyConfigured ? (
              <>
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span>
                  Vision AI:{" "}
                  <strong className="font-bold">
                    {activeAdapter.displayName}
                  </strong>{" "}
                  ({activeConfig.model})
                </span>
                <Settings className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:rotate-45" />
              </>
            ) : (
              <>
                <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                <span>Setup API Key ({activeAdapter.displayName})</span>
                <span className="rounded bg-amber-400/30 px-1.5 py-0.5 text-[10px] font-bold">
                  Required
                </span>
              </>
            )}
          </button>

          {lastReviewItems.length > 0 && !isScanning && (
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/20 px-4 py-1.5 text-xs font-bold text-primary backdrop-blur-md transition-all hover:scale-105 hover:bg-primary/30 active:scale-95"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Review Last Scan ({lastReviewItems.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Scan Error Banner */}
      {scanError && !isScanning && (
        <div className="animate-in fade-in slide-in-from-top-2 mx-auto flex w-full max-w-2xl items-start justify-between gap-3 rounded-2xl border border-rose-500/40 bg-rose-950/50 p-4 text-xs text-rose-200 shadow-xl backdrop-blur-xl">
          <div className="flex min-w-0 items-start gap-2.5">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-bold text-white">AI Scan Error</p>
              <p className="break-words leading-relaxed text-rose-200/90">
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
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload Zone & Unique AI Vision Scanning Chamber */}
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
        onSelectThumbnail={(idx) => {
          if (scanningFilesList[idx]) {
            setActiveImagePreview(scanningFilesList[idx].previewUrl);
            setActiveFileName(scanningFilesList[idx].name);
            setActiveFileIndex(idx + 1);
          }
        }}
      />

      {/* Scanned Results Grid */}
      <ResultGrid
        items={detectedItems}
        onClear={handleClear}
        onExport={handleExport}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

      {/* Post-Scan Review Modal */}
      <ScanReviewModal
        isOpen={isReviewModalOpen}
        reviewItems={lastReviewItems}
        onClose={() => setIsReviewModalOpen(false)}
        onConfirm={handleConfirmReview}
      />

      {/* Settings Modal */}
      <ScannerSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        serverEnv={serverEnv}
      />
    </div>
  );
}
