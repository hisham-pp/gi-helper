/**
 * Legacy CV Grid Detector Entry Point
 * Re-exports the modular grid-detector engine from `@/lib/grid-detector`
 */
import { calculateSafeZoneGrid } from "@/lib/grid-detector/safe-zone";

export * from "@/lib/grid-detector";

// Backward compatibility alias
export const autoDetectGrid = calculateSafeZoneGrid;
