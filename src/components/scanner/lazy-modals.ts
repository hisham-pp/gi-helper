import dynamic from "next/dynamic";

/*
 * Scanner modals load on demand: their code stays out of the page bundle and
 * they only mount while open. Call the matching preload when a modal is about
 * to be needed (a scan started, the pointer is on the settings button) so the
 * first open doesn't wait for the chunk.
 */

const loadScanReviewModal = () => import("./ScanReviewModal");
const loadScannerSettingsModal = () => import("./ScannerSettingsModal");

export const LazyScanReviewModal = dynamic(
  () => import("./ScanReviewModal").then((m) => m.ScanReviewModal),
  { ssr: false },
);

export const LazyScannerSettingsModal = dynamic(
  () => import("./ScannerSettingsModal").then((m) => m.ScannerSettingsModal),
  { ssr: false },
);

export function preloadScanReviewModal(): void {
  // A failed preload is retried by the real open, which surfaces the error.
  loadScanReviewModal().catch(() => {});
}

export function preloadScannerSettingsModal(): void {
  loadScannerSettingsModal().catch(() => {});
}
