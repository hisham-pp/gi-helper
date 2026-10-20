/**
 * Options controlling keyframe selection heuristics during video sampling.
 */
export interface KeyframeOptions {
  /** Below this mean difference (0–255) to the previous sample, a frame counts as still. */
  stillThreshold: number;
  /** Below this mean difference to the last pick, a frame shows nothing new. */
  duplicateThreshold: number;
}

/**
 * One sampled video frame: timestamp and frame-to-frame difference metric.
 */
export interface ProbeSample {
  time: number;
  /** Mean absolute difference (0–255) to the previous sample; Infinity for the first. */
  motion: number;
}

/**
 * A scanned frame, reduced to what coverage checks need.
 */
export interface CoverageFrame {
  time: number;
  /** Materials recognised with confidence; empty when the frame showed no inventory. */
  materials: ReadonlySet<string>;
}
