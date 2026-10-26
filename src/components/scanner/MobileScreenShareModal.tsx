"use client";

import React, { useRef } from "react";
import { createPortal } from "react-dom";
import {
  Camera,
  ChevronRight,
  Monitor,
  Smartphone,
  Video,
  X,
} from "lucide-react";
import { useModalMotion, usePauseBackground } from "@/lib/hooks";
import { canUseDisplayMedia } from "./use-screen-share";

export interface MobileScreenShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCamera: () => void;
  onSelectVideoFile: (files: FileList | File[]) => void;
  onTryDisplayMedia?: () => void;
}

export function MobileScreenShareModal({
  isOpen,
  onClose,
  onSelectCamera,
  onSelectVideoFile,
  onTryDisplayMedia,
}: MobileScreenShareModalProps) {
  usePauseBackground();
  const { dialogRef, backdropRef, close } = useModalMotion(onClose, isOpen);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const hasDisplayMedia = canUseDisplayMedia();

  const handlePickFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onSelectVideoFile(e.target.files);
      close();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity duration-300"
        onClick={close}
      />

      {/* Dialog Container */}
      <div
        ref={dialogRef}
        className="glass-card glass-card--lg glass-card--raised relative z-10 flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden text-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/20 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.3)]">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white sm:text-lg">
                Scan from Screen
              </h2>
              <p className="text-xs text-white/60">
                Choose the best scanning method for your device
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-xl p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-3.5 overflow-y-auto p-4 sm:p-6">
          {/* Option 1: Point Camera at Screen */}
          <button
            type="button"
            onClick={() => {
              close();
              onSelectCamera();
            }}
            className="group relative flex w-full flex-col items-start gap-2.5 rounded-2xl border border-teal-500/30 bg-teal-950/30 p-4 text-left transition-all hover:border-teal-400/60 hover:bg-teal-950/50 hover:shadow-[0_0_20px_rgba(20,184,166,0.25)] active:scale-[0.99]"
          >
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-teal-400/30 bg-teal-500/20 text-teal-200 shadow-[0_0_10px_rgba(20,184,166,0.3)]">
                  <Camera className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-teal-200">
                    Point Camera at Screen
                  </h3>
                  <span className="text-[10px] font-semibold text-teal-300">
                    Recommended for PC, PS5, TV, or iPad
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-teal-300" />
            </div>
            <p className="text-xs leading-relaxed text-white/70">
              Point your phone camera directly at your computer monitor or TV screen while scrolling through your inventory to scan in real-time.
            </p>
          </button>

          {/* Option 2: Upload Phone Screen Recording */}
          <div className="relative flex w-full flex-col items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:border-cyan-400/40 hover:bg-white/10">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/20 text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                  <Video className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Phone Screen Recording
                  </h3>
                  <span className="text-[10px] font-semibold text-cyan-300">
                    Playing directly on this phone
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-white/70">
              Mobile browsers cannot record other apps in the background. Use your phone’s built-in recorder:
            </p>

            {/* Quick 3-step guide */}
            <div className="w-full space-y-1.5 rounded-xl border border-white/5 bg-black/30 p-2.5 text-[11px] text-white/80">
              <div className="flex items-start gap-2">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-cyan-500/30 font-mono text-[9px] font-bold text-cyan-200">
                  1
                </span>
                <span>Swipe down for <strong>Quick Settings</strong> (Android) or <strong>Control Center</strong> (iPhone).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-cyan-500/30 font-mono text-[9px] font-bold text-cyan-200">
                  2
                </span>
                <span>Tap <strong>Screen Record</strong>, open Genshin, and scroll through your bag.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-cyan-500/30 font-mono text-[9px] font-bold text-cyan-200">
                  3
                </span>
                <span>Stop recording and tap the button below to scan.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePickFileClick}
              className="glass-btn glass-btn--primary w-full justify-center py-2 text-xs font-bold"
            >
              Select Screen Recording from Photos
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,.mp4,.mov,.webm"
              className="sr-only"
              onChange={handleFileChange}
            />
          </div>

          {/* Option 3: Browser Screen Share (if available on this browser/OS) */}
          {hasDisplayMedia && onTryDisplayMedia && (
            <button
              type="button"
              onClick={() => {
                close();
                onTryDisplayMedia();
              }}
              className="group flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/20 p-3 text-left transition-all hover:bg-white/10 hover:text-white"
            >
              <div className="flex items-center gap-2.5">
                <Monitor className="h-4 w-4 text-cyan-300" />
                <div>
                  <h4 className="text-xs font-semibold text-white/90">
                    Try Browser Screen Share
                  </h4>
                  <p className="text-[10px] text-white/50">
                    Attempt native display capture on this mobile browser
                  </p>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-white/40 group-hover:translate-x-1" />
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
