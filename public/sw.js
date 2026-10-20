/// <reference lib="webworker" />

/**
 * GI Helper Progressive Web App Service Worker
 * Provides complete offline support for:
 * - App shell and navigation routes (/inventory/*, /db/*, /)
 * - Next.js static script bundles, CSS chunks, and RSC Flight data
 * - Pre-cached and dynamically cached reference atlases (/data/*)
 * - Tesseract OCR engines and trained language data (/ocr/*)
 * - Web Share Target: receiving shared screenshot images directly into the scanner
 */

const VERSION = "v0.0.44";
const CACHE_STATIC = `gi-helper-static-${VERSION}`;
const CACHE_DATA = `gi-helper-data-${VERSION}`;
const CACHE_OCR = `gi-helper-ocr-${VERSION}`;
const CACHE_PAGES = `gi-helper-pages-${VERSION}`;
const CACHE_SHARED = "gi-helper-shared-images";

const CURRENT_CACHES = [CACHE_STATIC, CACHE_DATA, CACHE_OCR, CACHE_PAGES, CACHE_SHARED];

/** Core app routes that must be completely available offline */
const PRECACHE_ROUTES = [
  "/",
  "/inventory/materials",
  "/inventory/weapons",
  "/inventory/artifacts",
  "/inventory/characters",
  "/db/materials",
];

/** Core standalone assets to pre-cache */
const PRECACHE_STATIC_ASSETS = [
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/images/bg.webp",
  "/images/bg.png",
];

/**
 * Precaches core HTML shells, static script chunks, stylesheets,
 * React Server Component flight data, and scanner reference atlases during installation.
 */
async function precacheAll() {
  const staticCache = await caches.open(CACHE_STATIC);
  const pagesCache = await caches.open(CACHE_PAGES);
  const dataCache = await caches.open(CACHE_DATA);

  // 1. Precache static icons, backgrounds and manifest
  await Promise.allSettled(
    PRECACHE_STATIC_ASSETS.map(async (url) => {
      try {
        const res = await fetch(url);
        if (res && res.status === 200) await staticCache.put(url, res);
      } catch {}
    }),
  );

  // 2. Precache HTML shells and extract required Next.js script/CSS chunks
  const scriptOrLinkRegex = /<(?:script|link)[^>]+(?:src|href)="(\/_next\/static\/[^"]+)"/g;
  const staticAssets = new Set();

  await Promise.allSettled(
    PRECACHE_ROUTES.map(async (route) => {
      try {
        // Fetch HTML document
        const res = await fetch(route);
        if (res && res.status === 200) {
          const html = await res.text();
          const htmlHeaders = { "Content-Type": "text/html; charset=utf-8" };
          await pagesCache.put(route, new Response(html, { headers: htmlHeaders }));
          await staticCache.put(route, new Response(html, { headers: htmlHeaders }));

          // Extract script chunks and css links referenced by the HTML
          let match;
          while ((match = scriptOrLinkRegex.exec(html)) !== null) {
            staticAssets.add(match[1]);
          }
        }
      } catch {}

      try {
        // Fetch and cache RSC flight stream for client-side router navigation
        const rscRes = await fetch(route, { headers: { "RSC": "1" } });
        if (rscRes && rscRes.status === 200) {
          const rscText = await rscRes.text();
          const rscHeaders = { "Content-Type": "text/x-component; charset=utf-8" };
          await pagesCache.put(route + "?_rsc=1", new Response(rscText, { headers: rscHeaders }));
        }
      } catch {}
    }),
  );

  // 3. Precache every extracted Next.js chunk and stylesheet
  await Promise.allSettled(
    Array.from(staticAssets).map(async (assetUrl) => {
      try {
        const res = await fetch(assetUrl);
        if (res && res.status === 200) await staticCache.put(assetUrl, res);
      } catch {}
    }),
  );

  // 4. Precache scanner reference bank manifests and icon atlases
  const atlasKinds = ["material", "weapon", "artifact", "character"];
  await Promise.allSettled(
    atlasKinds.map(async (kind) => {
      const manifestUrl = `/data/${kind}-atlas.json`;
      const imageUrl = `/data/${kind}-atlas.webp`;

      try {
        const mRes = await fetch(manifestUrl, { cache: "no-cache" });
        if (mRes && mRes.status === 200) {
          const mClone = mRes.clone();
          await dataCache.put(manifestUrl, mRes);
          let hash = "";
          try {
            const data = await mClone.json();
            if (data && data.hash) hash = data.hash;
          } catch {}

          const imgRes = await fetch(imageUrl);
          if (imgRes && imgRes.status === 200) {
            await dataCache.put(imageUrl, imgRes.clone());
            if (hash) {
              await dataCache.put(`${imageUrl}?v=${encodeURIComponent(hash)}`, imgRes.clone());
            }
          }
        }
      } catch (err) {
        console.warn(`[SW] Failed to precache ${kind} atlas:`, err);
      }
    }),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    precacheAll()
      .catch(() => undefined)
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
  let cached = await caches.match(request);
  const url = new URL(request.url);
  const isVersioned = url.searchParams.has("v");

  if (!cached && !isVersioned) {
    cached = await caches.match(request, { ignoreSearch: true });
  }
  if (!cached && !isVersioned) {
    try {
      cached = await caches.match(url.pathname);
    } catch {}
  }
  if (cached) return cached;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      await cache.put(request, networkResponse.clone());
      try {
        if (url.search && !isVersioned) {
          await cache.put(url.pathname, networkResponse.clone());
        }
      } catch {}
    }
    return networkResponse;
  } catch (error) {
    if (cached) return cached;
    throw error;
  }
}

/**
 * Network-first strategy for navigation and dynamic pages:
 * Tries network first; if offline, falls back to cached page or relevant section shell.
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

    const url = new URL(request.url);
    const pathname = url.pathname;
    const pathMatch = await caches.match(pathname);
    if (pathMatch) return pathMatch;

    // Fall back to relevant section shell for offline viewing
    if (pathname.startsWith("/inventory")) {
      const inventoryShell = await caches.match("/inventory/materials");
      if (inventoryShell) return inventoryShell;
    } else if (pathname.startsWith("/db")) {
      const dbShell = await caches.match("/db/materials");
      if (dbShell) return dbShell;
    }

    // Fall back to root app shell
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
  if (url.origin === location.origin && /^\/data\/.*-atlas\.json$/.test(url.pathname)) {
    event.respondWith(networkFirst(request, CACHE_DATA));
    return;
  }
  if (url.origin === location.origin && /^\/data\/.*-atlas\.webp$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, CACHE_DATA));
    return;
  }

  // 3. Tesseract OCR Files (/ocr/*)
  if (url.origin === location.origin && url.pathname.startsWith("/ocr/")) {
    event.respondWith(cacheFirst(request, CACHE_OCR));
    return;
  }

  // 4. Static Game Assets & Next.js Bundles (/_next/static/*, /icons/*, /images/*, /manifest.webmanifest)
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

  // 6. Navigation Aliases (/inventory, /db)
  if (request.mode === "navigate" && url.origin === location.origin) {
    if (url.pathname === "/inventory" || url.pathname === "/inventory/") {
      event.respondWith(
        caches.match("/inventory/materials").then((res) => {
          if (res) return res;
          return networkFirst(new Request("/inventory/materials"), CACHE_PAGES);
        }),
      );
      return;
    }
    if (url.pathname === "/db" || url.pathname === "/db/") {
      event.respondWith(
        caches.match("/db/materials").then((res) => {
          if (res) return res;
          return networkFirst(new Request("/db/materials"), CACHE_PAGES);
        }),
      );
      return;
    }
  }

  // 7. Next.js React Server Component (RSC) Flight requests (?_rsc=... or rsc: 1)
  if (url.origin === location.origin && (url.searchParams.has("_rsc") || request.headers.get("rsc") === "1")) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_PAGES).then((cache) => cache.put(request, clone));
          }
          return res;
        })
        .catch(async () => {
          const exact = await caches.match(request);
          if (exact) return exact;

          const byRscKey = await caches.match(url.pathname + "?_rsc=1");
          if (byRscKey) return byRscKey;

          // Safe fallback RSC stream to avoid crashing Next.js JSON/flight parser
          return new Response('0:[]\n', {
            headers: { "Content-Type": "text/x-component; charset=utf-8" },
          });
        }),
    );
    return;
  }

  // 8. Navigation (HTML pages)
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
