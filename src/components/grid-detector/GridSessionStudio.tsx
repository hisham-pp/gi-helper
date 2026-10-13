"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  GridSession,
  SessionImage,
  GridConfig,
  GridDetectionResult,
  getAllSessions,
  createSession,
  deleteSession,
  updateSession,
  getImagesForSession,
  addImageToSession,
  updateImageGrid,
  deleteImage,
  exportSessionJson,
  detectAnyGrid,
  snapGridToEdges,
  sliceDetailedGridFromBitmap,
} from "@/lib/grid-detector";
import { SessionBar } from "./SessionBar";
import { UploadZone } from "./UploadZone";
import { SessionGallery } from "./SessionGallery";
import { GridCanvas } from "./GridCanvas";
import { DetectionMetrics } from "./DetectionMetrics";
import { TuningControls } from "./TuningControls";
import { CellSlicesPreview } from "./CellSlicesPreview";
import {
  Sparkles,
  Move,
  Trash2,
  FileImage,
} from "lucide-react";
import { toast } from "sonner";

const SAMPLE_SCREENSHOTS = [
  "test-set-01/GenshinImpact_20261009_220714.jpg",
  "test-set-01/GenshinImpact_20261009_220726.jpg",
  "test-set-01/GenshinImpact_20261009_220735.jpg",
  "test-set-01/GenshinImpact_20261009_220743.jpg",
];

export function GridSessionStudio() {
  // Session States
  const [sessions, setSessions] = useState<GridSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Images in Active Session
  const [sessionImages, setSessionImages] = useState<SessionImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  // Active Canvas & Image Bitmap
  const [activeBitmap, setActiveBitmap] = useState<ImageBitmap | null>(null);
  const [activeGrid, setActiveGrid] = useState<GridConfig | null>(null);
  const [detectionMeta, setDetectionMeta] = useState<GridDetectionResult | null>(
    null,
  );
  const [cellSlices, setCellSlices] = useState<string[]>([]);
  const [hoveredCell, setHoveredCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  // Load Sessions on Mount
  useEffect(() => {
    async function init() {
      const all = await getAllSessions();
      if (all.length === 0) {
        const defaultSession = await createSession("Calibration Session #1");
        setSessions([defaultSession]);
        setActiveSessionId(defaultSession.id);
      } else {
        setSessions(all);
        setActiveSessionId(all[0].id);
      }
    }
    init();
  }, []);

  // Load Images whenever Active Session changes
  useEffect(() => {
    if (!activeSessionId) return;
    async function loadImages() {
      const images = await getImagesForSession(activeSessionId!);
      setSessionImages(images);
      if (images.length > 0) {
        setSelectedImageId(images[0].id);
      } else {
        setSelectedImageId(null);
        setActiveBitmap(null);
        setActiveGrid(null);
        setDetectionMeta(null);
        setCellSlices([]);
      }
    }
    loadImages();
  }, [activeSessionId]);

  // Load Active Image Bitmap & Grid when selectedImageId changes
  useEffect(() => {
    if (!selectedImageId) return;
    const target = sessionImages.find((img) => img.id === selectedImageId);
    if (!target) return;

    setActiveGrid(target.detectedGrid);

    const img = new Image();
    img.src = target.dataUrl;
    img.onload = async () => {
      try {
        const bmp = await createImageBitmap(img);
        setActiveBitmap(bmp);
      } catch (err) {
        console.error("Failed to create ImageBitmap", err);
      }
    };
  }, [selectedImageId, sessionImages]);

  // Slices preview updater
  useEffect(() => {
    if (!activeBitmap || !activeGrid) {
      setCellSlices([]);
      return;
    }

    let isMounted = true;
    sliceDetailedGridFromBitmap(activeBitmap, activeGrid)
      .then((slices) => {
        if (!isMounted) return;
        const previewPromises = slices.slice(0, 8).map((slice) => {
          const offCanvas = document.createElement("canvas");
          offCanvas.width = slice.cellBitmap.width;
          offCanvas.height = slice.cellBitmap.height;
          const ctx = offCanvas.getContext("2d");
          if (ctx) ctx.drawImage(slice.cellBitmap, 0, 0);
          return offCanvas.toDataURL("image/jpeg", 0.85);
        });
        setCellSlices(previewPromises);
      })
      .catch((err) => {
        console.warn("Could not slice preview cells", err);
      });

    return () => {
      isMounted = false;
    };
  }, [activeBitmap, activeGrid]);

  // Process Files Uploaded / Dropped / Pasted
  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      if (!activeSessionId) {
        toast.error("Please create or select a session first.");
        return;
      }

      let successCount = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;

        try {
          const bmp = await createImageBitmap(file);
          const detection = await detectAnyGrid(bmp);

          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          const newImg = await addImageToSession(
            activeSessionId,
            dataUrl,
            file.name,
            bmp.width,
            bmp.height,
            detection,
          );

          setSessionImages((prev) => [...prev, newImg]);
          if (!selectedImageId) {
            setSelectedImageId(newImg.id);
          }
          successCount++;
        } catch (err) {
          console.error("Error processing file upload", file.name, err);
        }
      }

      if (successCount > 0) {
        toast.success(
          `Uploaded & auto-detected ${successCount} image${successCount > 1 ? "s" : ""}!`,
        );
      }
    },
    [activeSessionId, selectedImageId],
  );

  // Global Clipboard Paste Listener
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) files.push(file);
        }
      }

      if (files.length > 0) {
        toast.info("Pasted screenshot detected, auto-detecting grid...");
        await processFiles(files);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [processFiles]);

  // Load Sample into Session
  const handleAddSample = async (filename: string) => {
    if (!activeSessionId) return;
    try {
      const res = await fetch(`/samples/${filename}`);
      if (!res.ok) throw new Error("Could not fetch sample");
      const blob = await res.blob();
      const file = new File([blob], filename.split("/").pop() || "sample.jpg", {
        type: "image/jpeg",
      });
      await processFiles([file]);
    } catch (err) {
      console.error("Failed to load sample", err);
      toast.error("Failed to fetch sample screenshot.");
    }
  };

  // Grid Update
  const handleUpdateGrid = async (delta: Partial<GridConfig>) => {
    if (!activeGrid || !selectedImageId) return;
    const updated: GridConfig = {
      ...activeGrid,
      ...delta,
      columns: Math.max(1, delta.columns ?? activeGrid.columns),
      rows: Math.max(1, delta.rows ?? activeGrid.rows),
      cellWidth: Math.max(10, delta.cellWidth ?? activeGrid.cellWidth),
      cellHeight: Math.max(10, delta.cellHeight ?? activeGrid.cellHeight),
      startX: Math.max(0, delta.startX ?? activeGrid.startX),
      startY: Math.max(0, delta.startY ?? activeGrid.startY),
      gapX: Math.max(0, delta.gapX ?? activeGrid.gapX),
      gapY: Math.max(0, delta.gapY ?? activeGrid.gapY),
    };

    setActiveGrid(updated);
    await updateImageGrid(selectedImageId, updated, true);
    setSessionImages((prev) =>
      prev.map((img) =>
        img.id === selectedImageId
          ? { ...img, detectedGrid: updated, isManuallyAdjusted: true }
          : img,
      ),
    );
  };

  // Re-run Detection on current image
  const handleReDetect = async () => {
    if (!activeBitmap || !selectedImageId) return;
    try {
      const result = await detectAnyGrid(activeBitmap);
      setActiveGrid(result.config);
      setDetectionMeta(result);
      await updateImageGrid(selectedImageId, result.config, false);
      setSessionImages((prev) =>
        prev.map((img) =>
          img.id === selectedImageId
            ? {
                ...img,
                detectedGrid: result.config,
                confidence: result.confidence,
                method: result.method,
                detectedCellsCount: result.detectedCellsCount,
                isManuallyAdjusted: false,
              }
            : img,
        ),
      );
      toast.success(
        `Auto-detected ${result.config.columns}×${result.config.rows} grid (${result.confidence}% confidence)!`,
      );
    } catch (err) {
      console.error("Error re-detecting grid", err);
      toast.error("Auto-detection failed.");
    }
  };

  // Snap to Edges
  const handleSnap = async () => {
    if (!activeGrid || !activeBitmap || !selectedImageId) return;
    const snapped = snapGridToEdges(
      activeGrid,
      activeBitmap.width,
      activeBitmap.height,
    );
    setActiveGrid(snapped);
    await updateImageGrid(selectedImageId, snapped, true);
    toast.success("Grid bounds snapped to high-contrast edges.");
  };

  // Apply Current Grid to ALL Images in Session
  const handleApplyToAll = async () => {
    if (!activeGrid || !activeSessionId) return;
    for (const img of sessionImages) {
      await updateImageGrid(img.id, activeGrid, true);
    }
    setSessionImages((prev) =>
      prev.map((img) => ({
        ...img,
        detectedGrid: activeGrid,
        isManuallyAdjusted: true,
      })),
    );
    toast.success(
      `Applied grid calibration to all ${sessionImages.length} images in session!`,
    );
  };

  // Delete Current Image
  const handleDeleteSelectedImage = async () => {
    if (!selectedImageId) return;
    await deleteImage(selectedImageId);
    setSessionImages((prev) => prev.filter((img) => img.id !== selectedImageId));
    toast.info("Image removed from session.");
  };

  // Export Session JSON
  const handleExportSession = async () => {
    if (!activeSessionId) return;
    const jsonStr = await exportSessionJson(activeSessionId);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grid-session-${activeSessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Session grid calibrations exported!");
  };

  // Session Handlers
  const handleCreateSession = async (name: string) => {
    const created = await createSession(name);
    setSessions((prev) => [created, ...prev]);
    setActiveSessionId(created.id);
    toast.success(`Created session: "${created.name}"`);
  };

  const handleDeleteSession = async (id: string) => {
    if (sessions.length <= 1) {
      toast.error("Cannot delete the only remaining session.");
      return;
    }
    await deleteSession(id);
    const remaining = sessions.filter((s) => s.id !== id);
    setSessions(remaining);
    setActiveSessionId(remaining[0].id);
    toast.info("Session deleted.");
  };

  const handleRenameSession = async (id: string, newName: string) => {
    const session = sessions.find((s) => s.id === id);
    if (session) {
      session.name = newName;
      await updateSession(session);
      setSessions([...sessions]);
      toast.success("Session renamed.");
    }
  };

  const activeImage = sessionImages.find((img) => img.id === selectedImageId);

  return (
    <div className="space-y-6">
      {/* Session Management & Upload Container */}
      <div className="relative rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-2xl">
        <SessionBar
          sessions={sessions}
          activeSessionId={activeSessionId}
          imageCount={sessionImages.length}
          onSelectSession={setActiveSessionId}
          onCreateSession={handleCreateSession}
          onRenameSession={handleRenameSession}
          onDeleteSession={handleDeleteSession}
          onExportSession={handleExportSession}
        />

        <div className="mt-5">
          <UploadZone
            onFilesSelected={processFiles}
            onSampleSelected={handleAddSample}
            sampleList={SAMPLE_SCREENSHOTS}
          />
        </div>
      </div>

      {/* Main Work Area */}
      {sessionImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl">
          <FileImage className="h-12 w-12 text-white/30" />
          <h3 className="mt-4 text-lg font-bold text-white">
            No Images in this Session Yet
          </h3>
          <p className="mt-1 max-w-md text-sm text-white/60">
            Upload one or more screenshots above, or click on a sample button to
            start auto-detecting inventory grids automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Gallery Reel */}
          <SessionGallery
            images={sessionImages}
            selectedImageId={selectedImageId}
            onSelectImage={setSelectedImageId}
          />

          {/* Active Image Inspection & Controls */}
          {activeImage && activeGrid && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Canvas Column (8 cols) */}
              <div className="space-y-4 lg:col-span-8">
                {/* Header Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {activeImage.name}
                    </span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/70">
                      {activeImage.width}×{activeImage.height}px
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReDetect}
                      className="flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/20 px-3 py-1 text-xs font-bold text-primary transition-all hover:bg-primary/30"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Auto-Detect</span>
                    </button>

                    <button
                      onClick={handleSnap}
                      className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition-all hover:bg-white/20"
                      title="Snap to local high-contrast edges"
                    >
                      <Move className="h-3 w-3 text-cyan-400" />
                      <span>Snap Edges</span>
                    </button>

                    <button
                      onClick={handleDeleteSelectedImage}
                      className="rounded-xl border border-red-500/20 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20"
                      title="Remove from session"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Canvas Display */}
                <GridCanvas
                  imageBitmap={activeBitmap}
                  gridConfig={activeGrid}
                  hoveredCell={hoveredCell}
                  onHoverCell={setHoveredCell}
                />

                {/* Real-time Slices Verification Strip */}
                <CellSlicesPreview slices={cellSlices} />
              </div>

              {/* Controls Column (4 cols) */}
              <div className="space-y-4 lg:col-span-4">
                <DetectionMetrics
                  activeImage={activeImage}
                  gridConfig={activeGrid}
                  detectionMeta={detectionMeta}
                />

                <TuningControls
                  gridConfig={activeGrid}
                  onUpdateGrid={handleUpdateGrid}
                  onApplyToAll={handleApplyToAll}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
