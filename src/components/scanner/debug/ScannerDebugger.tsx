"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  GridConfig,
  autoDetectGrid,
  sliceDetailedGridFromBitmap,
  GENSHIN_1080P_GRID,
} from "@/lib/cv/grid-detector";
import {
  CellDebugData,
  DebugHyperparams,
  ScanBenchmark,
} from "@/lib/cv/debug-types";
import { analyzeCell, reEvaluateCell } from "@/lib/cv/debug-runner";
import { CanvasGridOverlay } from "./CanvasGridOverlay";
import { GridControls } from "./GridControls";
import { HyperparamControls } from "./HyperparamControls";
import { CellInspector } from "./CellInspector";
import { GridMatrixView } from "./GridMatrixView";
import { DatabaseHashExplorer } from "./DatabaseHashExplorer";
import { exportToGOODFormat } from "@/lib/good-format";
import {
  Upload,
  Play,
  Zap,
  Download,
  FileJson,
  Layers,
  Sparkles,
  Database,
  Grid,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import Tesseract from "tesseract.js";

const SAMPLE_SCREENSHOTS = [
  "test-set-01/GenshinImpact_20261009_220714.jpg",
  "test-set-01/GenshinImpact_20261009_220726.jpg",
  "test-set-01/GenshinImpact_20261009_220735.jpg",
  "test-set-01/GenshinImpact_20261009_220743.jpg",
  "test-set-01/GenshinImpact_20261009_220750.jpg",
  "test-set-01/GenshinImpact_20261009_220755.jpg",
  "test-set-01/GenshinImpact_20261009_220802.jpg",
  "test-set-01/GenshinImpact_20261009_220807.jpg",
  "test-set-01/GenshinImpact_20261009_220816.jpg",
  "test-set-01/GenshinImpact_20261009_220821.jpg",
  "test-set-01/GenshinImpact_20261009_220827.jpg",
  "test-set-01/GenshinImpact_20261009_220832.jpg",
  "test-set-01/GenshinImpact_20261009_220839.jpg",
];

export function ScannerDebugger() {
  // Image State
  const [currentImageName, setCurrentImageName] = useState<string>("Sample 1");
  const [imageBitmap, setImageBitmap] = useState<ImageBitmap | null>(null);

  // Grid Configuration
  const [gridConfig, setGridConfig] = useState<GridConfig>(GENSHIN_1080P_GRID);

  // Hyperparameters
  const [hyperparams, setHyperparams] = useState<DebugHyperparams>({
    minConfidence: 55,
    emptyThreshold: 18,
    hashWeight: 0.6,
    colorWeight: 0.4,
  });

  // Pipeline Analysis State
  const [analyzedCells, setAnalyzedCells] = useState<
    Map<string, CellDebugData>
  >(new Map());
  const [selectedCellKey, setSelectedCellKey] = useState<string | null>("0-0");
  const [benchmark, setBenchmark] = useState<ScanBenchmark | null>(null);

  // Execution & UI state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [enableOCR, setEnableOCR] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "inspector" | "matrix" | "database"
  >("inspector");

  // OCR Worker ref
  const workerRef = useRef<Tesseract.Worker | null>(null);

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  // Helper to load or initialize worker
  const getOCRWorker = async (): Promise<Tesseract.Worker> => {
    if (!workerRef.current) {
      const w = await Tesseract.createWorker("eng");
      await w.setParameters({ tessedit_char_whitelist: "0123456789" });
      workerRef.current = w;
    }
    return workerRef.current;
  };

  // Load an Image from File or Blob
  const loadImage = useCallback(async (blobOrFile: Blob, name: string) => {
    try {
      const bmp = await createImageBitmap(blobOrFile);
      setImageBitmap(bmp);
      setCurrentImageName(name);

      // Auto detect grid for this image
      const detectedGrid = autoDetectGrid(bmp.width, bmp.height);
      setGridConfig(detectedGrid);
      setAnalyzedCells(new Map());
      setSelectedCellKey("0-0");
      setBenchmark(null);
      toast.success(`Loaded image: ${name} (${bmp.width}×${bmp.height})`);
    } catch (e) {
      console.error("Failed to load image bitmap", e);
      toast.error("Failed to load image. Ensure it's a valid picture.");
    }
  }, []);

  // Load sample screenshot
  const handleLoadSample = useCallback(
    async (filename: string, label: string) => {
      try {
        const res = await fetch(`/samples/${filename}`);
        if (!res.ok) throw new Error("Failed to fetch sample image");
        const blob = await res.blob();
        await loadImage(blob, label);
      } catch (e) {
        console.error("Error fetching sample screenshot", e);
        toast.error(`Could not load ${filename}`);
      }
    },
    [loadImage],
  );

  // Load first sample on initial render
  useEffect(() => {
    handleLoadSample(SAMPLE_SCREENSHOTS[0], "Sample #1 (220714)");
  }, [handleLoadSample]);

  // Clipboard paste listener (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            loadImage(
              file,
              `Pasted Screenshot (${new Date().toLocaleTimeString()})`,
            );
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [loadImage]);

  // Handle custom file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      loadImage(file, file.name);
    }
  };

  // Run analysis on ALL cells
  const handleScanAllCells = async (withOCR: boolean) => {
    if (!imageBitmap) {
      toast.error("Please load a screenshot first");
      return;
    }

    setIsScanning(true);
    setScanProgress(0);

    const overallStart = performance.now();
    let sliceDuration = 0;
    let hashDuration = 0;
    let matchDuration = 0;
    let ocrDuration = 0;

    try {
      // 1. Slice image
      const sliceStart = performance.now();
      const slices = await sliceDetailedGridFromBitmap(imageBitmap, gridConfig);
      sliceDuration = Math.round(performance.now() - sliceStart);

      // 2. OCR Worker (if enabled)
      let worker: Tesseract.Worker | null = null;
      if (withOCR) {
        worker = await getOCRWorker();
      }

      const results = new Map<string, CellDebugData>();
      let emptyCount = 0;
      let matchedCount = 0;
      let totalQty = 0;
      let sumConfidence = 0;
      let previousMatchName: string | null = null;

      // 3. Process cell by cell
      for (let i = 0; i < slices.length; i++) {
        const slice = slices[i];
        
        // Pass the previous match name for sibling contextual boosting
        const currentHyperparams = {
          ...hyperparams,
          neighborNames: previousMatchName ? [previousMatchName] : undefined
        };
        
        const cellData = await analyzeCell(slice, currentHyperparams, worker);
        const key = `${slice.row}-${slice.col}`;
        results.set(key, cellData);

        // Stats accumulation
        hashDuration += cellData.timings.hashMs;
        matchDuration += cellData.timings.matchMs;
        if (cellData.timings.ocrMs) ocrDuration += cellData.timings.ocrMs;

        if (cellData.stats.isEmpty) {
          emptyCount++;
        } else if (cellData.matched) {
          matchedCount++;
          sumConfidence += cellData.matched.confidence;
          totalQty += cellData.ocr ? cellData.ocr.quantity : 1;
          previousMatchName = cellData.matched.name;
        } else {
          previousMatchName = null;
        }

        setScanProgress(Math.round(((i + 1) / slices.length) * 100));
      }

      const totalElapsed = Math.round(performance.now() - overallStart);

      setAnalyzedCells(results);
      setBenchmark({
        totalCells: slices.length,
        emptyCells: emptyCount,
        occupiedCells: slices.length - emptyCount,
        matchedItems: matchedCount,
        totalQuantity: totalQty,
        avgConfidence:
          matchedCount > 0 ? Math.round(sumConfidence / matchedCount) : 0,
        sliceTotalMs: sliceDuration,
        hashTotalMs: hashDuration,
        matchTotalMs: matchDuration,
        ocrTotalMs: ocrDuration,
        totalElapsedMs: totalElapsed,
      });

      toast.success(
        `Scan complete in ${totalElapsed}ms! ${matchedCount} items identified (${emptyCount} empty slots skipped).`,
      );
    } catch (e) {
      console.error("Scan error", e);
      toast.error("Scan failed. Check developer console.");
    } finally {
      setIsScanning(false);
    }
  };

  // Run analysis on a SINGLE cell
  const handleAnalyzeSingleCell = async (row: number, col: number) => {
    if (!imageBitmap) return;

    try {
      const slices = await sliceDetailedGridFromBitmap(imageBitmap, gridConfig);
      const targetSlice = slices.find((s) => s.row === row && s.col === col);
      if (!targetSlice) return;

      let worker: Tesseract.Worker | null = null;
      if (enableOCR) {
        worker = await getOCRWorker();
      }

      const cellData = await analyzeCell(targetSlice, hyperparams, worker);
      const key = `${row}-${col}`;

      setAnalyzedCells((prev) => {
        const next = new Map(prev);
        next.set(key, cellData);
        return next;
      });

      setSelectedCellKey(key);
      toast.success(
        `Cell [${row}, ${col}] analyzed in ${cellData.timings.totalMs}ms`,
      );
    } catch (e) {
      console.error("Single cell analysis failed", e);
      toast.error("Failed to analyze cell.");
    }
  };

  // Re-evaluate candidate matches when hyperparameters change
  const handleReevaluate = () => {
    if (analyzedCells.size === 0) {
      toast.info("No cells analyzed yet. Run a scan first!");
      return;
    }

    const updated = new Map<string, CellDebugData>();
    let matchedCount = 0;
    let sumConfidence = 0;
    let emptyCount = 0;

    analyzedCells.forEach((val, key) => {
      const reeval = reEvaluateCell(val, hyperparams);
      updated.set(key, reeval);

      if (reeval.stats.isEmpty) emptyCount++;
      else if (reeval.matched) {
        matchedCount++;
        sumConfidence += reeval.matched.confidence;
      }
    });

    setAnalyzedCells(updated);
    if (benchmark) {
      setBenchmark({
        ...benchmark,
        emptyCells: emptyCount,
        occupiedCells: benchmark.totalCells - emptyCount,
        matchedItems: matchedCount,
        avgConfidence:
          matchedCount > 0 ? Math.round(sumConfidence / matchedCount) : 0,
      });
    }

    toast.success("Matches and thresholds re-evaluated in-memory!");
  };

  // Export Debug JSON Report
  const handleExportDiagnostics = () => {
    if (analyzedCells.size === 0) {
      toast.error("No analysis results to export. Run a scan first!");
      return;
    }

    const report = {
      image: {
        name: currentImageName,
        width: imageBitmap?.width,
        height: imageBitmap?.height,
      },
      gridConfig,
      hyperparams,
      benchmark,
      cells: Array.from(analyzedCells.values()).map((c) => ({
        row: c.slice.row,
        col: c.slice.col,
        index: c.slice.index,
        rect: c.slice.cellRect,
        stats: c.stats,
        dHash: c.fingerprint.dHash,
        colorHist: c.fingerprint.colorHist,
        matched: c.matched,
        topCandidates: c.topCandidates,
        ocr: c.ocr,
        timings: c.timings,
      })),
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scanner-debug-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Diagnostics report downloaded!");
  };

  // Export GOOD Format
  const handleExportGOOD = () => {
    const detectedList: { id: string; name: string; quantity: number }[] = [];
    analyzedCells.forEach((c) => {
      if (c.matched) {
        detectedList.push({
          id: c.matched.id,
          name: c.matched.name,
          quantity: c.ocr ? c.ocr.quantity : 1,
        });
      }
    });

    if (detectedList.length === 0) {
      toast.error("No items identified to export.");
      return;
    }

    exportToGOODFormat(detectedList);
    toast.success(`Exported ${detectedList.length} items to .GOOD format!`);
  };

  // Currently selected cell debug data
  const selectedCellData = selectedCellKey
    ? analyzedCells.get(selectedCellKey) || null
    : null;

  return (
    <div className="animate-in fade-in mx-auto w-full max-w-7xl space-y-8 pb-16 duration-500">
      {/* Top Banner & Header */}
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Diagnostic & Debug Suite</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md sm:text-5xl">
          Inventory Scanner Debugger
        </h1>
        <p className="mx-auto max-w-3xl text-sm leading-relaxed text-white/80 drop-shadow-sm sm:text-base">
          Deep-inspect the computer vision pipeline: calibrate grid bounds,
          examine 256-bit dHash gradient matrices, inspect 24-bin RGB color
          histograms, view top candidate rankings, and test quantity OCR in real
          time.
        </p>
      </div>

      {/* Preset Samples & Upload Bar */}
      <div className="relative space-y-4 rounded-3xl border-[0.5px] border-b-white/5 border-l-white/20 border-r-white/5 border-t-white/30 bg-gradient-to-br from-white/10 via-white/5 to-black/30 p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            <span className="text-on-surface text-sm font-bold sm:text-base">
              Test Screenshots
            </span>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              Current: {currentImageName}
            </span>
          </div>

          {/* Custom Upload Button */}
          <label className="text-on-surface flex cursor-pointer items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold shadow-sm transition-all hover:bg-white/20 active:scale-95">
            <Upload className="h-3.5 w-3.5 text-primary" />
            <span>Upload Screenshot / Paste (Ctrl+V)</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* Quick Sample Selector Pills */}
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          <span className="text-on-surface/50 flex-shrink-0 text-xs font-semibold">
            Samples:
          </span>
          {SAMPLE_SCREENSHOTS.map((filename, idx) => {
            const label = `#${idx + 1} (${filename.slice(14, 20)})`;
            const isActive = currentImageName.includes(filename.slice(14, 20));
            return (
              <button
                key={filename}
                onClick={() =>
                  handleLoadSample(
                    filename,
                    `Sample #${idx + 1} (${filename.slice(14, 20)})`,
                  )
                }
                className={`flex-shrink-0 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow"
                    : "text-on-surface/70 border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Execution Action Bar */}
      <div className="relative flex flex-wrap items-center justify-between gap-4 rounded-3xl border-[0.5px] border-b-white/5 border-l-white/20 border-r-white/5 border-t-white/30 bg-gradient-to-br from-white/10 via-white/5 to-black/30 p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-2xl">
        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Fast CV Scan */}
          <button
            onClick={() => handleScanAllCells(false)}
            disabled={isScanning || !imageBitmap}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)] transition-all hover:from-teal-400 hover:to-emerald-400 active:scale-95 disabled:opacity-50 sm:text-sm"
          >
            {isScanning && !enableOCR ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            <span>Fast CV Scan (~30ms)</span>
          </button>

          {/* Full Pipeline with OCR */}
          <button
            onClick={() => handleScanAllCells(true)}
            disabled={isScanning || !imageBitmap}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-[0_4px_16px_rgba(var(--md-sys-color-primary),0.3)] transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50 sm:text-sm"
          >
            {isScanning && enableOCR ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>Full Scan (+ Tesseract OCR)</span>
          </button>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportDiagnostics}
            disabled={analyzedCells.size === 0}
            className="text-on-surface flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold shadow-sm transition-all hover:bg-white/20 active:scale-95 disabled:opacity-40"
            title="Download comprehensive JSON diagnostics report"
          >
            <FileJson className="h-4 w-4 text-primary" />
            <span>Export Diagnostics</span>
          </button>

          <button
            onClick={handleExportGOOD}
            disabled={analyzedCells.size === 0}
            className="text-on-surface flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold shadow-sm transition-all hover:bg-white/20 active:scale-95 disabled:opacity-40"
            title="Export standard .GOOD format for Genshin optimizers"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>Export .GOOD</span>
          </button>
        </div>
      </div>

      {/* Progress Bar (Visible while scanning) */}
      {isScanning && (
        <div className="animate-in fade-in space-y-2 rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="text-on-surface flex justify-between text-xs font-semibold">
            <span>Analyzing Inventory Cells...</span>
            <span className="font-mono text-primary">{scanProgress}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/50">
            <div
              className="h-full bg-primary transition-all duration-200 ease-out"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Main 2-Column Work Area */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Left Column: Interactive Canvas & Calibration Sliders (7 cols on lg) */}
        <div className="space-y-6 lg:col-span-7">
          <CanvasGridOverlay
            imageBitmap={imageBitmap}
            gridConfig={gridConfig}
            analyzedCells={analyzedCells}
            selectedCellKey={selectedCellKey}
            onSelectCell={(r, c) => setSelectedCellKey(`${r}-${c}`)}
          />

          <GridControls
            imageBitmap={imageBitmap}
            config={gridConfig}
            onChange={setGridConfig}
          />

          <HyperparamControls
            hyperparams={hyperparams}
            onChange={setHyperparams}
            onReevaluate={handleReevaluate}
            enableOCR={enableOCR}
            onToggleOCR={setEnableOCR}
          />
        </div>

        {/* Right Column: Deep-Dive Inspector Tabs (5 cols on lg) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Tab Navigation Pill Bar */}
          <div className="flex items-center rounded-2xl border border-white/10 bg-black/40 p-1">
            <button
              onClick={() => setActiveTab("inspector")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
                activeTab === "inspector"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-on-surface/70 hover:text-on-surface"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Cell Deep-Dive</span>
            </button>

            <button
              onClick={() => setActiveTab("matrix")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
                activeTab === "matrix"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-on-surface/70 hover:text-on-surface"
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              <span>Full Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab("database")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
                activeTab === "database"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-on-surface/70 hover:text-on-surface"
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              <span>Hash Explorer</span>
            </button>
          </div>

          {/* Active Tab View */}
          {activeTab === "inspector" && (
            <CellInspector
              cellData={selectedCellData}
              hyperparams={hyperparams}
              ocrWorker={workerRef.current}
              onRunCellAnalysis={(r, c) => handleAnalyzeSingleCell(r, c)}
            />
          )}

          {activeTab === "matrix" && (
            <GridMatrixView
              gridConfig={gridConfig}
              analyzedCells={analyzedCells}
              selectedCellKey={selectedCellKey}
              onSelectCell={(r, c) => {
                setSelectedCellKey(`${r}-${c}`);
                setActiveTab("inspector");
              }}
              benchmark={benchmark}
            />
          )}

          {activeTab === "database" && (
            <DatabaseHashExplorer
              selectedCellData={selectedCellData}
              hyperparams={hyperparams}
            />
          )}
        </div>
      </div>
    </div>
  );
}
