"use client";

import { useState, useEffect, useCallback } from "react";

export interface ScannerSettings {
  autoPreviewLayout: boolean;
  autoReviewResults: boolean;
}

const STORAGE_KEY_LAYOUT = "scanner_auto_preview_layout";
const STORAGE_KEY_REVIEW = "scanner_auto_review_results";

export const DEFAULT_SCANNER_SETTINGS: ScannerSettings = {
  autoPreviewLayout: true,
  autoReviewResults: true,
};

export function getScannerSettings(): ScannerSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SCANNER_SETTINGS;
  }

  try {
    const layoutVal = localStorage.getItem(STORAGE_KEY_LAYOUT);
    const reviewVal = localStorage.getItem(STORAGE_KEY_REVIEW);

    return {
      autoPreviewLayout:
        layoutVal !== null
          ? layoutVal === "true"
          : DEFAULT_SCANNER_SETTINGS.autoPreviewLayout,
      autoReviewResults:
        reviewVal !== null
          ? reviewVal === "true"
          : DEFAULT_SCANNER_SETTINGS.autoReviewResults,
    };
  } catch (e) {
    console.error("Failed to read scanner settings from localStorage", e);
    return DEFAULT_SCANNER_SETTINGS;
  }
}

export function saveScannerSetting(
  key: keyof ScannerSettings,
  value: boolean,
): void {
  if (typeof window === "undefined") return;

  try {
    const storageKey =
      key === "autoPreviewLayout" ? STORAGE_KEY_LAYOUT : STORAGE_KEY_REVIEW;
    localStorage.setItem(storageKey, String(value));
    window.dispatchEvent(
      new CustomEvent("scanner_settings_changed", {
        detail: { key, value },
      }),
    );
  } catch (e) {
    console.error("Failed to save scanner setting to localStorage", e);
  }
}

export function useScannerSettings() {
  const [settings, setSettings] = useState<ScannerSettings>(
    DEFAULT_SCANNER_SETTINGS,
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSettings(getScannerSettings());
    setMounted(true);

    const handleSettingsChanged = () => {
      setSettings(getScannerSettings());
    };

    window.addEventListener("scanner_settings_changed", handleSettingsChanged);
    window.addEventListener("storage", handleSettingsChanged);

    return () => {
      window.removeEventListener(
        "scanner_settings_changed",
        handleSettingsChanged,
      );
      window.removeEventListener("storage", handleSettingsChanged);
    };
  }, []);

  const updateSetting = useCallback(
    (key: keyof ScannerSettings, value: boolean) => {
      saveScannerSetting(key, value);
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  return { settings, updateSetting, mounted };
}
