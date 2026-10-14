import { hashClient } from "./request-client";
import { SCANNERS, type ScannerKind, type ScanStats } from "./scan-stats";
import { callRpc } from "./supabase-rpc";

/**
 * Server side of the home page's scan counter: `public.scan_stats` and
 * `public.scan_record` (supabase/migrations/*_scan_stats.sql). Recording is
 * rate-limited per sender (salted IP hash) in the database.
 */

interface RawScanStats {
  total: number;
  by_scanner: Partial<Record<ScannerKind, number>>;
}

function toScanStats(raw: RawScanStats): ScanStats {
  const byScanner = Object.fromEntries(
    SCANNERS.map((scanner) => [scanner, Number(raw.by_scanner?.[scanner]) || 0]),
  ) as Record<ScannerKind, number>;
  return { total: Number(raw.total) || 0, byScanner };
}

export async function getScanStats(): Promise<ScanStats> {
  return toScanStats(await callRpc<RawScanStats>("scan_stats", {}));
}

/** Counts one scan and returns the new totals. */
export async function recordScanRun(scanner: ScannerKind, ip: string): Promise<ScanStats> {
  const raw = await callRpc<RawScanStats>(
    "scan_record",
    { p_scanner: scanner, p_client_hash: hashClient(ip) },
    { invalid_scanner: 400 },
  );
  return toScanStats(raw);
}
