/**
 * Choosing which frames of an inventory recording to scan.
 *
 * The video is first sampled at a fixed step into tiny grayscale thumbnails.
 * Scrolling the inventory is a series of flicks that slow down and settle, so
 * the frames worth scanning are where the picture stops changing: the local
 * minima of the frame-to-frame difference, and still stretches. Frames that
 * look like the previous pick are skipped, so a paused video is scanned once.
 *
 * Coverage does not depend on these heuristics: after scanning, two picks
 * that share no material leave a gap, filled by `planGapFills`.
 */
import { DEFAULT_KEYFRAME_OPTIONS } from "./constants/video.constants";
import type {
  CoverageFrame,
  KeyframeOptions,
  ProbeSample,
} from "./types/keyframes.types";

export { DEFAULT_KEYFRAME_OPTIONS };
export type { CoverageFrame, KeyframeOptions, ProbeSample };

/** Mean absolute difference of two equally sized grayscale thumbnails (0–255). */
export function frameDifference(a: Uint8Array, b: Uint8Array): number {
  if (a.length !== b.length)
    throw new Error("Thumbnails must have the same size.");
  if (a.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]);
  return sum / a.length;
}

/**
 * Streaming keyframe picker. Feed every sample in time order with `push`; a
 * sample is decided one step later (a local minimum needs its successor), so
 * call `finish` after the last one.
 */
export class KeyframePicker {
  readonly samples: ProbeSample[] = [];
  private readonly options: KeyframeOptions;
  private prevThumb: Uint8Array | null = null;
  /** The sample waiting for its successor before it can be judged. */
  private pending: { index: number; thumb: Uint8Array } | null = null;
  private lastPickThumb: Uint8Array | null = null;

  constructor(options: Partial<KeyframeOptions> = {}) {
    this.options = { ...DEFAULT_KEYFRAME_OPTIONS, ...options };
  }

  /** Adds the next sample; returns the index of a sample picked by it, if any. */
  push(time: number, thumb: Uint8Array): number | null {
    const motion = this.prevThumb
      ? frameDifference(thumb, this.prevThumb)
      : Infinity;
    this.prevThumb = thumb;
    const index = this.samples.length;
    this.samples.push({ time, motion });

    const pending = this.pending;
    this.pending = { index, thumb };
    if (!pending) return null;
    return this.judge(pending, motion) ? pending.index : null;
  }

  /** Judges the last sample (it has no successor); returns its index if picked. */
  finish(): number | null {
    const pending = this.pending;
    this.pending = null;
    if (!pending) return null;
    return this.judge(pending, Infinity) ? pending.index : null;
  }

  private judge(
    candidate: { index: number; thumb: Uint8Array },
    nextMotion: number,
  ): boolean {
    const { index, thumb } = candidate;
    const motion = this.samples[index].motion;
    const isFirst = index === 0;
    const isLast = nextMotion === Infinity;
    const settled =
      motion <= this.options.stillThreshold ||
      (index > 0 &&
        motion < this.samples[index - 1].motion &&
        motion <= nextMotion);
    if (!isFirst && !isLast && !settled) return false;
    if (
      this.lastPickThumb &&
      frameDifference(thumb, this.lastPickThumb) <
        this.options.duplicateThreshold
    ) {
      return false;
    }
    this.lastPickThumb = thumb;
    return true;
  }
}

/**
 * Times to scan so that consecutive scanned frames overlap. Two neighbouring
 * frames that both show inventory but share no material may have skipped
 * rows: scan the calmest sample near the middle of the gap. Returns the
 * sample indices to scan next (none once every gap is closed or can't be
 * split further).
 */
export function planGapFills(
  scanned: readonly CoverageFrame[],
  samples: readonly ProbeSample[],
  alreadyScanned: ReadonlySet<number>,
): number[] {
  const frames = [...scanned].sort((a, b) => a.time - b.time);
  const fills: number[] = [];
  for (let k = 1; k < frames.length; k++) {
    const a = frames[k - 1];
    const b = frames[k];
    if (a.materials.size === 0 || b.materials.size === 0) continue;
    if (sharesAny(a.materials, b.materials)) continue;
    const fill = pickBetween(samples, a.time, b.time, alreadyScanned);
    if (fill !== null) fills.push(fill);
  }
  return fills;
}

function sharesAny(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const id of small) if (large.has(id)) return true;
  return false;
}

/**
 * The sample strictly between two times to scan next: the calmest one in the
 * middle half of the interval (any one in between if that half is empty).
 */
export function pickBetween(
  samples: readonly ProbeSample[],
  from: number,
  to: number,
  exclude: ReadonlySet<number> = new Set(),
): number | null {
  const span = to - from;
  const eps = 1e-6;
  let best: number | null = null;
  let bestScore = Infinity;
  for (let i = 0; i < samples.length; i++) {
    const t = samples[i].time;
    if (t <= from + eps || t >= to - eps || exclude.has(i)) continue;
    // Distance from the middle, in quarters of the gap: 0–1 inside the middle half.
    const offCentre = Math.abs(t - (from + span / 2)) / (span / 4);
    const motion = Number.isFinite(samples[i].motion) ? samples[i].motion : 255;
    // Inside the middle half, prefer calm frames; outside it, only as a fallback.
    const score = offCentre <= 1 ? motion : 1000 + offCentre;
    if (score < bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return best;
}

/** Sampling step (s): fine enough to see every flick settle, coarser for long videos. */
export function probeInterval(duration: number, maxSamples = 1200): number {
  if (!Number.isFinite(duration) || duration <= 0) return 0.2;
  return Math.max(0.2, Math.ceil((duration / maxSamples) * 100) / 100);
}

/** Sample times from 0 to the last frame, `step` apart. */
export function probeTimes(duration: number, step: number): number[] {
  // The very end often decodes to nothing; stay a little before it.
  const last = Math.max(0, duration - 0.05);
  const times: number[] = [];
  for (let i = 0; ; i++) {
    const t = Math.round(i * step * 1000) / 1000;
    if (t > last) break;
    times.push(t);
  }
  if (times.length === 0 || last - times[times.length - 1] > step / 2)
    times.push(Math.round(last * 1000) / 1000);
  return times;
}
