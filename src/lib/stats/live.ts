"use client";

import {
  SCAN_STATS_BROADCAST_EVENT,
  SCAN_STATS_CHANNEL,
  toScanStats,
  type RawScanStats,
  type ScanStats,
  type ScanStatsLive,
} from "./stats";

/**
 * Live scan totals over Supabase Realtime (a WebSocket): the database
 * broadcasts the new totals on the public "scan-stats" channel whenever a
 * scan is counted. The client library loads only when this is called (the
 * home page), and the socket closes while the tab is hidden; `onResume` runs
 * when it reopens, to catch up on what was missed.
 *
 * Returns a function that unsubscribes and closes the socket.
 */
export function subscribeToScanStats(
  live: ScanStatsLive,
  onStats: (stats: ScanStats) => void,
  onResume: () => void,
): () => void {
  let closed = false;
  let disconnect: (() => void) | null = null;

  const connect = async () => {
    const { RealtimeClient } = await import("@supabase/realtime-js");
    // Closed, already connected, or hidden while the library loaded
    if (closed || disconnect || document.visibilityState === "hidden") return;

    const client = new RealtimeClient(`${live.url.replace(/^http/, "ws")}/realtime/v1`, {
      params: { apikey: live.key },
    });
    const channel = client
      .channel(SCAN_STATS_CHANNEL)
      .on("broadcast", { event: SCAN_STATS_BROADCAST_EVENT }, ({ payload }) =>
        onStats(toScanStats(payload as RawScanStats)),
      )
      .subscribe();

    disconnect = () => {
      void client.removeChannel(channel);
      void client.disconnect();
    };
  };

  const close = () => {
    disconnect?.();
    disconnect = null;
  };

  const handleVisibility = () => {
    if (document.visibilityState === "hidden") {
      close();
    } else if (!disconnect) {
      onResume();
      void connect().catch(() => {});
    }
  };

  document.addEventListener("visibilitychange", handleVisibility);
  if (document.visibilityState !== "hidden") void connect().catch(() => {});

  return () => {
    closed = true;
    document.removeEventListener("visibilitychange", handleVisibility);
    close();
  };
}
