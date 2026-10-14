/**
 * Scan counter shown on the home page: every scan that recognises at least
 * one material adds one to a shared total in the database (just the scanner
 * type; no images or results). Scans of the "Try a sample" files don't count.
 * Server side: scan-stats-server.ts and /api/stats/scans.
 */

/** Same list as the stats_private.scan_totals check. */
export const SCANNERS = ["screenshot", "video", "ai"] as const;
export type ScannerKind = (typeof SCANNERS)[number];

export interface ScanStats {
  total: number;
  byScanner: Record<ScannerKind, number>;
}

/** Window event carrying the new ScanStats after this browser records a scan. */
export const SCAN_STATS_EVENT = "gi:scan-stats";

/** Files the "Try a sample" buttons created (see UploadZone). */
const sampleFiles = new WeakSet<File>();

export function markSampleFile(file: File): void {
  sampleFiles.add(file);
}

/** True when every scanned file is one of the samples. */
export function isSampleScan(files: readonly File[]): boolean {
  return files.length > 0 && files.every((file) => sampleFiles.has(file));
}

/**
 * Counts a finished scan, fire and forget: a failed request never affects
 * the scan. The response's stats are broadcast so the counter updates.
 */
export function recordScan(scanner: ScannerKind, files: readonly File[]): void {
  if (isSampleScan(files)) return;
  fetch("/api/stats/scans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scanner }),
    // The scanners navigate to /inventory right away
    keepalive: true,
  })
    .then((res) => (res.ok ? (res.json() as Promise<ScanStats>) : null))
    .then((stats) => {
      if (stats) window.dispatchEvent(new CustomEvent(SCAN_STATS_EVENT, { detail: stats }));
    })
    .catch(() => {});
}
