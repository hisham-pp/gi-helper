"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export type StreamSourceType = "screen" | "camera";

export interface ScreenShareState {
  stream: MediaStream | null;
  isStreaming: boolean;
  isRecording: boolean;
  sourceType: StreamSourceType | null;
  elapsedSeconds: number;
  error: string | null;
  videoDimensions: { width: number; height: number } | null;
}

/** Check if navigator.mediaDevices.getDisplayMedia is available */
export function canUseDisplayMedia(): boolean {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getDisplayMedia === "function"
  );
}

/** Check if user is on a mobile device (Android, iOS, etc.) */
export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent || "",
  );
}

/** Determine best supported MIME type for video recording */
export function getSupportedVideoMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4;codecs=avc1",
    "video/mp4",
  ];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c)) return c;
  }
  return "";
}

/** Capture a single frame from HTMLVideoElement as a JPEG File */
export async function snapPhotoFromVideo(video: HTMLVideoElement): Promise<File> {
  const width = video.videoWidth || 1920;
  const height = video.videoHeight || 1080;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas context for frame capture.");
  ctx.drawImage(video, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create snapshot from video stream."));
          return;
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const file = new File([blob], `Screen_Capture_${timestamp}.jpg`, {
          type: "image/jpeg",
        });
        resolve(file);
      },
      "image/jpeg",
      0.95,
    );
  });
}

export interface UseScreenShareOptions {
  /** Called when stream is ended by user (e.g. browser's native floating "Stop sharing" bar) */
  onAutoStop?: (file: File) => void;
}

export function useScreenShare(options: UseScreenShareOptions = {}) {
  const { onAutoStop } = options;

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [sourceType, setSourceType] = useState<StreamSourceType | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mimeTypeRef = useRef<string>("");
  const autoStopTriggeredRef = useRef(false);

  // Keep streamRef updated
  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
  }, []);

  const resetState = useCallback(() => {
    clearTimer();
    stopTracks();
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      try {
        recorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    recorderRef.current = null;
    chunksRef.current = [];
    setStream(null);
    setSourceType(null);
    setIsStreaming(false);
    setIsRecording(false);
    setElapsedSeconds(0);
    setVideoDimensions(null);
    autoStopTriggeredRef.current = false;
  }, [clearTimer, stopTracks]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      resetState();
    };
  }, [resetState]);

  const startStreamRecording = useCallback(
    (activeStream: MediaStream, type: StreamSourceType) => {
      resetState();
      setError(null);
      setStream(activeStream);
      streamRef.current = activeStream;
      setSourceType(type);
      setIsStreaming(true);
      autoStopTriggeredRef.current = false;

      // Extract video track dimensions
      const videoTrack = activeStream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        if (settings.width && settings.height) {
          setVideoDimensions({ width: settings.width, height: settings.height });
        }
      }

      // Initialize MediaRecorder
      const supportedMime = getSupportedVideoMimeType();
      mimeTypeRef.current = supportedMime;
      chunksRef.current = [];

      try {
        const recorder = new MediaRecorder(
          activeStream,
          supportedMime ? { mimeType: supportedMime } : undefined,
        );

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        recorderRef.current = recorder;
        recorder.start(500); // chunk every 500ms
        setIsRecording(true);
      } catch (recErr) {
        console.warn("MediaRecorder start failed:", recErr);
        // We can still stream without recording if needed
      }

      // Elapsed seconds counter
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      // Listen to track.onended (e.g. browser native "Stop sharing" button)
      if (videoTrack) {
        videoTrack.onended = async () => {
          if (autoStopTriggeredRef.current) return;
          autoStopTriggeredRef.current = true;

          // If we have some recorded time, auto-finish and trigger onAutoStop
          if (recorderRef.current && recorderRef.current.state !== "inactive") {
            try {
              const file = await finalizeRecording();
              if (file && file.size > 1000 && onAutoStop) {
                onAutoStop(file);
                return;
              }
            } catch (err) {
              console.error("Auto stop recording error:", err);
            }
          }
          resetState();
        };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onAutoStop, resetState],
  );

  /** Helper to finalize recording and return File */
  const finalizeRecording = useCallback(async (): Promise<File> => {
    clearTimer();
    return new Promise<File>((resolve, reject) => {
      const recorder = recorderRef.current;
      const chunks = chunksRef.current;
      const mime = mimeTypeRef.current || "video/webm";
      const ext = mime.includes("mp4") ? "mp4" : "webm";
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

      const finish = () => {
        stopTracks();
        const blob = new Blob(chunks, { type: mime });
        const file = new File([blob], `Screen_Share_${timestamp}.${ext}`, {
          type: mime,
        });
        resetState();
        resolve(file);
      };

      if (!recorder || recorder.state === "inactive") {
        if (chunks.length > 0) {
          finish();
        } else {
          stopTracks();
          resetState();
          reject(new Error("No recording data captured."));
        }
        return;
      }

      recorder.onstop = () => {
        finish();
      };

      try {
        recorder.stop();
      } catch (err) {
        reject(err);
      }
    });
  }, [clearTimer, resetState, stopTracks]);

  /** Start native Screen Sharing via getDisplayMedia */
  const startScreenShare = useCallback(async () => {
    if (!canUseDisplayMedia()) {
      setIsMobileModalOpen(true);
      return;
    }

    try {
      setError(null);
      // Attempt with displaySurface constraint for desktop
      let activeStream: MediaStream;
      try {
        activeStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: "window" as unknown as undefined,
            frameRate: { ideal: 30, max: 60 },
          },
          audio: false,
        });
      } catch (err: unknown) {
        // Retry with basic constraint if displaySurface was rejected
        if (
          err instanceof Error &&
          (err.name === "OverconstrainedError" || err.name === "TypeError")
        ) {
          activeStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: false,
          });
        } else {
          throw err;
        }
      }

      startStreamRecording(activeStream, "screen");
      toast.info("Screen sharing active! Open Genshin and scroll your bag.");
    } catch (err: unknown) {
      if (err instanceof Error && (err.name === "NotAllowedError" || err.name === "AbortError")) {
        // User cancelled picker
        return;
      }
      console.error("Screen sharing error:", err);
      // If mobile or unsupported, offer mobile assistant
      if (isMobileDevice()) {
        setIsMobileModalOpen(true);
      } else {
        const msg = err instanceof Error ? err.message : "Failed to start screen share.";
        setError(msg);
        toast.error(`Screen share error: ${msg}`);
      }
    }
  }, [startStreamRecording]);

  /** Start Camera stream (ideal for scanning another screen from a mobile device) */
  const startCameraCapture = useCallback(
    async (facingMode: "environment" | "user" = "environment") => {
      if (!navigator.mediaDevices?.getUserMedia) {
        toast.error("Camera access is not supported on this browser.");
        return;
      }

      try {
        setError(null);
        let activeStream: MediaStream;
        try {
          activeStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: facingMode },
              width: { ideal: 1920, min: 1280 },
              height: { ideal: 1080, min: 720 },
            },
            audio: false,
          });
        } catch {
          // Fallback to basic video constraint
          activeStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        startStreamRecording(activeStream, "camera");
        setIsMobileModalOpen(false);
        toast.info("Camera viewfinder open! Point at your screen.");
      } catch (err: unknown) {
        if (err instanceof Error && (err.name === "NotAllowedError" || err.name === "AbortError")) {
          return;
        }
        console.error("Camera capture error:", err);
        const msg = err instanceof Error ? err.message : "Could not access camera.";
        setError(msg);
        toast.error(`Camera error: ${msg}`);
      }
    },
    [startStreamRecording],
  );

  /** Stop recording & return File for video scanner */
  const stopAndGetVideo = useCallback(async (): Promise<File | null> => {
    try {
      autoStopTriggeredRef.current = true;
      const file = await finalizeRecording();
      return file;
    } catch (err) {
      console.error("Failed to stop recording:", err);
      resetState();
      return null;
    }
  }, [finalizeRecording, resetState]);

  /** Snap single frame as JPEG File for image scanner */
  const snapCurrentFrame = useCallback(
    async (videoEl: HTMLVideoElement): Promise<File | null> => {
      try {
        const file = await snapPhotoFromVideo(videoEl);
        resetState();
        return file;
      } catch (err) {
        console.error("Failed to snap frame:", err);
        toast.error("Could not capture frame from stream.");
        return null;
      }
    },
    [resetState],
  );

  /** Cancel streaming and reset */
  const cancelStream = useCallback(() => {
    resetState();
    toast.info("Screen capture ended.");
  }, [resetState]);

  return {
    stream,
    sourceType,
    isStreaming,
    isRecording,
    elapsedSeconds,
    error,
    videoDimensions,
    isMobileModalOpen,
    setIsMobileModalOpen,
    startScreenShare,
    startCameraCapture,
    stopAndGetVideo,
    snapCurrentFrame,
    cancelStream,
    canUseDisplayMedia: canUseDisplayMedia(),
    isMobile: isMobileDevice(),
  };
}
