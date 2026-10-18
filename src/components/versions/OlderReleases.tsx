"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, CircleAlert, Loader2 } from "lucide-react";
import {
  RELEASES_PER_PAGE,
  type ReleasePage,
  type VersionRelease,
} from "@/lib/versions/notes";
import { ReleaseCard } from "./ReleaseCard";

/** id of a release card, e.g. "v0-0-2" for /versions#v0-0-2. */
const anchorId = () => decodeURIComponent(window.location.hash.slice(1));

/**
 * Releases past the first ten on /versions, loaded ten at a time from the
 * static /api/versions/[page] files. A link to an older release
 * (/versions#v0-0-2) loads pages until that release is on screen.
 */
export function OlderReleases({ total }: { total: number }) {
  const [releases, setReleases] = useState<VersionRelease[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const loadingRef = useRef(false);

  const shown = RELEASES_PER_PAGE + releases.length;
  const remaining = Math.max(0, total - shown);

  /** Loads the next page; resolves to whether more remain. */
  const loadMore = useCallback(async (): Promise<boolean> => {
    if (loadingRef.current) return false;
    loadingRef.current = true;
    setLoading(true);
    setFailed(false);
    try {
      const page = Math.floor(shown / RELEASES_PER_PAGE) + 1;
      const res = await fetch(`/api/versions/${page}`);
      if (!res.ok) throw new Error(String(res.status));
      const body = (await res.json()) as ReleasePage;
      setReleases((prev) => [...prev, ...body.items]);
      return body.page < body.totalPages;
    } catch {
      setFailed(true);
      return false;
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [shown]);

  // Deep link to an older release: keep loading until it's there, then go to
  // it. Runs again as each page lands (shown/remaining change).
  const seekingAnchorRef = useRef(false);
  useEffect(() => {
    const id = anchorId();
    if (!/^v\d+-\d+-\d+$/.test(id)) return;
    const target = document.getElementById(id);
    if (target) {
      // Only after loading it ourselves; the browser handles the first ten
      if (seekingAnchorRef.current) {
        seekingAnchorRef.current = false;
        target.scrollIntoView({ block: "start" });
      }
      return;
    }
    if (remaining > 0) {
      seekingAnchorRef.current = true;
      void loadMore();
    }
  }, [remaining, loadMore]);

  // Everything fits on the first page: nothing to add
  if (total <= RELEASES_PER_PAGE) return null;

  return (
    <>
      {releases.map((release) => (
        <ReleaseCard key={release.slug} release={release} isLatest={false} />
      ))}

      {remaining > 0 && (
        <div className="flex flex-col items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loading}
            className="glass-btn px-5 py-2.5 text-sm font-semibold"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            {loading
              ? "Loading..."
              : `Load ${Math.min(RELEASES_PER_PAGE, remaining)} older release${
                  Math.min(RELEASES_PER_PAGE, remaining) === 1 ? "" : "s"
                }`}
          </button>
          <span className="text-xs text-white/50">
            Showing {Math.min(shown, total)} of {total}
          </span>
          {failed && (
            <p role="alert" className="flex items-center gap-1.5 text-xs text-rose-300">
              <CircleAlert className="h-3.5 w-3.5" />
              Couldn&apos;t load older releases. Try again.
            </p>
          )}
        </div>
      )}
    </>
  );
}
