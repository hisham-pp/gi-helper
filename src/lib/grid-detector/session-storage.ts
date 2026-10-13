/**
 * IndexedDB persistence for the Grid Detector studio: named sessions holding
 * uploaded screenshots, their automatic detection and any manual edits.
 */
import type { DetectedGrid, GridDetectionResult, GridSession, SessionImage } from "./types";

const DB_NAME = "gi_grid_detector_sessions";
const DB_VERSION = 1;
const SESSIONS_STORE = "sessions";
const IMAGES_STORE = "images";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not available in this environment"));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
        db.createObjectStore(SESSIONS_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(IMAGES_STORE)) {
        const store = db.createObjectStore(IMAGES_STORE, { keyPath: "id" });
        store.createIndex("sessionId", "sessionId", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

const newId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

/** Records written by the first version of the studio stored a data URL and a uniform grid. */
interface LegacyImageRecord {
  id: string;
  sessionId: string;
  name: string;
  dataUrl?: string;
  blob?: Blob;
  width: number;
  height: number;
  detection?: GridDetectionResult | null;
  grids?: DetectedGrid[] | null;
  isManuallyAdjusted?: boolean;
  createdAt: number;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, payload = ""] = dataUrl.split(",");
  const mime = /data:([^;]+)/.exec(header)?.[1] ?? "application/octet-stream";
  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function normalizeImage(record: LegacyImageRecord): SessionImage | null {
  const blob = record.blob ?? (record.dataUrl ? dataUrlToBlob(record.dataUrl) : null);
  if (!blob) return null;
  return {
    id: record.id,
    sessionId: record.sessionId,
    name: record.name,
    blob,
    width: record.width,
    height: record.height,
    // Legacy uniform-grid results are dropped; the image is re-detected on open.
    detection: record.detection ?? null,
    grids: record.grids ?? null,
    isManuallyAdjusted: record.isManuallyAdjusted ?? false,
    createdAt: record.createdAt,
  };
}

export async function getAllSessions(): Promise<GridSession[]> {
  try {
    const db = await openDB();
    const sessions = await requestToPromise(
      db.transaction(SESSIONS_STORE, "readonly").objectStore(SESSIONS_STORE).getAll(),
    );
    return (sessions as GridSession[]).sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (err) {
    console.warn("IndexedDB unavailable, starting without saved sessions", err);
    return [];
  }
}

export async function createSession(name: string): Promise<GridSession> {
  const db = await openDB();
  const session: GridSession = {
    id: newId("session"),
    name: name.trim() || `Session #${new Date().toLocaleTimeString()}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const tx = db.transaction(SESSIONS_STORE, "readwrite");
  tx.objectStore(SESSIONS_STORE).add(session);
  await txDone(tx);
  return session;
}

export async function updateSession(session: GridSession): Promise<GridSession> {
  const db = await openDB();
  const updated = { ...session, updatedAt: Date.now() };
  const tx = db.transaction(SESSIONS_STORE, "readwrite");
  tx.objectStore(SESSIONS_STORE).put(updated);
  await txDone(tx);
  return updated;
}

export async function deleteSession(sessionId: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction([SESSIONS_STORE, IMAGES_STORE], "readwrite");
  tx.objectStore(SESSIONS_STORE).delete(sessionId);
  const images = tx.objectStore(IMAGES_STORE);
  const keys = await requestToPromise(images.index("sessionId").getAllKeys(sessionId));
  for (const key of keys) images.delete(key);
  await txDone(tx);
}

export async function getImagesForSession(sessionId: string): Promise<SessionImage[]> {
  try {
    const db = await openDB();
    const records = await requestToPromise(
      db.transaction(IMAGES_STORE, "readonly").objectStore(IMAGES_STORE).index("sessionId").getAll(sessionId),
    );
    return (records as LegacyImageRecord[])
      .map(normalizeImage)
      .filter((img): img is SessionImage => img !== null)
      .sort((a, b) => a.createdAt - b.createdAt);
  } catch (err) {
    console.warn("Failed to load session images", err);
    return [];
  }
}

export async function addImageToSession(
  sessionId: string,
  image: Pick<SessionImage, "name" | "blob" | "width" | "height" | "detection" | "grids">,
): Promise<SessionImage> {
  const db = await openDB();
  const record: SessionImage = {
    ...image,
    id: newId("img"),
    sessionId,
    isManuallyAdjusted: false,
    createdAt: Date.now(),
  };
  const tx = db.transaction([IMAGES_STORE, SESSIONS_STORE], "readwrite");
  tx.objectStore(IMAGES_STORE).add(record);
  const sessions = tx.objectStore(SESSIONS_STORE);
  const session = (await requestToPromise(sessions.get(sessionId))) as GridSession | undefined;
  if (session) sessions.put({ ...session, updatedAt: Date.now() });
  await txDone(tx);
  return record;
}

export async function updateImageResult(
  imageId: string,
  patch: Partial<Pick<SessionImage, "detection" | "grids" | "isManuallyAdjusted">>,
): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(IMAGES_STORE, "readwrite");
  const store = tx.objectStore(IMAGES_STORE);
  const record = (await requestToPromise(store.get(imageId))) as LegacyImageRecord | undefined;
  if (record) {
    const normalized = normalizeImage(record);
    if (normalized) store.put({ ...normalized, ...patch });
  }
  await txDone(tx);
}

export async function deleteImage(imageId: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(IMAGES_STORE, "readwrite");
  tx.objectStore(IMAGES_STORE).delete(imageId);
  await txDone(tx);
}

/** Session export: detection results with original-pixel coordinates, without image data. */
export async function exportSessionJson(sessionId: string): Promise<string> {
  const images = await getImagesForSession(sessionId);
  return JSON.stringify(
    {
      sessionId,
      exportedAt: new Date().toISOString(),
      imageCount: images.length,
      images: images.map((img) => ({
        id: img.id,
        name: img.name,
        width: img.width,
        height: img.height,
        isManuallyAdjusted: img.isManuallyAdjusted,
        processingTimeMs: img.detection?.processingTimeMs ?? null,
        grids: img.grids ?? [],
      })),
    },
    null,
    2,
  );
}
