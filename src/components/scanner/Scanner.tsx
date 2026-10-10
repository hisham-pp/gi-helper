"use client";

import React, { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { UploadZone } from "./UploadZone";
import { ResultGrid } from "./ResultGrid";
import { GridCalibration } from "./GridCalibration";
import { DetectedItem } from "@/lib/types";
import { processInventoryImages } from "@/lib/cv/orchestrator";
import { GridConfig } from "@/lib/cv/grid-detector";
import { exportToGOODFormat } from "@/lib/good-format";

export function Scanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);
  const [gridConfig, setGridConfig] = useState<GridConfig | null>(null);
  const [showCalibration, setShowCalibration] = useState(false);
  const [lastUploadedFile, setLastUploadedFile] = useState<File | null>(null);

  // Load any previously detected items from localStorage to persist
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

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setIsScanning(true);
    setProgress(0);

    try {
      setLastUploadedFile(files[0]); // Save one for calibration testing
      // Run the new Computer Vision based image scanner
      const newItems = await processInventoryImages(
        files,
        gridConfig,
        (progressVal) => {
          setProgress(progressVal);
        },
      );

      // Merge with existing items
      setDetectedItems((prev) => {
        const merged = [...prev];
        for (const item of newItems) {
          const existing = merged.find((i) => i.id === item.id);
          if (existing) {
            existing.quantity += item.quantity;
          } else {
            merged.push(item);
          }
        }
        return merged;
      });

      toast.success("Scanning complete!");
    } catch (error) {
      console.error("OCR Error:", error);
      toast.error("Failed to scan images. Please try again.");
    } finally {
      setIsScanning(false);
    }
  }, []);

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
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] md:text-5xl">
          Inventory Scanner
        </h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          Upload screenshots of your Genshin Impact inventory to instantly
          extract materials. Review, adjust quantities, and export directly to
          .GOOD format for your favorite optimizers.
        </p>
      </div>

      <div className="relative z-10 flex justify-center">
        <button
          onClick={() => setShowCalibration(!showCalibration)}
          className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] backdrop-blur-md transition-colors hover:border-white/30 hover:text-primary"
        >
          {showCalibration
            ? "Hide Calibration Tools"
            : "Having accuracy issues? Try Grid Calibration"}
        </button>
      </div>

      {showCalibration && lastUploadedFile && (
        <GridCalibration
          imageFile={lastUploadedFile}
          config={gridConfig}
          onChange={setGridConfig}
        />
      )}
      {showCalibration && !lastUploadedFile && (
        <div className="relative rounded-xl border border-white/10 bg-white/5 p-4 text-center text-sm font-medium text-white shadow-lg drop-shadow-md backdrop-blur-md">
          Upload an image first to use the Calibration Tool.
        </div>
      )}

      <UploadZone
        isScanning={isScanning}
        progress={progress}
        onFilesSelected={handleFiles}
      />

      <ResultGrid
        items={detectedItems}
        onClear={handleClear}
        onExport={handleExport}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
    </div>
  );
}
