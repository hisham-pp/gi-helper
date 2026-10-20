import type { ArtifactPanelReading } from "../../artifact-panel/read";
import type {
  CardRecognition,
  CardRecognitionStatus,
  MaterialCandidate,
} from "../../material-detector/types";

export type EquipmentKind = "weapon" | "artifact" | "character";

/** One weapon, artifact or character card, as read in one screenshot or frame. */
export interface EquipmentSighting {
  kind: EquipmentKind;
  /** The catalog item: a weapon id, "<set id>:<slot>" or a character id; null when unidentified. */
  item: string | null;
  /** "awakened" (or "awakened-alt") when the weapon showed its awakened icon. */
  variant?: string;
  rarity: number | null;
  level: number | null;
  /** Weapons only. */
  refinement: number | null;
  locked: boolean;
  status: CardRecognitionStatus;
  /** 0–1 */
  confidence: number;
  candidates: MaterialCandidate[];
  /** The screenshot or frame index it was read in. */
  source: number;
  row: number;
  column: number;
  card: CardRecognition;
  /** Artifacts: what the detail panel showed for this card (main stat, substats, wearer). */
  panel?: ArtifactPanelReading;
}
