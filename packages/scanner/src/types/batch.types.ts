import type { EquipmentReviewItem, ScannedReviewItem } from "./domain.types";
import type { MoraReading } from "@gi/image-scanner";
import type { ScanSummary } from "./orchestration.types";

export type BatchFileStatus = "pending" | "scanning" | "completed" | "failed";

export interface BatchFileItem {
  file: File;
  previewUrl: string;
  name: string;
  status: BatchFileStatus;
  itemCount?: number;
}

export interface BatchScanResult {
  reviewItems: ScannedReviewItem[];
  equipmentItems: EquipmentReviewItem[];
  summary: ScanSummary;
  mora: MoraReading | null;
}
