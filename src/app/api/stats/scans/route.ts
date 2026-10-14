import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, isSameOrigin } from "@/lib/request-client";
import { SCANNERS, type ScanStatsResponse } from "@/lib/scan-stats";
import { getScanStats, recordScanRun } from "@/lib/scan-stats-server";
import { getRealtimeConfig, RpcError } from "@/lib/supabase-rpc";

export const dynamic = "force-dynamic";

function errorResponse(err: unknown): NextResponse {
  if (!(err instanceof RpcError)) console.error("[scan-stats] unexpected error:", err);
  const status = err instanceof RpcError ? err.status : 500;
  const code = err instanceof RpcError ? err.code : "unavailable";
  return NextResponse.json({ error: code }, { status, headers: { "Cache-Control": "no-store" } });
}

/**
 * GET /api/stats/scans: { total, byScanner, live } for the home page counter.
 * `live` tells the browser where to listen for new totals (Realtime).
 */
export async function GET() {
  try {
    const live = getRealtimeConfig() ?? undefined;
    const body: ScanStatsResponse = { ...(await getScanStats()), live };
    return NextResponse.json(body, {
      // A minute old is fine; the CDN answers most visits
      headers: { "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (err) {
    return errorResponse(err);
  }
}

const recordSchema = z.object({ scanner: z.enum(SCANNERS) });

/** POST /api/stats/scans { scanner }: counts a finished scan, returns the new totals. */
export async function POST(req: NextRequest) {
  try {
    if (!isSameOrigin(req)) throw new RpcError("forbidden", 403);
    const parsed = recordSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw new RpcError("invalid_scanner", 400);

    const stats = await recordScanRun(parsed.data.scanner, clientIp(req));
    return NextResponse.json(stats, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return errorResponse(err);
  }
}
