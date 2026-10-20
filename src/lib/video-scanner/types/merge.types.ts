import type {
  CardRecognition,
  CardRecognitionStatus,
  MaterialCandidate,
  Rarity,
} from "../../material-detector/types";

/**
 * Single card sighting in a specific video frame.
 */
export interface Sighting {
  /** Index of the scanned frame (in scan order). */
  frame: number;
  /** Frame timestamp in seconds. */
  time: number;
  card: CardRecognition;
}

/**
 * Result of aggregating multiple sightings of the same material across video frames.
 */
export interface MergedMaterial {
  materialId: string;
  name: string;
  rarity: Rarity;
  /** Voted consensus quantity; null when no frame could read it cleanly. */
  quantity: number | null;
  /** Best status across all sightings. */
  status: CardRecognitionStatus;
  /** Highest overall confidence score across all sightings (0–1). */
  confidence: number;
  /** Quantity confidence of the highest-confidence sighting that agrees with consensus. */
  quantityConfidence: number;
  /** Total frames that showed this material. */
  sightings: number;
  /** Number of sightings whose quantity agrees with consensus. */
  agreeing: number;
  /** Flag indicating conflicting distinct quantities were read across frames. */
  quantityConflict: boolean;
  /** Timestamp in seconds when material was first spotted. */
  firstSeen: number;
  /** The clearest sighting agreeing with consensus (used for image crop and candidates). */
  best: Sighting;
  candidates: MaterialCandidate[];
}
