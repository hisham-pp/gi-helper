"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ScanLine } from "lucide-react";
import {
  SCAN_STATS_EVENT,
  type ScanStats,
  type ScanStatsLive,
  type ScanStatsResponse,
} from "@/lib/stats";
import { subscribeToScanStats } from "@/lib/stats/live";
import { usePrefersReducedMotion } from "@/lib/hooks";

const NUMBER = new Intl.NumberFormat("en-US");

/** Keeps the higher total, so a CDN copy a minute old can't undo a scan just recorded. */
function newer(prev: ScanStats | null, next: ScanStats): ScanStats {
  return prev && prev.total > next.total ? prev : next;
}

/**
 * "1,234 scans so far" in the footer of the home page (see lib/scan-stats).
 * Loads the totals, then follows them live over Realtime while the home page
 * is open, with a little pop when someone's scan lands. The footer stays
 * mounted, so it also catches the totals this visitor's own scan returns.
 * Hidden until there's a first scan.
 */
export function ScanCounter() {
  const onHome = usePathname() === "/";
  const [stats, setStats] = useState<ScanStats | null>(null);
  const [live, setLive] = useState<ScanStatsLive | null>(null);
  const numberRef = useRef<HTMLElement>(null);
  const shownTotalRef = useRef<number | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  const update = useCallback((next: ScanStats) => setStats((prev) => newer(prev, next)), []);

  const refresh = useCallback(() => {
    fetch("/api/stats/scans")
      .then((res) => (res.ok ? (res.json() as Promise<ScanStatsResponse>) : null))
      .then((body) => {
        if (!body) return;
        update(body);
        const next = body.live;
        // Same config: keep the object, so the live connection isn't reopened
        if (next) setLive((prev) => (prev?.url === next.url && prev.key === next.key ? prev : next));
      })
      .catch(() => {});
  }, [update]);

  useEffect(() => {
    const handleStats = (e: Event) => update((e as CustomEvent<ScanStats>).detail);
    window.addEventListener(SCAN_STATS_EVENT, handleStats);
    return () => window.removeEventListener(SCAN_STATS_EVENT, handleStats);
  }, [update]);

  useEffect(() => {
    if (onHome) refresh();
  }, [onHome, refresh]);

  // Live updates only while the home page is open
  useEffect(() => {
    if (!onHome || !live) return;
    return subscribeToScanStats(live, update, refresh);
  }, [onHome, live, update, refresh]);

  // Pop the number when the total goes up after it's on screen
  const total = stats?.total ?? null;
  useEffect(() => {
    const previous = shownTotalRef.current;
    shownTotalRef.current = total;
    if (previous === null || total === null || total <= previous || reducedMotion) return;
    numberRef.current?.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.35)", color: "rgb(103, 232, 249)", offset: 0.4 },
        { transform: "scale(1)" },
      ],
      { duration: 520, easing: "ease-out" },
    );
  }, [total, reducedMotion]);

  if (!onHome || !stats || stats.total < 1) return null;

  const { screenshot, video, ai } = stats.byScanner;
  return (
    <p
      className="flex items-center gap-1.5"
      title={`Screenshots ${NUMBER.format(screenshot)} · Video ${NUMBER.format(video)} · AI Vision ${NUMBER.format(ai)}`}
    >
      <ScanLine className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
      <span aria-live="polite">
        <strong ref={numberRef} className="inline-block font-mono font-semibold text-white/80">
          {NUMBER.format(stats.total)}
        </strong>{" "}
        {stats.total === 1 ? "scan" : "scans"} so far
      </span>
    </p>
  );
}
