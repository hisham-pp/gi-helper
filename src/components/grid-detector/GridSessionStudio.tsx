"use client";

import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { FileImage, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  addImageToSession,
  createEditorState,
  createSession,
  DEFAULT_DETECTION_SETTINGS,
  deleteImage,
  deleteSession,
  editorReducer,
  exportSessionJson,
  findCard,
  getAllSessions,
  getImagesForSession,
  isGridDetectionError,
  resolveDetectionSettings,
  updateImageResult,
  updateSession,
  validateImageDimensions,
  validateImageFile,
  type CardEdit,
  type DetectedGrid,
  type DetectionSettings,
  type GridSession,
  type PixelRect,
  type SessionImage,
} from "@/lib/grid-detector";
import { useDecodedBitmap, useGridDetectionClient, useObjectUrl } from "@/lib/grid-detector/react";
import { SessionBar } from "./SessionBar";
import { UploadZone } from "./UploadZone";
import { SessionGallery } from "./SessionGallery";
import { DetectionCanvas, type EditorTool } from "./DetectionCanvas";
import { DetectionSummary } from "./DetectionSummary";
import { DetectionSettingsPanel } from "./DetectionSettingsPanel";
import { CardInspector } from "./CardInspector";
import { CardCropsStrip } from "./CardCropsStrip";
import { EditorToolbar, OverlayLegend } from "./EditorToolbar";

const SAMPLE_SCREENSHOTS = [
  "grid-test/GenshinImpact_20261009_220726.jpg",
  "grid-test/GenshinImpact_20261009_220839.jpg",
  "grid-test/GenshinImpact_20261009_220839_1 (1).jpg",
  "grid-test/GenshinImpact_20261009_220839_1 (13).jpg",
  "grid-test/images.jpg",
  "grid-test/GenshinImpact_20261009_220714.jpg",
];

const SETTINGS_KEY = "gi-grid-detector-settings";
const HIGH_CONFIDENCE = 0.75;
const NO_GRIDS: DetectedGrid[] = [];

/** Per-viewer convenience only; detection works without it. */
function loadSettings(): DetectionSettings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (raw) return resolveDetectionSettings({ ...JSON.parse(raw), region: null });
  } catch {
    // ignore unavailable/corrupt storage
  }
  return DEFAULT_DETECTION_SETTINGS;
}

function saveSettings(settings: DetectionSettings) {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...settings, region: null }));
  } catch {
    // ignore
  }
}

/** Settings that affect the result (used to flag a stale result after changes). */
function settingsKey(s: DetectionSettings): string {
  return JSON.stringify(s);
}

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
}

export function GridSessionStudio() {
  const client = useGridDetectionClient();

  // Sessions & images
  const [sessions, setSessions] = useState<GridSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [images, setImages] = useState<SessionImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const selectedImage = images.find((img) => img.id === selectedImageId) ?? null;

  // Detection
  const [settings, setSettings] = useState<DetectionSettings>(() => loadSettings());
  const [detectingIds, setDetectingIds] = useState<ReadonlySet<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const controllers = useRef(new Map<string, AbortController>());

  // Editor
  const [editor, dispatch] = useReducer(editorReducer, undefined, () => createEditorState());
  const editorImageId = useRef<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [tool, setTool] = useState<EditorTool>("select");
  const [showEmptySlots, setShowEmptySlots] = useState(true);
  const [fitRequest, setFitRequest] = useState(0);

  const imageUrl = useObjectUrl(selectedImage?.blob);
  const bitmap = useDecodedBitmap(selectedImage?.blob);

  // ── Sessions ──────────────────────────────────────────────────────────────
  // Strict Mode runs effects twice in development; without this guard both
  // runs would see an empty database and create two default sessions.
  const initStarted = useRef(false);
  useEffect(() => {
    if (initStarted.current) return;
    initStarted.current = true;
    (async () => {
      const all = await getAllSessions();
      if (all.length === 0) {
        try {
          const created = await createSession("Detection Session #1");
          setSessions([created]);
          setActiveSessionId(created.id);
        } catch {
          toast.error("Browser storage is unavailable; sessions won't be saved.");
        }
      } else {
        setSessions(all);
        setActiveSessionId(all[0].id);
      }
    })();
  }, []);

  useEffect(() => {
    if (!activeSessionId) return;
    let stale = false;
    (async () => {
      const list = await getImagesForSession(activeSessionId);
      if (stale) return;
      setImages(list);
      setSelectedImageId(list[0]?.id ?? null);
    })();
    return () => {
      stale = true;
    };
  }, [activeSessionId]);

  // Cancel in-flight work when the studio unmounts.
  useEffect(() => {
    const map = controllers.current;
    return () => map.forEach((c) => c.abort());
  }, []);

  // ── Detection ─────────────────────────────────────────────────────────────
  const setDetecting = (id: string, on: boolean) =>
    setDetectingIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  const runDetection = useCallback(
    async (img: SessionImage, runSettings: DetectionSettings) => {
      controllers.current.get(img.id)?.abort();
      const controller = new AbortController();
      controllers.current.set(img.id, controller);
      setDetecting(img.id, true);
      setErrors((prev) => {
        if (!(img.id in prev)) return prev;
        const next = { ...prev };
        delete next[img.id];
        return next;
      });
      try {
        const result = await client.detect(img.blob, runSettings, { signal: controller.signal });
        // A newer request for this image superseded this one.
        if (controller.signal.aborted) return;
        const patch = { detection: result, grids: result.grids, isManuallyAdjusted: false };
        setImages((prev) => prev.map((i) => (i.id === img.id ? { ...i, ...patch } : i)));
        await updateImageResult(img.id, patch).catch(() => undefined);
      } catch (err) {
        if (controller.signal.aborted) return;
        if (isGridDetectionError(err) && err.code === "CANCELLED") return;
        const message = isGridDetectionError(err) ? err.message : "Grid detection failed.";
        setErrors((prev) => ({ ...prev, [img.id]: message }));
        toast.error(`${img.name}: ${message}`);
      } finally {
        if (controllers.current.get(img.id) === controller) {
          controllers.current.delete(img.id);
          setDetecting(img.id, false);
        }
      }
    },
    [client],
  );

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      if (!activeSessionId) {
        toast.error("Please create or select a session first.");
        return;
      }
      const added: SessionImage[] = [];
      for (const file of Array.from(files)) {
        try {
          validateImageFile(file);
          const bmp = await createImageBitmap(file).catch(() => {
            throw new Error("The image could not be read. It may be corrupt.");
          });
          const { width, height } = bmp;
          bmp.close();
          validateImageDimensions(width, height);
          const img = await addImageToSession(activeSessionId, {
            name: file.name || "pasted-image.png",
            blob: file,
            width,
            height,
            detection: null,
            grids: null,
          });
          added.push(img);
          setImages((prev) => [...prev, img]);
          if (added.length === 1) setSelectedImageId(img.id);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Could not add image.";
          toast.error(`${file.name || "Image"}: ${message}`);
        }
      }
      // Uploads use the current settings but never another image's region.
      for (const img of added) await runDetection(img, { ...settings, region: null });
      if (added.length > 0) {
        toast.success(`Detected cards in ${added.length} image${added.length > 1 ? "s" : ""}.`);
      }
    },
    [activeSessionId, runDetection, settings],
  );

  // Images that were never detected (or stored by an older version) are detected on open.
  useEffect(() => {
    if (selectedImage && selectedImage.grids === null && !detectingIds.has(selectedImage.id) && !errors[selectedImage.id]) {
      runDetection(selectedImage, { ...settings, region: null });
    }
    // Only react to the selection itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImage?.id, selectedImage?.grids === null]);

  // ── Editor state follows the selected image and its latest detection ─────
  useEffect(() => {
    editorImageId.current = selectedImage?.id ?? null;
    const grids = selectedImage?.grids ?? selectedImage?.detection?.grids ?? NO_GRIDS;
    dispatch({ type: "load", grids, original: selectedImage?.detection?.grids ?? grids });
    setSelectedCardId(null);
    // Reload only when the image or its automatic result changes, not after
    // each persisted edit (which also updates `images`).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImage?.id, selectedImage?.detection]);

  useEffect(() => {
    setFitRequest((n) => n + 1);
    setSettings((s) => (s.region ? { ...s, region: null } : s));
    setTool("select");
  }, [selectedImageId]);

  // Persist manual edits (debounced) to the image they belong to.
  useEffect(() => {
    const id = editorImageId.current;
    if (!id) return;
    const current = images.find((i) => i.id === id);
    if (!current || current.grids === editor.present) return;
    // Nothing was edited yet (e.g. an image that is still being detected).
    if (current.grids === null && editor.past.length === 0) return;
    const isManuallyAdjusted = editor.present !== editor.original;
    const handle = window.setTimeout(() => {
      setImages((prev) =>
        prev.map((i) => (i.id === id ? { ...i, grids: editor.present, isManuallyAdjusted } : i)),
      );
      updateImageResult(id, { grids: editor.present, isManuallyAdjusted }).catch(() => undefined);
    }, 250);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.present]);

  const onEdit = useCallback(
    (edit: CardEdit) => {
      if (!selectedImage) return;
      dispatch({ type: "edit", edit, imageWidth: selectedImage.width, imageHeight: selectedImage.height });
      if (edit.type === "remove" && edit.cardId === selectedCardId) setSelectedCardId(null);
    },
    [selectedImage, selectedCardId],
  );

  const selection = useMemo(
    () => findCard(editor.present, selectedCardId),
    [editor.present, selectedCardId],
  );

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        dispatch({ type: e.shiftKey ? "redo" : "undo" });
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        dispatch({ type: "redo" });
      } else if (e.key === "Escape") {
        setSelectedCardId(null);
        setTool("select");
      } else if ((e.key === "Delete" || e.key === "Backspace") && selection) {
        e.preventDefault();
        onEdit({ type: "remove", cardId: selection.card.id });
      } else if (e.key.startsWith("Arrow") && selection) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const { card } = selection;
        const rect: PixelRect = { x: card.x, y: card.y, width: card.width, height: card.height };
        if (e.key === "ArrowLeft") rect.x -= step;
        if (e.key === "ArrowRight") rect.x += step;
        if (e.key === "ArrowUp") rect.y -= step;
        if (e.key === "ArrowDown") rect.y += step;
        onEdit({ type: "update", cardId: card.id, rect });
      } else if (!mod && e.key.toLowerCase() === "v") {
        setTool("select");
      } else if (!mod && e.key.toLowerCase() === "a") {
        setTool("add");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selection, onEdit]);

  // Clipboard paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.items ?? [])
        .filter((item) => item.type.startsWith("image/"))
        .map((item) => item.getAsFile())
        .filter((f): f is File => f !== null);
      if (files.length > 0) processFiles(files);
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [processFiles]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const updateSettings = (patch: Partial<DetectionSettings>) =>
    setSettings((prev) => {
      const next = resolveDetectionSettings({ ...prev, ...patch });
      saveSettings(next);
      return next;
    });

  const handleAddSample = async (path: string) => {
    try {
      const res = await fetch(`/samples/${path}`);
      if (!res.ok) throw new Error("not found");
      const blob = await res.blob();
      await processFiles([new File([blob], path.split("/").pop() ?? "sample.jpg", { type: blob.type || "image/jpeg" })]);
    } catch {
      toast.error("Failed to fetch sample screenshot.");
    }
  };

  const handleDeleteSelectedImage = async () => {
    if (!selectedImage) return;
    controllers.current.get(selectedImage.id)?.abort();
    await deleteImage(selectedImage.id).catch(() => undefined);
    const remaining = images.filter((i) => i.id !== selectedImage.id);
    setImages(remaining);
    setSelectedImageId(remaining[0]?.id ?? null);
    toast.info("Image removed from session.");
  };

  const handleExportSession = async () => {
    if (!activeSessionId) return;
    const json = await exportSessionJson(activeSessionId);
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `grid-session-${activeSessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Session exported.");
  };

  const handleCreateSession = async (name: string) => {
    const created = await createSession(name);
    setSessions((prev) => [created, ...prev]);
    setActiveSessionId(created.id);
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
  };

  const handleRenameSession = async (id: string, newName: string) => {
    const session = sessions.find((s) => s.id === id);
    if (!session) return;
    const updated = await updateSession({ ...session, name: newName });
    setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
  };

  const isDetecting = selectedImage ? detectingIds.has(selectedImage.id) : false;
  const result = selectedImage?.detection ?? null;
  const settingsDirty = !!result && settingsKey(result.settings) !== settingsKey(settings);

  return (
    <div className="space-y-6">
      <div className="relative rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-2xl">
        <SessionBar
          sessions={sessions}
          activeSessionId={activeSessionId}
          imageCount={images.length}
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

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl">
          <FileImage className="h-12 w-12 text-white/30" />
          <h3 className="mt-4 text-lg font-bold text-white">No Images in this Session Yet</h3>
          <p className="mt-1 max-w-md text-sm text-white/60">
            Upload or paste inventory screenshots, or load a sample. Cards are detected
            automatically — no grid size needed.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <SessionGallery
            images={images}
            selectedImageId={selectedImageId}
            detectingIds={detectingIds}
            onSelectImage={setSelectedImageId}
          />

          {selectedImage && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="min-w-0 space-y-3 lg:col-span-8">
                <EditorToolbar
                  imageName={selectedImage.name}
                  imageWidth={selectedImage.width}
                  imageHeight={selectedImage.height}
                  tool={tool}
                  onToolChange={setTool}
                  canUndo={editor.past.length > 0}
                  canRedo={editor.future.length > 0}
                  canReset={editor.present !== editor.original}
                  onUndo={() => dispatch({ type: "undo" })}
                  onRedo={() => dispatch({ type: "redo" })}
                  onReset={() => dispatch({ type: "reset" })}
                  showEmptySlots={showEmptySlots}
                  onToggleEmptySlots={() => setShowEmptySlots((v) => !v)}
                  onDeleteImage={handleDeleteSelectedImage}
                />
                <DetectionCanvas
                  imageUrl={imageUrl}
                  imageWidth={selectedImage.width}
                  imageHeight={selectedImage.height}
                  grids={editor.present}
                  selectedCardId={selectedCardId}
                  onSelectCard={setSelectedCardId}
                  onEdit={onEdit}
                  tool={tool}
                  region={settings.region}
                  onRegionChange={(region) => {
                    updateSettings({ region });
                    setTool("select");
                  }}
                  showEmptySlots={showEmptySlots}
                  highConfidence={HIGH_CONFIDENCE}
                  busy={isDetecting}
                  fitRequest={fitRequest}
                />
                <OverlayLegend />
                <CardCropsStrip
                  bitmap={bitmap}
                  grids={editor.present}
                  selectedCardId={selectedCardId}
                  onSelectCard={setSelectedCardId}
                />
              </div>

              <div className="space-y-4 lg:col-span-4">
                <DetectionSummary
                  result={result}
                  grids={editor.present}
                  isEdited={editor.present !== editor.original}
                  error={errors[selectedImage.id] ?? null}
                />
                <CardInspector
                  selection={selection}
                  bitmap={bitmap}
                  imageName={selectedImage.name}
                  onEdit={onEdit}
                />
                <DetectionSettingsPanel
                  settings={settings}
                  onChange={updateSettings}
                  onResetDefaults={() => updateSettings({ ...DEFAULT_DETECTION_SETTINGS, region: settings.region })}
                  onRerun={() => runDetection(selectedImage, settings)}
                  onSelectRegion={() => setTool("region")}
                  busy={isDetecting}
                  dirty={settingsDirty}
                />
                {result && !isDetecting && editor.present.length === 0 && !errors[selectedImage.id] && (
                  <div className="flex items-start gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200">
                    <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    No cards found. Try a higher sensitivity, a smaller minimum card size, or
                    select the grid region — or add cards manually with “Add card”.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
