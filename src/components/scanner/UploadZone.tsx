"use client";

import React, { useRef, useState } from "react";
import { FolderOpen, ImageIcon, ScreenShare } from "lucide-react";
import { markSampleFile } from "@/lib/stats";
import { ScanningAnimation, ScanningFileItem } from "./ScanningAnimation";
import { ScanUploadIcon } from "./ScanUploadIcon";

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
  subDescription?: string;
  inputId?: string;
  sampleButtonText?: string;
  /** Icon shown on the sample button; defaults to a neutral image icon. */
  sampleButtonIcon?: React.ReactNode;
  showSampleButton?: boolean;
  /** Screen share action callback */
  onShareScreen?: () => void;
  shareScreenButtonText?: string;
  shareScreenButtonIcon?: React.ReactNode;
  showShareScreenButton?: boolean;
  /** Use a shorter upload panel on compact mobile layouts. */
  compactOnMobile?: boolean;
  /** File loaded by the sample button; defaults to a sample screenshot. */
  sample?: { url: string; fileName: string; type: string };
  /** `accept` of the file input; defaults to images. */
  accept?: string;
  /** Allow selecting several files at once. */
  multiple?: boolean;
  /** Passed to the scanning view (see ScanningAnimation). */
  scanEmptyMessage?: string;
  scanOverlay?: React.ReactNode;
  scanFooter?: React.ReactNode;
  accent?: "teal" | "cyan";
}

const DEFAULT_SAMPLE = {
  url: "/samples/test-set-01/GenshinImpact_20261009_220714.jpg",
  fileName: "GenshinImpact_Sample_Inventory.jpg",
  type: "image/jpeg",
};

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
  description = "Select multiple inventory screenshots to process them all at once.",
  subDescription = "For best results, use uncompressed 16:9 images.",
  inputId = "screenshot-upload",
  sampleButtonText = "Try a sample",
  sampleButtonIcon,
  showSampleButton = true,
  onShareScreen,
  shareScreenButtonText = "Share Screen",
  shareScreenButtonIcon,
  showShareScreenButton = true,
  compactOnMobile = false,
  sample = DEFAULT_SAMPLE,
  accept = "image/*",
  multiple = true,
  scanEmptyMessage,
  scanOverlay,
  scanFooter,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleZoneClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, a")) return;
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isScanning) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Ignore leave events fired when moving between the zone's own children
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    setIsDragging(false);
  };

  // Feeds the pointer-following sheen and rim highlight in glass.css
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--glass-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--glass-y", `${e.clientY - rect.top}px`);
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
      const res = await fetch(sample.url);
      if (!res.ok) throw new Error("Sample file not found");
      const blob = await res.blob();
      const file = new File([blob], sample.fileName, {
        type: sample.type,
      });
      // Sample scans don't count towards the home page's scan counter
      markSampleFile(file);
      onFilesSelected([file]);
    } catch (err) {
      console.error("Failed to load sample file:", err);
    } finally {
      setIsLoadingSample(false);
    }
  };

  return (
    <div
      className="glass-pane overflow-hidden w-full touch-pan-y"
      data-dragging={isDragging}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPointerMove={handlePointerMove}
    >
      {/* Pointer-following rim highlight (styles in src/styles/glass.css) */}
      <span className="glass-spot" aria-hidden="true" />

      {isScanning ? (
        <div className="relative z-10 p-5 sm:p-7 md:p-8">
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
            emptyMessage={scanEmptyMessage}
            viewportOverlay={scanOverlay}
            footer={scanFooter}
          />
        </div>
      ) : (
        <div
          onClick={handleZoneClick}
          className={`relative z-10 flex cursor-pointer flex-col items-center justify-center text-center select-none touch-pan-y ${
            compactOnMobile
              ? "min-h-[240px] p-4 sm:min-h-[380px] sm:p-12"
              : "min-h-[340px] p-8 sm:min-h-[380px] sm:p-12"
          }`}
        >
          {/* Glass Lens Icon */}
          <div
            className={`glass-lens h-16 w-16 sm:mb-6 sm:h-[72px] sm:w-[72px] ${
              compactOnMobile ? "mb-3" : "mb-6"
            }`}
          >
            {icon || (
              <ScanUploadIcon className="relative h-7 w-7 sm:h-8 sm:w-8 text-cyan-200 drop-shadow-[0_0_8px_rgba(34,211,238,0.55)]" />
            )}
          </div>

          {/* Heading */}
          <h3
            className={`mb-2 font-semibold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] ${
              compactOnMobile ? "text-lg sm:text-2xl" : "text-xl sm:text-2xl"
            }`}
          >
            {isDragging ? "Release to upload" : title}
          </h3>

          {/* Multi-line Subtitles */}
          <div
            className={`max-w-lg space-y-1 text-xs leading-relaxed text-white/70 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)] sm:mb-7 sm:text-sm ${
              compactOnMobile ? "mb-4" : "mb-7"
            }`}
          >
            <p>{description}</p>
            {subDescription && <p className="text-white/50">{subDescription}</p>}
          </div>

          {/* Actions: the whole pane opens the picker; "Browse files" is its visible cue */}
          <div className="relative z-20 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="glass-btn glass-btn--primary"
            >
              <FolderOpen className="h-3.5 w-3.5" />
              Browse files
            </button>
            {onShareScreen && showShareScreenButton !== false && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onShareScreen();
                }}
                className="glass-btn"
              >
                <span className="inline-flex text-cyan-200 [&>svg]:h-3.5 [&>svg]:w-3.5">
                  {shareScreenButtonIcon || <ScreenShare />}
                </span>
                <span>{shareScreenButtonText}</span>
              </button>
            )}
            {showSampleButton && (
              <button
                type="button"
                onClick={handleTrySample}
                disabled={isLoadingSample}
                className="glass-btn"
              >
                <span className="inline-flex text-cyan-200 [&>svg]:h-3.5 [&>svg]:w-3.5">
                  {sampleButtonIcon || <ImageIcon />}
                </span>
                <span>
                  {isLoadingSample ? "Loading sample..." : sampleButtonText}
                </span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            id={inputId}
            type="file"
            accept={accept}
            multiple={multiple}
            className="sr-only"
            onChange={handleChange}
            disabled={isScanning}
          />
        </div>
      )}
    </div>
  );
}
