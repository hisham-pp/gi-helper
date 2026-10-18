import { revalidateTag, unstable_cache } from "next/cache";
import { hashClient } from "@/lib/server/request-client";
import { toScanStats, type RawScanStats, type ScannerKind, type ScanStats } from "./stats";
import { callRpc, rpcServerKey } from "@/lib/server/supabase-rpc";

/**
 * Server side of the home page's scan counter: `public.scan_stats` and
 * `public.scan_record` (supabase/migrations/*_scan_stats*.sql). Recording is
 * rate-limited per sender (salted IP hash) in the database, which also
 * broadcasts every new total on Realtime (*_realtime_scan_stats.sql).
 */

const SCAN_STATS_TAG = "scan-stats";

// Shared by every server instance; a recorded scan drops it right away
const cachedScanStats = unstable_cache(
  async () => toScanStats(await callRpc<RawScanStats>("scan_stats", {})),
  ["scan-stats"],
  { tags: [SCAN_STATS_TAG], revalidate: 300 },
);

export function getScanStats(): Promise<ScanStats> {
  return cachedScanStats();
}

/** Counts one scan and returns the new totals. */
export async function recordScanRun(scanner: ScannerKind, ip: string): Promise<ScanStats> {
  const raw = await callRpc<RawScanStats>(
    "scan_record",
    { p_scanner: scanner, p_client_hash: hashClient(ip), p_server_key: rpcServerKey() },
    { invalid_scanner: 400, forbidden: 403 },
  );
  revalidateTag(SCAN_STATS_TAG);
  return toScanStats(raw);
}
