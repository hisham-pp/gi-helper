/**
 * Core domain types and review data models for GI Suite.
 * These types now live in @gi/scanner — imported here for backwards compatibility
 * so that existing @/lib/types imports continue to resolve without changes.
 */
export type {
  PixelRect,
  DetectedItem,
  ReviewCandidate,
  ScannedReviewItem,
  EquipmentReviewItem,
  ProcessScanResult,
  MaterialItem,
} from "@gi/scanner";
