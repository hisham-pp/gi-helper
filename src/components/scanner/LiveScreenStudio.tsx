"use client";

import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, ScreenShare, X } from "lucide-react";

export interface LiveScreenStudioProps {
  stream: MediaStream | null;
  elapsedSeconds: number;
  isRecording?: boolean;
  onStopAndScanVideo: () => void;
  onCancel: () => void;
  accent?: "teal" | "cyan";
  tipText?: string;
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function LiveScreenStudio({
  stream,
  elapsedSeconds,
  isRecording = true,
  onStopAndScanVideo,
  onCancel,
  accent = "teal",
  tipText = "Open Genshin Impact & scroll through your bag (Materials, Weapons, or Artifacts). Click 'Stop & Scan' when finished.",
}: LiveScreenStudioProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  // Attach stream to video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Video autoPlay thwarted:", err);
      });
    }

    const handleLoadedMetadata = () => {
      setDimensions({
        width: video.videoWidth,
        height: video.videoHeight,
      });
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      if (video.srcObject) {
        video.srcObject = null;
      }
    };
  }, [stream]);

  return (
    <div className="glass-pane relative flex min-h-[320px] w-full flex-col overflow-hidden p-3 shadow-2xl sm:min-h-[460px] sm:p-5">
      {/* Top HUD Bar */}
      <div className="relative z-20 mb-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
        {/* Left: Recording Indicator */}
        <div className="flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-950/40 px-3 py-1 text-rose-200 backdrop-blur-md">
          <span className="relative flex h-2.5 w-2.5">
            {isRecording && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            )}
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
          </span>
          <span className="font-semibold tracking-wider uppercase text-[10px] sm:text-xs">
            {isRecording ? "Recording Screen" : "Live Stream"}
          </span>
        </div>

        {/* Center: Source info & dimensions */}
        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3.5 py-1 text-[11px] text-white/80 backdrop-blur-md sm:flex">
          <ScreenShare className="h-3.5 w-3.5 text-cyan-300" />
          <span>Screen / Window Share</span>
          {dimensions && (
            <span className="font-mono text-white/50">
              · {dimensions.width}×{dimensions.height}
            </span>
          )}
        </div>

        {/* Right: Elapsed Timer */}
        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1 font-mono text-xs font-bold text-white backdrop-blur-md">
          <span className="text-white/60">Time:</span>
          <span>{formatDuration(elapsedSeconds)}</span>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="relative flex min-h-[220px] flex-1 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/85 sm:min-h-[340px]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full max-h-[360px] w-full object-contain sm:max-h-[460px]"
        />

        {/* Sci-Fi Corner Reticles */}
        <div
          className="pointer-events-none absolute inset-3 z-10 sm:inset-4"
          aria-hidden="true"
        >
          {/* Top-Left */}
          <div className="absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-cyan-400/70 sm:h-6 sm:w-6" />
          {/* Top-Right */}
          <div className="absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-cyan-400/70 sm:h-6 sm:w-6" />
          {/* Bottom-Left */}
          <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-cyan-400/70 sm:h-6 sm:w-6" />
          {/* Bottom-Right */}
          <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-cyan-400/70 sm:h-6 sm:w-6" />
        </div>

        {/* Centered Scroll Hint (Floating Pill) */}
        <div className="pointer-events-none absolute top-3 left-1/2 z-10 w-[92%] -translate-x-1/2 sm:top-5 sm:w-auto">
          <div className="rounded-full border border-white/15 bg-slate-950/75 px-3.5 py-1.5 text-center text-[10px] text-white/90 shadow-xl backdrop-blur-md sm:text-xs">
            <span className="text-cyan-300 font-semibold">Tip: </span>
            <span>{tipText}</span>
          </div>
        </div>
      </div>

      {/* Bottom Floating Control Dock */}
      <div className="relative z-20 mt-3 flex flex-wrap items-center justify-center gap-2 sm:mt-4 sm:gap-3">
        {/* Primary Action: Stop & Scan Recording */}
        <button
          type="button"
          onClick={onStopAndScanVideo}
          className={`group flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold text-white shadow-xl transition-all sm:text-sm ${
            accent === "teal"
              ? "bg-gradient-to-r from-teal-500 to-cyan-500 shadow-[0_0_24px_rgba(20,184,166,0.5)] hover:scale-105 active:scale-95"
              : "bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_24px_rgba(6,182,212,0.5)] hover:scale-105 active:scale-95"
          }`}
        >
          <CheckCircle2 className="h-4 w-4 drop-shadow transition-transform group-hover:scale-110" />
          <span>Stop &amp; Scan Recording</span>
        </button>

        {/* Cancel Stream */}
        <button
          type="button"
          onClick={onCancel}
          className="glass-btn flex items-center gap-1.5 px-3.5 py-2 text-xs text-rose-200 hover:text-white sm:text-sm"
          title="Stop streaming without scanning"
        >
          <X className="h-3.5 w-3.5" />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  );
}
