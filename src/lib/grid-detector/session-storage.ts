import { GridConfig, GridDetectionResult, GridSession, SessionImage } from "./types";

const DB_NAME = "gi_grid_detector_sessions";
const DB_VERSION = 1;
const SESSIONS_STORE = "sessions";
const IMAGES_STORE = "images";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not available in this environment"));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
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

export async function getAllSessions(): Promise<GridSession[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SESSIONS_STORE, "readonly");
      const store = tx.objectStore(SESSIONS_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        const sessions = (req.result as GridSession[]) || [];
        sessions.sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(sessions);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("IndexedDB unavailable, returning fallback empty list", err);
    return [];
  }
}

export async function createSession(name: string): Promise<GridSession> {
  const db = await openDB();
  const session: GridSession = {
    id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim() || `Session #${new Date().toLocaleTimeString()}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(SESSIONS_STORE, "readwrite");
    const store = tx.objectStore(SESSIONS_STORE);
    const req = store.add(session);
    req.onsuccess = () => resolve(session);
    req.onerror = () => reject(req.error);
  });
}

export async function updateSession(session: GridSession): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SESSIONS_STORE, "readwrite");
    const store = tx.objectStore(SESSIONS_STORE);
    session.updatedAt = Date.now();
    const req = store.put(session);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deleteSession(sessionId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([SESSIONS_STORE, IMAGES_STORE], "readwrite");
    const sStore = tx.objectStore(SESSIONS_STORE);
    const iStore = tx.objectStore(IMAGES_STORE);

    sStore.delete(sessionId);

    // Delete associated images
    const index = iStore.index("sessionId");
    const req = index.getAllKeys(sessionId);
    req.onsuccess = () => {
      const keys = req.result;
      for (const key of keys) {
        iStore.delete(key);
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getImagesForSession(
  sessionId: string,
): Promise<SessionImage[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IMAGES_STORE, "readonly");
      const store = tx.objectStore(IMAGES_STORE);
      const index = store.index("sessionId");
      const req = index.getAll(sessionId);
      req.onsuccess = () => {
        const images = (req.result as SessionImage[]) || [];
        images.sort((a, b) => a.createdAt - b.createdAt);
        resolve(images);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Failed to get images for session", err);
    return [];
  }
}

export async function addImageToSession(
  sessionId: string,
  dataUrl: string,
  name: string,
  width: number,
  height: number,
  detectionResult: GridDetectionResult,
): Promise<SessionImage> {
  const db = await openDB();
  const sessionImage: SessionImage = {
    id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    sessionId,
    name,
    dataUrl,
    width,
    height,
    detectedGrid: detectionResult.config,
    confidence: detectionResult.confidence,
    method: detectionResult.method,
    detectedCellsCount: detectionResult.detectedCellsCount,
    isManuallyAdjusted: false,
    createdAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction([IMAGES_STORE, SESSIONS_STORE], "readwrite");
    const iStore = tx.objectStore(IMAGES_STORE);
    const sStore = tx.objectStore(SESSIONS_STORE);

    iStore.add(sessionImage);

    // Bump session updatedAt
    const sReq = sStore.get(sessionId);
    sReq.onsuccess = () => {
      const s = sReq.result as GridSession | undefined;
      if (s) {
        s.updatedAt = Date.now();
        sStore.put(s);
      }
    };

    tx.oncomplete = () => resolve(sessionImage);
    tx.onerror = () => reject(tx.error);
  });
}

export async function updateImageGrid(
  imageId: string,
  config: GridConfig,
  isManuallyAdjusted = true,
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMAGES_STORE, "readwrite");
    const store = tx.objectStore(IMAGES_STORE);
    const req = store.get(imageId);
    req.onsuccess = () => {
      const img = req.result as SessionImage | undefined;
      if (img) {
        img.detectedGrid = config;
        img.detectedCellsCount = config.columns * config.rows;
        img.isManuallyAdjusted = isManuallyAdjusted;
        store.put(img);
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteImage(imageId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMAGES_STORE, "readwrite");
    const store = tx.objectStore(IMAGES_STORE);
    const req = store.delete(imageId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function exportSessionJson(sessionId: string): Promise<string> {
  const images = await getImagesForSession(sessionId);
  const data = {
    sessionId,
    exportedAt: new Date().toISOString(),
    imageCount: images.length,
    calibrations: images.map((img) => ({
      id: img.id,
      name: img.name,
      width: img.width,
      height: img.height,
      grid: img.detectedGrid,
      confidence: img.confidence,
      method: img.method,
      detectedCells: img.detectedCellsCount,
      isManuallyAdjusted: img.isManuallyAdjusted,
    })),
  };
  return JSON.stringify(data, null, 2);
}
