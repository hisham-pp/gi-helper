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
import { Eye, Settings, Sparkles, KeyRound } from "lucide-react";
import { ScanningFileItem } from "./ScanningAnimation";

export type { ServerEnvProviderInfo };

export function Scanner() {
  const { settings, updateSetting } = useScannerSettings();
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);
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

          setStatusMessage(
            `Analyzing screenshot ${i + 1} of ${totalFiles} (${file.name}) with ${currentAdapter.displayName}...`,
          );

          const response = await fetch("/api/scanner/ai-vision", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "scan",
              provider: currentConfig.provider,
              apiKey: currentConfig.apiKey,
              model: currentConfig.model,
              baseUrl: currentConfig.baseUrl,
              image: dataUrl,
            }),
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            const errorMsg =
              data.error ||
              data.message ||
              `Failed scanning ${file.name} (Status: ${response.status})`;
            throw new Error(errorMsg);
          }

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

          const fileProgress = Math.round(((i + 1) / totalFiles) * 100);
          setProgress(fileProgress);
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
        toast.error(`Scan failed: ${error.message || "Unknown error"}`);
      } finally {
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
