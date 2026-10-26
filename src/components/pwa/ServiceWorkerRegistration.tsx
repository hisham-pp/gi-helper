"use client";

import { useEffect } from "react";

/**
 * Registers the Service Worker for offline PWA capabilities and processes
 * incoming Web Share Target shared screenshots.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Skip registration in automated crawlers / Googlebot Web Rendering Service (WRS)
    if (
      "wrsParams" in window ||
      /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent)
    ) {
      return;
    }

    // 1. Register the Service Worker
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        // Check for updates periodically
        registration.addEventListener("updatefound", () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener("statechange", () => {
              if (
                installingWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New content is available, activate immediately
                installingWorker.postMessage({ type: "SKIP_WAITING" });
              }
            });
          }
        });
      })
      .catch((err) => {
        // Suppress expected rejection in automated crawlers (e.g. Googlebot WRS) or aborts
        if (
          err?.message === "Rejected" ||
          err?.name === "AbortError" ||
          err?.name === "SecurityError"
        ) {
          return;
        }
        if (process.env.NODE_ENV === "development") {
          console.warn("[SW] Registration error:", err);
        }
      });

    // 2. Handle incoming Web Share Target files (?shared=1)
    if (window.location.search.includes("shared=1")) {
      (async () => {
        try {
          const files: File[] = [];
          let idx = 0;
          while (true) {
            const res = await fetch(`/shared-file/${idx}`);
            if (!res.ok) break;
            const blob = await res.blob();
            const filename =
              decodeURIComponent(res.headers.get("X-Filename") || "") ||
              `shared-image-${idx + 1}.png`;
            files.push(new File([blob], filename, { type: blob.type || "image/png" }));
            idx++;
          }

          if (files.length > 0) {
            window.dispatchEvent(
              new CustomEvent("gi_shared_files_received", {
                detail: { files },
              }),
            );
          }
        } catch (e) {
          console.warn("[SW] Error retrieving shared target files:", e);
        } finally {
          // Clean the query parameter without reloading
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, "", cleanUrl);
        }
      })();
    }
  }, []);

  return null;
}
