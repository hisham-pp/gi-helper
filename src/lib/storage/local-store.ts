"use client";

import { useSyncExternalStore } from "react";

/**
 * A value kept in localStorage and shared by every mounted view: one cached
 * copy, `useSyncExternalStore` subscribers, and changes from other browser
 * tabs picked up through the `storage` event. Nothing can write a stale or
 * empty copy over it while loading, because reads go through the cache.
 */
export interface LocalStore<T> {
  get(): T;
  set(update: T | ((prev: T) => T)): void;
  /** `[value, set]`, used like `useState` but shared across components. */
  useValue(): readonly [T, (update: T | ((prev: T) => T)) => void];
}

export function createLocalStore<T>(
  key: string,
  empty: T,
  /** Turns whatever is stored into a T (or `empty` when it can't). */
  read: (stored: unknown) => T,
): LocalStore<T> {
  let cache: T | null = null;
  const listeners = new Set<() => void>();

  const readStorage = (): T => {
    if (typeof window === "undefined") return empty;
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? empty : read(JSON.parse(raw));
    } catch {
      return empty;
    }
  };

  const get = (): T => {
    if (cache === null) cache = readStorage();
    return cache;
  };

  const emit = () => listeners.forEach((listener) => listener());

  /** Picks up changes made in another browser tab. */
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== key) return;
    cache = readStorage();
    emit();
  };

  const subscribe = (listener: () => void) => {
    if (typeof window === "undefined") return () => {};
    if (listeners.size === 0) window.addEventListener("storage", handleStorage);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) window.removeEventListener("storage", handleStorage);
    };
  };

  const set = (update: T | ((prev: T) => T)) => {
    const next = typeof update === "function" ? (update as (prev: T) => T)(get()) : update;
    cache = next;
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Storage full or blocked: the value still works for this visit.
    }
    emit();
  };

  const useValue = () => [useSyncExternalStore(subscribe, get, () => empty), set] as const;

  return { get, set, useValue };
}

/** Reads a stored array, or `[]` when it isn't one. */
export const readArray = <T>(stored: unknown): T[] => (Array.isArray(stored) ? (stored as T[]) : []);
