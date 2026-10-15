"use client";

import { createLocalStore, readArray } from "./local-store";
import type { DetectedItem } from "./types";

/**
 * The scanned inventory: every scanner tab adds to it and the /inventory page
 * shows and edits it.
 * One store backed by localStorage: every mounted view sees the same list, and
 * nothing can write a stale or empty copy over it while loading.
 */

const STORAGE_KEY = "scanner_detected_items";
const EMPTY: DetectedItem[] = [];

type InventoryUpdate =
  | DetectedItem[]
  | ((prev: DetectedItem[]) => DetectedItem[]);

const store = createLocalStore<DetectedItem[]>(STORAGE_KEY, EMPTY, readArray);

export function setScannerInventory(update: InventoryUpdate) {
  store.set(update);
}

/** `[items, setItems]`, used like `useState` but shared across the scanners and /inventory. */
export function useScannerInventory() {
  return store.useValue();
}
