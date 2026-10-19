/// <reference lib="webworker" />

/**
 * GI Helper Progressive Web App Service Worker
 * Provides complete offline support for:
 * - App shell and navigation routes
 * - Pre-cached and dynamically cached reference atlases (/data/*)
 * - Tesseract OCR engines and trained language data (/ocr/*)
 * - Web Share Target: receiving shared screenshot images directly into the scanner
 */

const VERSION = "v1";
const CACHE_STATIC = `gi-helper-static-${VERSION}`;
const CACHE_DATA = `gi-helper-data-${VERSION}`;
const CACHE_OCR = `gi-helper-ocr-${VERSION}`;
const CACHE_PAGES = `gi-helper-pages-${VERSION}`;
const CACHE_SHARED = "gi-helper-shared-images";

const CURRENT_CACHES = [CACHE_STATIC, CACHE_DATA, CACHE_OCR, CACHE_PAGES, CACHE_SHARED];

/** Core assets to pre-cache on service worker install */
const PRECACHE_URLS = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/inventory/materials",
  "/inventory/weapons",
  "/inventory/artifacts",
  "/inventory/characters",
  "/db/materials",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_STATIC)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => undefined))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !CURRENT_CACHES.includes(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

/**
 * Cache-first strategy: returns cached response if available,
 * otherwise fetches from network, stores in cache, and returns.
 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    if (cached) return cached;
    throw error;
  }
}

/**
 * Network-first strategy for navigation and dynamic pages:
 * Tries network first; if offline, falls back to cached page or home shell.
 */
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Fall back to root app shell for client-side navigation
    const rootShell = await caches.match("/");
    if (rootShell) return rootShell;

    throw error;
  }
}

/**
 * Handles Web Share Target POST requests containing shared image files.
 * Stores received images in CACHE_SHARED and redirects to /?shared=1.
 */
async function handleShareTarget(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("images");
    if (files.length > 0) {
      const cache = await caches.open(CACHE_SHARED);
      // Clean previous shared files
      const existingKeys = await cache.keys();
      await Promise.all(existingKeys.map((k) => cache.delete(k)));

      // Store new files under index keys
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file instanceof File || file instanceof Blob) {
          const response = new Response(file, {
            headers: {
              "Content-Type": file.type || "image/png",
              "X-Filename": encodeURIComponent(file.name || `shared-image-${i}.png`),
            },
          });
          await cache.put(`/shared-file/${i}`, response);
        }
      }
    }
  } catch (err) {
    console.warn("[SW] Failed to store shared target files:", err);
  }
  return Response.redirect("/?shared=1", 303);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Web Share Target interceptor
  if (request.method === "POST" && url.origin === location.origin && url.pathname === "/") {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      event.respondWith(handleShareTarget(request));
      return;
    }
  }

  // Only handle GET requests below
  if (request.method !== "GET") return;

  // 2. Reference Atlases & Manifests (/data/*.webp, /data/*.json)
  if (url.origin === location.origin && /^\/data\/.*-atlas\.(webp|json)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, CACHE_DATA));
    return;
  }

  // 3. Tesseract OCR Files (/ocr/*)
  if (url.origin === location.origin && url.pathname.startsWith("/ocr/")) {
    event.respondWith(cacheFirst(request, CACHE_OCR));
    return;
  }

  // 4. Static Game Assets & Next.js Bundles (/_next/static/*, /icons/*, /images/*)
  if (
    url.origin === location.origin &&
    (url.pathname.startsWith("/_next/static/") ||
      url.pathname.startsWith("/icons/") ||
      url.pathname.startsWith("/images/") ||
      url.pathname === "/manifest.webmanifest")
  ) {
    event.respondWith(cacheFirst(request, CACHE_STATIC));
    return;
  }

  // 5. Shared file retrieval endpoint (/shared-file/*)
  if (url.origin === location.origin && url.pathname.startsWith("/shared-file/")) {
    event.respondWith(caches.match(request));
    return;
  }

  // 6. Navigation (HTML pages)
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, CACHE_PAGES));
    return;
  }
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
