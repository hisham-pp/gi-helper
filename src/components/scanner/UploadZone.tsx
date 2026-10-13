"use client";

import React, { useState } from "react";
import { Upload, Sparkles } from "lucide-react";
import { ScanningAnimation, ScanningFileItem } from "./ScanningAnimation";

export interface UploadZoneProps {
  isScanning?: boolean;
  progress?: number;
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
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  inputId?: string;
  sampleButtonText?: string;
  showSampleButton?: boolean;
  accent?: "teal" | "cyan";
}

export function UploadZone({
  isScanning = false,
  progress = 0,
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
  icon,
  title = "Click to upload or drag & drop",
  description = "Select multiple inventory screenshots to process them all at once. For best results, use uncompressed 16:9 images.",
  inputId = "screenshot-upload",
  sampleButtonText = "Try Sample Screenshot (Demo Scan)",
  showSampleButton = true,
  accent = "cyan",
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const isTeal = accent === "teal";

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
      className="group relative overflow-hidden rounded-2xl border-[0.5px] border-b-white/5 border-l-white/20 border-r-white/5 border-t-white/30 bg-gradient-to-br from-white/10 via-white/5 to-black/20 p-3.5 sm:p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-2xl transition-all duration-500 hover:bg-white/10"
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
          htmlFor={inputId}
          className={`relative z-10 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 sm:p-7 transition-all duration-300 ${
            isDragging
              ? isTeal
                ? "scale-[0.99] border-teal-400 bg-teal-950/30 shadow-[inset_0_0_40px_rgba(20,184,166,0.3)]"
                : "scale-[0.99] border-cyan-400 bg-cyan-950/30 shadow-[inset_0_0_40px_rgba(6,182,212,0.3)]"
              : "border-white/20 bg-black/10 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] hover:border-white/40 hover:bg-black/20 hover:shadow-[inset_0_0_30px_rgba(0,0,0,0.3)]"
          }`}
        >
          <div className="flex flex-col items-center space-y-3 text-center sm:space-y-4">
            <div className="rounded-full border border-b-transparent border-l-white/20 border-r-transparent border-t-white/30 bg-gradient-to-br from-primary/30 to-primary/10 p-3.5 text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_16px_rgba(0,0,0,0.3)] backdrop-blur-md transition-transform duration-300 group-hover:scale-105">
              {icon || (
                <Upload className="h-7 w-7 sm:h-8 sm:w-8 text-cyan-300 drop-shadow-md" />
              )}
            </div>
            <span className="text-on-surface text-lg sm:text-xl font-bold tracking-tight drop-shadow-sm">
              {title}
            </span>
            <span className="text-on-surface/80 max-w-sm text-xs sm:text-sm font-medium drop-shadow-sm">
              {description}
            </span>

            {/* Quick Demo Sample Action */}
            {showSampleButton && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleTrySample}
                  disabled={isLoadingSample}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ${
                    isTeal
                      ? "border-teal-400/40 bg-teal-950/40 text-teal-200 shadow-[0_0_15px_rgba(20,184,166,0.2)] hover:bg-teal-900/60 hover:text-white"
                      : "border-cyan-400/40 bg-cyan-950/40 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:bg-cyan-900/60 hover:text-white"
                  }`}
                >
                  <Sparkles
                    className={`h-3 w-3 animate-pulse ${
                      isTeal ? "text-teal-400" : "text-cyan-400"
                    }`}
                  />
                  <span>
                    {isLoadingSample ? "Loading sample..." : sampleButtonText}
                  </span>
                </button>
              </div>
            )}
          </div>
          <input
            id={inputId}
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
