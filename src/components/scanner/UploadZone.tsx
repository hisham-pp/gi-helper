"use client";

import React, { useState } from "react";
import { Upload, Sparkles } from "lucide-react";
import { ScanningAnimation, ScanningFileItem } from "./ScanningAnimation";

export interface UploadZoneProps {
  isScanning: boolean;
  progress: number;
  statusMessage?: string;
  activeImageSrc?: string | null;
  activeFileName?: string;
  fileIndex?: number;
  totalFiles?: number;
  providerDisplayName?: string;
  modelName?: string;
  scanningFiles?: ScanningFileItem[];
  onFilesSelected: (files: FileList | File[]) => void;
  onSelectThumbnail?: (index: number) => void;
}

export function UploadZone({
  isScanning,
  progress,
  statusMessage,
  activeImageSrc,
  activeFileName,
  fileIndex,
  totalFiles,
  providerDisplayName,
  modelName,
  scanningFiles,
  onFilesSelected,
  onSelectThumbnail,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isScanning) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (isScanning) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
    }
  };

  const handleTrySample = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isScanning || isLoadingSample) return;

    try {
      setIsLoadingSample(true);
      const res = await fetch(
        "/samples/test-set-01/GenshinImpact_20261009_220714.jpg",
      );
      if (!res.ok) throw new Error("Sample file not found");
      const blob = await res.blob();
      const file = new File([blob], "GenshinImpact_Sample_Inventory.jpg", {
        type: "image/jpeg",
      });
      onFilesSelected([file]);
    } catch (err) {
      console.error("Failed to load sample image:", err);
    } finally {
      setIsLoadingSample(false);
    }
  };

  return (
    <div
      className="group relative overflow-hidden rounded-[2rem] border-[0.5px] border-b-white/5 border-l-white/20 border-r-white/5 border-t-white/30 bg-gradient-to-br from-white/10 via-white/5 to-black/20 p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-2xl transition-all duration-500 hover:bg-white/10 md:p-8"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isScanning ? (
        <ScanningAnimation
          isScanning={isScanning}
          progress={progress}
          statusMessage={statusMessage}
          activeImageSrc={activeImageSrc}
          activeFileName={activeFileName}
          fileIndex={fileIndex}
          totalFiles={totalFiles}
          providerDisplayName={providerDisplayName}
          modelName={modelName}
          scanningFiles={scanningFiles}
          onSelectThumbnail={onSelectThumbnail}
        />
      ) : (
        <label
          htmlFor="screenshot-upload"
          className={`relative z-10 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-all duration-300 md:p-12 ${
            isDragging
              ? "scale-[0.99] border-cyan-400 bg-cyan-950/30 shadow-[inset_0_0_40px_rgba(6,182,212,0.3)]"
              : "border-white/20 bg-black/10 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] hover:border-white/40 hover:bg-black/20 hover:shadow-[inset_0_0_30px_rgba(0,0,0,0.3)]"
          }`}
        >
          <div className="flex flex-col items-center space-y-5 text-center">
            <div className="mb-2 rounded-full border border-b-transparent border-l-white/20 border-r-transparent border-t-white/30 bg-gradient-to-br from-primary/30 to-primary/10 p-5 text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_16px_rgba(0,0,0,0.3)] backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
              <Upload className="h-10 w-10 text-cyan-300 drop-shadow-md" />
            </div>
            <span className="text-on-surface text-2xl font-bold tracking-tight drop-shadow-sm">
              Click to upload or drag & drop
            </span>
            <span className="text-on-surface/80 max-w-sm text-sm font-medium drop-shadow-sm">
              Select multiple inventory screenshots to process them all at once.
              For best results, use uncompressed 16:9 images.
            </span>

            {/* Quick Demo Sample Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleTrySample}
                disabled={isLoadingSample}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-950/40 px-4 py-2 text-xs font-semibold text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.2)] backdrop-blur-md transition-all hover:scale-105 hover:bg-cyan-900/60 hover:text-white active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
                <span>
                  {isLoadingSample
                    ? "Loading sample..."
                    : "Try Sample Screenshot (Demo Scan)"}
                </span>
              </button>
            </div>
          </div>
          <input
            id="screenshot-upload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleChange}
            disabled={isScanning}
          />
        </label>
      )}
    </div>
  );
}
