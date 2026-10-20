"use client";

import { createPortal } from "react-dom";
import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { FileJson, FileUp, TriangleAlert, X } from "lucide-react";
import { parseGOOD, type ParsedGOOD } from "@gi/good";
import { applyGOODImport, type ImportSection, type ImportSummary } from "@gi/good";
import { useModalMotion, usePauseBackground } from "@/lib/hooks";

/** Big enough for any real account (a few MB with 2,000 artifacts). */
const MAX_FILE_BYTES = 20 * 1024 * 1024;

interface ImportGOODModalProps {
  onClose: () => void;
  onImported: (summary: ImportSummary) => void;
}

const SECTIONS: { key: ImportSection; label: string; effect: string }[] = [
  { key: "characters", label: "Characters", effect: "Replaces your characters" },
  { key: "weapons", label: "Weapons", effect: "Replaces your weapons" },
  { key: "artifacts", label: "Artifacts", effect: "Replaces your artifacts" },
  { key: "materials", label: "Materials", effect: "Updates these counts; materials the file doesn't list stay" },
];

function sectionCount(data: ParsedGOOD, key: ImportSection): number | undefined {
  if (key === "materials") return data.materials ? Object.keys(data.materials).length : undefined;
  return data[key]?.length;
}

/**
 * Import a GOOD file (Genshin Optimizer, Inventory Kamera, Irminsul, ...):
 * pick or drop the file, choose which sections to bring in, import. Load it
 * through LazyImportGOODModal; it mounts only while open.
 */
export function ImportGOODModal({ onClose, onImported }: ImportGOODModalProps) {
  usePauseBackground();
  const { dialogRef, backdropRef, close, closeThen } = useModalMotion(onClose);
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [data, setData] = useState<ParsedGOOD | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<ImportSection>>(new Set());
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  const readFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setData(null);
    setError(null);
    if (file.size > MAX_FILE_BYTES) {
      setError("This file is too big for a GOOD file.");
      return;
    }
    const result = parseGOOD(await file.text());
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const present = SECTIONS.filter((s) => (sectionCount(result.data, s.key) ?? 0) > 0).map((s) => s.key);
    if (present.length === 0) {
      setError("This GOOD file has no characters, weapons, artifacts or materials.");
      return;
    }
    setData(result.data);
    setSelected(new Set(present));
  }, []);

  const toggle = (key: ImportSection) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const handleImport = () => {
    if (!data || selected.size === 0) return;
    // closeThen runs this instead of onClose, so close too
    closeThen(() => {
      onImported(applyGOODImport(data, selected));
      onClose();
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div ref={backdropRef} className="fixed inset-0 bg-black/55 backdrop-blur-sm" onClick={close} />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        className="glass-card glass-card--lg glass-card--raised relative z-10 w-full max-w-md p-6 text-white"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <span className="glass-chip h-10 w-10 shrink-0 justify-center rounded-xl text-cyan-300">
              <FileUp className="h-5 w-5" />
            </span>
            <div className="space-y-1 pt-0.5">
              <h2 id={`${id}-title`} className="text-base font-bold tracking-tight text-white">
                Import a GOOD file
              </h2>
              <p className="text-xs leading-relaxed text-white/70">
                From Genshin Optimizer, Inventory Kamera or any tool that exports GOOD. It stays
                in this browser.
              </p>
            </div>
          </div>
          <button type="button" onClick={close} className="glass-icon-btn h-8 w-8 rounded-lg" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          className="sr-only"
          aria-label="GOOD file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void readFile(file);
            e.target.value = "";
          }}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void readFile(file);
          }}
          className={`glass-well mt-5 flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed px-4 py-6 text-center transition-colors ${dragging ? "border-cyan-300/70" : "border-white/20 hover:border-white/40"}`}
        >
          <FileJson className="h-7 w-7 text-cyan-300" />
          <span className="text-sm font-bold">{fileName ?? "Choose or drop a .json file"}</span>
          {data && (
            <span className="text-[11px] text-white/60">
              {data.source ? `From ${data.source}, ` : ""}GOOD v{data.version}
            </span>
          )}
        </button>

        {error && (
          <p role="alert" className="mt-3 flex items-start gap-2 text-xs text-rose-300">
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
          </p>
        )}

        {data && (
          <fieldset className="mt-4 space-y-2">
            <legend className="mb-2 text-xs font-semibold text-white/80">What to import</legend>
            {SECTIONS.map((section) => {
              const count = sectionCount(data, section.key);
              if (!count) return null;
              return (
                <label
                  key={section.key}
                  className="glass-chip flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(section.key)}
                    onChange={() => toggle(section.key)}
                    className="mt-0.5 h-4 w-4 accent-primary"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-white">
                      {section.label} <span className="font-mono text-cyan-300">{count}</span>
                    </span>
                    <span className="block text-[11px] text-white/60">{section.effect}</span>
                  </span>
                </label>
              );
            })}
            {data.skipped > 0 && (
              <p className="pt-1 text-[11px] text-amber-300">
                {data.skipped} {data.skipped === 1 ? "entry" : "entries"} couldn&apos;t be read and will be
                skipped.
              </p>
            )}
          </fieldset>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={close} className="glass-btn px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={!data || selected.size === 0}
            className="glass-btn glass-btn--primary px-4 py-2 text-sm font-bold disabled:pointer-events-none disabled:opacity-50"
          >
            Import
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
