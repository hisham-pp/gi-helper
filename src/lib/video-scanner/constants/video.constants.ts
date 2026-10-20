import type { KeyframeOptions } from "../types/keyframes.types";

/**
 * Default motion analysis heuristics for keyframe selection.
 */
export const DEFAULT_KEYFRAME_OPTIONS: KeyframeOptions = {
  stillThreshold: 1.5,
  duplicateThreshold: 2.5,
};

/** Upper bound on scanned frames, preventing runaways regardless of video length. */
export const MAX_SCANNED_FRAMES = 400;

/** 2 GB maximum video upload limit (streamed directly without full buffer load). */
export const MAX_VIDEO_BYTES = 2 * 1024 * 1024 * 1024;

/** 10 minutes maximum duration. */
export const MAX_VIDEO_SECONDS = 10 * 60;

/** Share of the overall scan progress bar assigned to motion analysis (0.2 = 20%). */
export const ANALYSIS_PROGRESS_SHARE = 0.2;

/** Minimum card count required in a detected grid to lock the scanning region for subsequent frames. */
export const MIN_LOCK_CARDS = 6;

/** Panels whose thumbnails differ less than this (0–255) are treated as identical. */
export const SAME_PANEL_DIFFERENCE = 0.8;

/** Share of quantity votes a runner-up needs to trigger a flagged conflict review. */
export const CONFLICT_VOTE_SHARE = 0.34;

/** Supported video format extensions. */
export const VIDEO_EXTENSIONS = [
  "mp4",
  "m4v",
  "mov",
  "webm",
  "mkv",
  "avi",
  "3gp",
] as const;

/** Default interval in seconds between motion probe samples. */
export const DEFAULT_PROBE_INTERVAL = 0.2;
