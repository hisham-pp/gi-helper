"use client";

import { useSyncExternalStore } from "react";
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

let cache: DetectedItem[] | null = null;
const listeners = new Set<() => void>();

function readStorage(): DetectedItem[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): DetectedItem[] {
  if (cache === null) cache = readStorage();
  return cache;
}

function emit() {
  listeners.forEach((listener) => listener());
}

/** Picks up changes made in another browser tab. */
function handleStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  cache = readStorage();
  emit();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", handleStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

export function setScannerInventory(update: InventoryUpdate) {
  const next = typeof update === "function" ? update(getSnapshot()) : update;
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked: the list still works for this visit.
  }
  emit();
}

/** `[items, setItems]`, used like `useState` but shared across the scanners and /inventory. */
export function useScannerInventory() {
  const items = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  return [items, setScannerInventory] as const;
}
