/**
 * Reading frames from a recording with a hidden <video> element: validation,
 * opening, precise seeking, tiny grayscale thumbnails for motion analysis and
 * full-resolution bitmaps for scanning. Browser only.
 */
import { MAX_IMAGE_PIXELS, MAX_IMAGE_SIDE, MIN_IMAGE_SIDE } from "../grid-detector/engine/image";

export type VideoScanErrorCode =
  | "EMPTY_FILE"
  | "UNSUPPORTED_FILE_TYPE"
  | "FILE_TOO_LARGE"
  | "DECODE_FAILED"
  | "VIDEO_TOO_LONG"
  | "IMAGE_TOO_SMALL"
  | "IMAGE_TOO_LARGE"
  | "CANCELLED";

/** Client-safe error: `message` is written for end users. */
export class VideoScanError extends Error {
  readonly code: VideoScanErrorCode;

  constructor(code: VideoScanErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = "VideoScanError";
    this.code = code;
    if (cause !== undefined) {
      (this as { cause?: unknown }).cause = cause;
    }
  }
}

export function isVideoScanError(err: unknown): err is VideoScanError {
  return (
    err instanceof VideoScanError ||
    (typeof err === "object" &&
      err !== null &&
      (err as { name?: unknown }).name === "VideoScanError" &&
      typeof (err as { code?: unknown }).code === "string")
  );
}

/** 2 GB: recordings are read straight from disk, never loaded into memory. */
export const MAX_VIDEO_BYTES = 2 * 1024 * 1024 * 1024;
/** 10 minutes: far longer than scrolling through any inventory. */
export const MAX_VIDEO_SECONDS = 10 * 60;

const VIDEO_EXTENSIONS = ["mp4", "m4v", "mov", "webm", "mkv", "avi", "3gp"];

/** True for files that look like a video (by MIME type, or extension when the type is missing). */
export function isVideoFile(file: { type: string; name?: string }): boolean {
  if (file.type.toLowerCase().startsWith("video/")) return true;
  const ext = file.name?.split(".").pop()?.toLowerCase();
  return !!ext && VIDEO_EXTENSIONS.includes(ext);
}

export function validateVideoFile(file: { type: string; size: number; name?: string }): void {
  if (file.size === 0) throw new VideoScanError("EMPTY_FILE", "The file is empty.");
  if (!isVideoFile(file)) {
    throw new VideoScanError("UNSUPPORTED_FILE_TYPE", "Unsupported file type. Use a video such as MP4 or WebM.");
  }
  if (file.size > MAX_VIDEO_BYTES) {
    throw new VideoScanError(
      "FILE_TOO_LARGE",
      `The video is too large (${(file.size / 1024 / 1024 / 1024).toFixed(1)} GB). The limit is 2 GB.`,
    );
  }
}

const cancelled = () => new VideoScanError("CANCELLED", "Scanning was cancelled.");
const unreadable = (cause?: unknown) =>
  new VideoScanError(
    "DECODE_FAILED",
    "This video can't be played by your browser. Try an MP4 (H.264) or WebM recording.",
    cause,
  );

/** No frame for this long while seeking means the decoder is stuck. */
const SEEK_TIMEOUT_MS = 15_000;

type AnyCanvas = OffscreenCanvas | HTMLCanvasElement;
type AnyContext = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;

function createCanvas(width: number, height: number): { canvas: AnyCanvas; ctx: AnyContext } {
  let canvas: AnyCanvas;
  if (typeof OffscreenCanvas !== "undefined") {
    canvas = new OffscreenCanvas(width, height);
  } else {
    canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = canvas.getContext("2d", { willReadFrequently: true }) as AnyContext | null;
  if (!ctx) throw new VideoScanError("DECODE_FAILED", "Could not create a canvas to read the video.");
  return { canvas, ctx };
}

/** One <video> element over a recording. Not reentrant: await each call before the next. */
export class VideoFrameSource {
  readonly duration: number;
  readonly width: number;
  readonly height: number;
  private thumbCanvas: { canvas: AnyCanvas; ctx: AnyContext; width: number; height: number } | null = null;

  private constructor(private readonly video: HTMLVideoElement) {
    this.duration = video.duration;
    this.width = video.videoWidth;
    this.height = video.videoHeight;
  }

  /** Loads the video's metadata. `url` is an object URL owned by the caller. */
  static async open(url: string, signal?: AbortSignal): Promise<VideoFrameSource> {
    if (signal?.aborted) throw cancelled();
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.crossOrigin = "anonymous";
    try {
      await waitFor(video, "loadedmetadata", signal, () => {
        video.src = url;
      });
      // Recordings made with MediaRecorder often lack a duration until the end is reached.
      if (!Number.isFinite(video.duration)) {
        await waitFor(video, "seeked", signal, () => {
          video.currentTime = 1e9;
        });
      }
    } catch (err) {
      release(video);
      throw err;
    }

    const source = new VideoFrameSource(video);
    try {
      source.validate();
    } catch (err) {
      source.dispose();
      throw err;
    }
    return source;
  }

  private validate() {
    const { width, height, duration } = this;
    if (!width || !height) throw unreadable();
    if (!Number.isFinite(duration) || duration <= 0) throw unreadable();
    if (duration > MAX_VIDEO_SECONDS) {
      throw new VideoScanError(
        "VIDEO_TOO_LONG",
        `The video is too long (${Math.round(duration / 60)} min). Trim it to ${MAX_VIDEO_SECONDS / 60} minutes or less.`,
      );
    }
    if (width < MIN_IMAGE_SIDE || height < MIN_IMAGE_SIDE) {
      throw new VideoScanError("IMAGE_TOO_SMALL", `The video is too small (${width}×${height}px).`);
    }
    if (width > MAX_IMAGE_SIDE || height > MAX_IMAGE_SIDE || width * height > MAX_IMAGE_PIXELS) {
      throw new VideoScanError(
        "IMAGE_TOO_LARGE",
        `The video resolution is too high (${width}×${height}px). The limit is ${MAX_IMAGE_SIDE}px per side.`,
      );
    }
  }

  /** Moves to `time` (s) and waits until that frame can be drawn. */
  async seek(time: number, signal?: AbortSignal): Promise<void> {
    const t = Math.max(0, Math.min(time, this.duration));
    await waitFor(this.video, "seeked", signal, () => {
      this.video.currentTime = t;
    });
  }

  /** Grayscale thumbnail of the current frame, `width` pixels wide. */
  thumbnail(width = 128): Uint8Array {
    const height = Math.max(1, Math.round((width * this.height) / this.width));
    if (!this.thumbCanvas || this.thumbCanvas.width !== width) {
      this.thumbCanvas = { ...createCanvas(width, height), width, height };
    }
    const { ctx } = this.thumbCanvas;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "low";
    ctx.drawImage(this.video, 0, 0, width, height);
    const rgba = ctx.getImageData(0, 0, width, height).data;
    const gray = new Uint8Array(width * height);
    for (let i = 0, p = 0; i < gray.length; i++, p += 4) {
      gray[i] = (rgba[p] * 77 + rgba[p + 1] * 150 + rgba[p + 2] * 29) >> 8;
    }
    return gray;
  }

  /** The current frame at full resolution. The caller must close it. */
  async frame(): Promise<ImageBitmap> {
    try {
      return await createImageBitmap(this.video);
    } catch (err) {
      throw unreadable(err);
    }
  }

  dispose(): void {
    release(this.video);
    if (this.thumbCanvas) {
      this.thumbCanvas.canvas.width = 0;
      this.thumbCanvas.canvas.height = 0;
      this.thumbCanvas = null;
    }
  }
}

/** Downscaled JPEG of a frame, for showing progress. */
export async function encodePreview(bitmap: ImageBitmap, maxWidth = 960): Promise<Blob> {
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const { canvas, ctx } = createCanvas(width, height);
  try {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, width, height);
    if ("convertToBlob" in canvas) return await canvas.convertToBlob({ type: "image/jpeg", quality: 0.82 });
    return await new Promise<Blob>((resolve, reject) =>
      (canvas as HTMLCanvasElement).toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Could not encode the preview."))),
        "image/jpeg",
        0.82,
      ),
    );
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}

/** Runs `start` and resolves on `event`; rejects on a media error, a timeout or `signal`. */
function waitFor(video: HTMLVideoElement, event: string, signal: AbortSignal | undefined, start: () => void) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(cancelled());
      return;
    }
    const cleanup = () => {
      clearTimeout(timer);
      video.removeEventListener(event, onEvent);
      video.removeEventListener("error", onError);
      signal?.removeEventListener("abort", onAbort);
    };
    const onEvent = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(unreadable(video.error));
    };
    const onAbort = () => {
      cleanup();
      reject(cancelled());
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(unreadable(new Error(`Timed out waiting for "${event}".`)));
    }, SEEK_TIMEOUT_MS);
    video.addEventListener(event, onEvent, { once: true });
    video.addEventListener("error", onError, { once: true });
    signal?.addEventListener("abort", onAbort, { once: true });
    start();
  });
}

/** Detaches the element from its source so the browser frees the decoder right away. */
function release(video: HTMLVideoElement) {
  video.pause();
  video.removeAttribute("src");
  video.load();
}
