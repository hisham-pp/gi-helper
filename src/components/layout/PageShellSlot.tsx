"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { useLinkStatus } from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { PAGE_SHELLS } from "./PageShells";

/*
 * What the slot needs to know, kept outside React state on purpose: a setState
 * made while the navigation's transition is pending gets folded into that
 * transition and only lands with the new page, too late to show a shell.
 * External store updates render right away.
 *
 * - linkPath: the page a ShellLink is navigating to (Next marks it pending,
 *   even for a prefetched page while it renders).
 * - fetchPath: the page the router is fetching from the server right now (not
 *   a prefetch). Only when both match is the page really loading.
 */
let linkPath: string | null = null;
let fetchPath: string | null = null;
let snapshot: string | null = null;
const listeners = new Set<() => void>();

function update(next: { link?: string | null; fetch?: string | null }) {
  if (next.link !== undefined) linkPath = next.link;
  if (next.fetch !== undefined) fetchPath = next.fetch;
  const loading = linkPath && linkPath === fetchPath ? linkPath : null;
  if (loading === snapshot) return;
  snapshot = loading;
  listeners.forEach((listener) => listener());
}

/**
 * Notes the router's page fetches (RSC requests without the prefetch header).
 * Once a fetch starts, its page counts as loading until the link settles, so
 * the shell doesn't drop back to the old page while the response streams in.
 */
function watchPageFetches() {
  if (typeof window === "undefined" || (window.fetch as { __pageShell?: boolean }).__pageShell) return;
  const original = window.fetch;
  const patched: typeof fetch = (input, init) => {
    let path: string | null = null;
    try {
      const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
      if (headers.get("rsc") === "1" && !headers.has("next-router-prefetch")) {
        path = new URL(input instanceof Request ? input.url : String(input), window.location.href).pathname;
        update({ fetch: path });
      }
    } catch {
      // Never let the watcher break a request
    }
    const response = original(input, init);
    if (path) {
      // A fetch no link waits on (router.push, refresh) must not linger
      const done = () => {
        if (fetchPath === path && linkPath !== path) update({ fetch: null });
      };
      response.then(done, done);
    }
    return response;
  };
  (patched as { __pageShell?: boolean }).__pageShell = true;
  window.fetch = patched;
}

function subscribe(listener: () => void) {
  watchPageFetches();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getLoadingPath = () => snapshot;
const getServerLoadingPath = () => null;

/**
 * Holds the current page and, while a ShellLink's page is really being fetched
 * from the server, shows that page's skeleton (PAGE_SHELLS) in its place.
 * Prefetched pages switch without one.
 *
 * This replaces a loading.tsx: a loading boundary above the static pages put
 * its placeholder into their prerendered HTML, so every first visit showed the
 * skeleton before the page.
 */
export function PageShellSlot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const loading = useSyncExternalStore(subscribe, getLoadingPath, getServerLoadingPath);

  // Preload every public page once the browser is idle, including the footer's
  // (often below the fold, so its links never prefetch on their own)
  useEffect(() => {
    const preload = () => {
      for (const page of Object.keys(PAGE_SHELLS)) router.prefetch(page as Route);
    };
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(preload, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = setTimeout(preload, 1500);
    return () => clearTimeout(timer);
  }, [router]);

  const Shell = loading && loading !== pathname ? PAGE_SHELLS[loading] : null;

  return (
    <>
      {Shell && <Shell />}
      {/* Always the same wrapper, so hiding the current page doesn't remount it */}
      <div className={Shell ? "hidden" : "contents"}>{children}</div>
    </>
  );
}

/** Rendered inside a ShellLink: reports while Next marks the link pending. */
export function LinkPendingReporter({ href }: { href: string }) {
  const { pending } = useLinkStatus();
  const pathname = href.split(/[?#]/)[0] || "/";

  useEffect(() => {
    if (!pending) return;
    update({ link: pathname });
    return () => {
      if (linkPath === pathname) update({ link: null, fetch: null });
    };
  }, [pending, pathname]);

  return null;
}
