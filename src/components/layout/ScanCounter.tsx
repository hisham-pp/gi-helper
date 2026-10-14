"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ScanLine } from "lucide-react";
import { SCAN_STATS_EVENT, type ScanStats } from "@/lib/scan-stats";

const NUMBER = new Intl.NumberFormat("en-US");

/** Keeps the higher total, so a CDN copy a minute old can't undo a scan just recorded. */
function newer(prev: ScanStats | null, next: ScanStats): ScanStats {
  return prev && prev.total > next.total ? prev : next;
}

/**
 * "1,234 scans so far" in the footer of the home page (see lib/scan-stats).
 * The footer stays mounted, so it also catches the totals a scan returns
 * while the visitor is on /inventory. Hidden until there's a first scan.
 */
export function ScanCounter() {
  const onHome = usePathname() === "/";
  const [stats, setStats] = useState<ScanStats | null>(null);

  useEffect(() => {
    const handleStats = (e: Event) => setStats((prev) => newer(prev, (e as CustomEvent<ScanStats>).detail));
    window.addEventListener(SCAN_STATS_EVENT, handleStats);
    return () => window.removeEventListener(SCAN_STATS_EVENT, handleStats);
  }, []);

  useEffect(() => {
    if (!onHome) return;
    let cancelled = false;
    fetch("/api/stats/scans")
      .then((res) => (res.ok ? (res.json() as Promise<ScanStats>) : null))
      .then((next) => {
        if (!cancelled && next) setStats((prev) => newer(prev, next));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [onHome]);

  if (!onHome || !stats || stats.total < 1) return null;

  const { screenshot, video, ai } = stats.byScanner;
  return (
    <p
      className="flex items-center gap-1.5"
      title={`Screenshots ${NUMBER.format(screenshot)} · Video ${NUMBER.format(video)} · AI Vision ${NUMBER.format(ai)}`}
    >
      <ScanLine className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
      <span>
        <strong className="font-mono font-semibold text-white/80">{NUMBER.format(stats.total)}</strong>{" "}
        {stats.total === 1 ? "scan" : "scans"} so far
      </span>
    </p>
  );
}
