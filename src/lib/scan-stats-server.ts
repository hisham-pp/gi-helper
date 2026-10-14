import { hashClient } from "./request-client";
import { toScanStats, type RawScanStats, type ScannerKind, type ScanStats } from "./scan-stats";
import { callRpc, rpcServerKey } from "./supabase-rpc";

/**
 * Server side of the home page's scan counter: `public.scan_stats` and
 * `public.scan_record` (supabase/migrations/*_scan_stats*.sql). Recording is
 * rate-limited per sender (salted IP hash) in the database, which also
 * broadcasts every new total on Realtime (*_realtime_scan_stats.sql).
 */

export async function getScanStats(): Promise<ScanStats> {
  return toScanStats(await callRpc<RawScanStats>("scan_stats", {}));
}

/** Counts one scan and returns the new totals. */
export async function recordScanRun(scanner: ScannerKind, ip: string): Promise<ScanStats> {
  const raw = await callRpc<RawScanStats>(
    "scan_record",
    { p_scanner: scanner, p_client_hash: hashClient(ip), p_server_key: rpcServerKey() },
    { invalid_scanner: 400, forbidden: 403 },
  );
  return toScanStats(raw);
}
