"use client";

import React from "react";
import { Upload } from "lucide-react";
import { SUPPORTED_IMAGE_TYPES } from "@gi/grid-detector";

interface UploadZoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  onSampleSelected: (filename: string) => void;
  sampleList: string[];
}

export function UploadZone({
  onFilesSelected,
  onSampleSelected,
  sampleList,
}: UploadZoneProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files) onFilesSelected(e.dataTransfer.files);
        }}
        className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-black/20 p-6 text-center transition-all hover:border-primary hover:bg-black/30 md:col-span-8"
      >
        <Upload className="mb-2 h-7 w-7 text-primary transition-transform group-hover:scale-110" />
        <p className="text-sm font-bold text-white">
          Drag & drop screenshots here, or paste from clipboard (Ctrl+V)
        </p>
        <p className="mt-1 text-xs text-white/60">
          PNG, JPEG, WebP, BMP or GIF up to 40 MB. Cards, rows and columns are
          detected automatically.
        </p>
        <label className="mt-3 cursor-pointer rounded-xl bg-primary/20 px-4 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary/30">
          <span>Browse Local Images</span>
          <input
            type="file"
            multiple
            accept={SUPPORTED_IMAGE_TYPES.join(",")}
            className="hidden"
            onChange={(e) => {
              if (e.target.files) onFilesSelected(Array.from(e.target.files));
              // Allow selecting the same file again later.
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {/* Quick-Add Sample Screenshots */}
      <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-black/20 p-4 md:col-span-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-white/70">
            Quick Test Samples
          </span>
          <p className="mt-0.5 text-xs text-white/50">
            Instantly load test captures into this session
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {sampleList.map((sample, idx) => (
            <button
              key={sample}
              onClick={() => onSampleSelected(sample)}
              className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/80 transition-all hover:border-primary hover:bg-primary/20 hover:text-white"
            >
              Sample #{idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
