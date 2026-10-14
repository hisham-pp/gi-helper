/**
 * Video scanner: recognises the materials in a screen recording of the
 * inventory by scanning the frames where scrolling settles, on-device.
 *
 * - `scanVideo` — browser API (two <video> elements + material scan workers).
 * - `KeyframePicker`, `planGapFills` — pure frame selection (used by tests).
 * - `SightingMerger` — pure merging of per-frame cards with quantity voting.
 */
export {
  scanVideo,
  lockRegion,
  MAX_SCANNED_FRAMES,
  type VideoScanOptions,
  type VideoScanProgress,
  type VideoScanResult,
  type VideoScanStage,
  type VideoFrameEvent,
  type VideoMaterial,
} from "./scan-video";
export {
  KeyframePicker,
  DEFAULT_KEYFRAME_OPTIONS,
  frameDifference,
  pickBetween,
  planGapFills,
  probeInterval,
  probeTimes,
  type CoverageFrame,
  type KeyframeOptions,
  type ProbeSample,
} from "./keyframes";
export { SightingMerger, sightingKey, type MergedMaterial, type Sighting } from "./merge";
export {
  VideoScanError,
  isVideoScanError,
  isVideoFile,
  validateVideoFile,
  MAX_VIDEO_BYTES,
  MAX_VIDEO_SECONDS,
  type VideoScanErrorCode,
} from "./video";
