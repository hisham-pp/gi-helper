"use client";

import { useCallback } from "react";
import { AiProviderId } from "@/lib/ai/adapters/types";
import { createLocalStore } from "@/lib/storage/local-store";

export type AiProvider = AiProviderId;

export interface ServerEnvProviderInfo {
  hasKey: boolean;
  defaultModel?: string;
  defaultBaseUrl?: string;
}

export interface ScannerSettings {
  autoPreviewLayout: boolean;
  autoReviewResults: boolean;
  aiProvider: AiProvider;
  geminiApiKey: string;
  geminiModel: string;
  openaiApiKey: string;
  openaiModel: string;
  openaiBaseUrl: string;
  claudeApiKey: string;
  claudeModel: string;
  grokApiKey: string;
  grokModel: string;
  grokBaseUrl: string;
  customApiKey: string;
  customModel: string;
  customBaseUrl: string;
}

/** Built-in offline-ready default provider configurations (no network call needed) */
export const DEFAULT_SERVER_ENV_PROVIDERS: Record<
  string,
  ServerEnvProviderInfo
> = {
  gemini: {
    hasKey: false,
    defaultModel: "gemini-flash-latest",
    defaultBaseUrl: "",
  },
  openai: { hasKey: false, defaultModel: "gpt-6-luna", defaultBaseUrl: "" },
  claude: {
    hasKey: false,
    defaultModel: "claude-sonnet-5-5",
    defaultBaseUrl: "",
  },
  grok: {
    hasKey: false,
    defaultModel: "grok-4.7",
    defaultBaseUrl: "https://api.x.ai/v1",
  },
  custom: {
    hasKey: false,
    defaultModel: "google/gemini-3.8-flash",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
  },
};

const STORAGE_KEY_SETTINGS_CONSOLIDATED = "scanner_settings_v2";

const STORAGE_KEY_LAYOUT = "scanner_auto_preview_layout";
const STORAGE_KEY_REVIEW = "scanner_auto_review_results";
const STORAGE_KEY_AI_PROVIDER = "scanner_ai_provider";

const STORAGE_KEY_GEMINI_KEY = "scanner_gemini_api_key";
const STORAGE_KEY_GEMINI_MODEL = "scanner_gemini_model";

const STORAGE_KEY_OPENAI_KEY = "scanner_openai_api_key";
const STORAGE_KEY_OPENAI_MODEL = "scanner_openai_model";
const STORAGE_KEY_OPENAI_BASE_URL = "scanner_openai_base_url";

const STORAGE_KEY_CLAUDE_KEY = "scanner_claude_api_key";
const STORAGE_KEY_CLAUDE_MODEL = "scanner_claude_model";

const STORAGE_KEY_GROK_KEY = "scanner_grok_api_key";
const STORAGE_KEY_GROK_MODEL = "scanner_grok_model";
const STORAGE_KEY_GROK_BASE_URL = "scanner_grok_base_url";

const STORAGE_KEY_CUSTOM_KEY = "scanner_custom_api_key";
const STORAGE_KEY_CUSTOM_MODEL = "scanner_custom_model";
const STORAGE_KEY_CUSTOM_BASE_URL = "scanner_custom_base_url";

export const DEFAULT_SCANNER_SETTINGS: ScannerSettings = {
  autoPreviewLayout: false,
  autoReviewResults: true,
  aiProvider: "gemini",

  geminiApiKey: "",
  geminiModel: "gemini-flash-latest",

  openaiApiKey: "",
  openaiModel: "gpt-6-luna",
  openaiBaseUrl: "",

  claudeApiKey: "",
  claudeModel: "claude-sonnet-5-5",

  grokApiKey: "",
  grokModel: "grok-4.7",
  grokBaseUrl: "https://api.x.ai/v1",

  customApiKey: "",
  customModel: "google/gemini-3.8-flash",
  customBaseUrl: "https://openrouter.ai/api/v1",
};

const KEY_MAP: Record<keyof ScannerSettings, string> = {
  autoPreviewLayout: STORAGE_KEY_LAYOUT,
  autoReviewResults: STORAGE_KEY_REVIEW,
  aiProvider: STORAGE_KEY_AI_PROVIDER,
  geminiApiKey: STORAGE_KEY_GEMINI_KEY,
  geminiModel: STORAGE_KEY_GEMINI_MODEL,
  openaiApiKey: STORAGE_KEY_OPENAI_KEY,
  openaiModel: STORAGE_KEY_OPENAI_MODEL,
  openaiBaseUrl: STORAGE_KEY_OPENAI_BASE_URL,
  claudeApiKey: STORAGE_KEY_CLAUDE_KEY,
  claudeModel: STORAGE_KEY_CLAUDE_MODEL,
  grokApiKey: STORAGE_KEY_GROK_KEY,
  grokModel: STORAGE_KEY_GROK_MODEL,
  grokBaseUrl: STORAGE_KEY_GROK_BASE_URL,
  customApiKey: STORAGE_KEY_CUSTOM_KEY,
  customModel: STORAGE_KEY_CUSTOM_MODEL,
  customBaseUrl: STORAGE_KEY_CUSTOM_BASE_URL,
};

function readLegacySettings(): ScannerSettings {
  if (typeof window === "undefined") return DEFAULT_SCANNER_SETTINGS;

  const layoutVal = localStorage.getItem(STORAGE_KEY_LAYOUT);
  const reviewVal = localStorage.getItem(STORAGE_KEY_REVIEW);
  const providerVal = localStorage.getItem(
    STORAGE_KEY_AI_PROVIDER,
  ) as AiProvider | null;

  let storedGeminiModel =
    localStorage.getItem(STORAGE_KEY_GEMINI_MODEL) ||
    DEFAULT_SCANNER_SETTINGS.geminiModel;

  if (
    storedGeminiModel === "gemini-1.5-flash" ||
    storedGeminiModel === "gemini-2.0-flash"
  ) {
    storedGeminiModel = "gemini-flash-latest";
  }

  return {
    autoPreviewLayout:
      layoutVal !== null
        ? layoutVal === "true"
        : DEFAULT_SCANNER_SETTINGS.autoPreviewLayout,
    autoReviewResults:
      reviewVal !== null
        ? reviewVal === "true"
        : DEFAULT_SCANNER_SETTINGS.autoReviewResults,
    aiProvider: providerVal || DEFAULT_SCANNER_SETTINGS.aiProvider,

    geminiApiKey: localStorage.getItem(STORAGE_KEY_GEMINI_KEY) || "",
    geminiModel: storedGeminiModel,

    openaiApiKey: localStorage.getItem(STORAGE_KEY_OPENAI_KEY) || "",
    openaiModel:
      localStorage.getItem(STORAGE_KEY_OPENAI_MODEL) ||
      DEFAULT_SCANNER_SETTINGS.openaiModel,
    openaiBaseUrl: localStorage.getItem(STORAGE_KEY_OPENAI_BASE_URL) || "",

    claudeApiKey: localStorage.getItem(STORAGE_KEY_CLAUDE_KEY) || "",
    claudeModel:
      localStorage.getItem(STORAGE_KEY_CLAUDE_MODEL) ||
      DEFAULT_SCANNER_SETTINGS.claudeModel,

    grokApiKey: localStorage.getItem(STORAGE_KEY_GROK_KEY) || "",
    grokModel:
      localStorage.getItem(STORAGE_KEY_GROK_MODEL) ||
      DEFAULT_SCANNER_SETTINGS.grokModel,
    grokBaseUrl:
      localStorage.getItem(STORAGE_KEY_GROK_BASE_URL) ||
      DEFAULT_SCANNER_SETTINGS.grokBaseUrl,

    customApiKey: localStorage.getItem(STORAGE_KEY_CUSTOM_KEY) || "",
    customModel:
      localStorage.getItem(STORAGE_KEY_CUSTOM_MODEL) ||
      DEFAULT_SCANNER_SETTINGS.customModel,
    customBaseUrl:
      localStorage.getItem(STORAGE_KEY_CUSTOM_BASE_URL) ||
      DEFAULT_SCANNER_SETTINGS.customBaseUrl,
  };
}

function normalizeStoredSettings(stored: unknown): ScannerSettings {
  if (stored && typeof stored === "object" && !Array.isArray(stored)) {
    const s = stored as Record<string, unknown>;
    let geminiModel =
      typeof s.geminiModel === "string"
        ? s.geminiModel
        : DEFAULT_SCANNER_SETTINGS.geminiModel;
    if (
      geminiModel === "gemini-1.5-flash" ||
      geminiModel === "gemini-2.0-flash"
    ) {
      geminiModel = "gemini-flash-latest";
    }

    return {
      autoPreviewLayout:
        typeof s.autoPreviewLayout === "boolean"
          ? s.autoPreviewLayout
          : DEFAULT_SCANNER_SETTINGS.autoPreviewLayout,
      autoReviewResults:
        typeof s.autoReviewResults === "boolean"
          ? s.autoReviewResults
          : DEFAULT_SCANNER_SETTINGS.autoReviewResults,
      aiProvider:
        (s.aiProvider as AiProvider) || DEFAULT_SCANNER_SETTINGS.aiProvider,

      geminiApiKey: typeof s.geminiApiKey === "string" ? s.geminiApiKey : "",
      geminiModel,

      openaiApiKey: typeof s.openaiApiKey === "string" ? s.openaiApiKey : "",
      openaiModel:
        typeof s.openaiModel === "string"
          ? s.openaiModel
          : DEFAULT_SCANNER_SETTINGS.openaiModel,
      openaiBaseUrl: typeof s.openaiBaseUrl === "string" ? s.openaiBaseUrl : "",

      claudeApiKey: typeof s.claudeApiKey === "string" ? s.claudeApiKey : "",
      claudeModel:
        typeof s.claudeModel === "string"
          ? s.claudeModel
          : DEFAULT_SCANNER_SETTINGS.claudeModel,

      grokApiKey: typeof s.grokApiKey === "string" ? s.grokApiKey : "",
      grokModel:
        typeof s.grokModel === "string"
          ? s.grokModel
          : DEFAULT_SCANNER_SETTINGS.grokModel,
      grokBaseUrl:
        typeof s.grokBaseUrl === "string"
          ? s.grokBaseUrl
          : DEFAULT_SCANNER_SETTINGS.grokBaseUrl,

      customApiKey: typeof s.customApiKey === "string" ? s.customApiKey : "",
      customModel:
        typeof s.customModel === "string"
          ? s.customModel
          : DEFAULT_SCANNER_SETTINGS.customModel,
      customBaseUrl:
        typeof s.customBaseUrl === "string"
          ? s.customBaseUrl
          : DEFAULT_SCANNER_SETTINGS.customBaseUrl,
    };
  }

  // Not yet consolidated in v2 store: check legacy keys and migrate
  return readLegacySettings();
}

/** Synchronous, cross-tab reactive store for scanner settings */
export const scannerSettingsStore = createLocalStore<ScannerSettings>(
  STORAGE_KEY_SETTINGS_CONSOLIDATED,
  DEFAULT_SCANNER_SETTINGS,
  normalizeStoredSettings,
);

export function getScannerSettings(): ScannerSettings {
  return typeof window === "undefined"
    ? DEFAULT_SCANNER_SETTINGS
    : scannerSettingsStore.get();
}

export function saveScannerSetting<K extends keyof ScannerSettings>(
  key: K,
  value: ScannerSettings[K],
): void {
  if (typeof window === "undefined") return;

  // 1. Update the consolidated reactive store
  scannerSettingsStore.set((prev) => ({ ...prev, [key]: value }));

  // 2. Also keep legacy individual keys updated for external consumers
  try {
    const storageKey = KEY_MAP[key];
    if (storageKey) {
      localStorage.setItem(storageKey, String(value));
      window.dispatchEvent(
        new CustomEvent("scanner_settings_changed", {
          detail: { key, value },
        }),
      );
    }
  } catch {}
}

export function getActiveProviderConfig(settings: ScannerSettings): {
  provider: AiProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
} {
  switch (settings.aiProvider) {
    case "openai":
      return {
        provider: "openai",
        apiKey: settings.openaiApiKey,
        model: settings.openaiModel,
        baseUrl: settings.openaiBaseUrl || undefined,
      };
    case "claude":
      return {
        provider: "claude",
        apiKey: settings.claudeApiKey,
        model: settings.claudeModel,
      };
    case "grok":
      return {
        provider: "grok",
        apiKey: settings.grokApiKey,
        model: settings.grokModel,
        baseUrl: settings.grokBaseUrl || undefined,
      };
    case "custom":
      return {
        provider: "custom",
        apiKey: settings.customApiKey,
        model: settings.customModel,
        baseUrl: settings.customBaseUrl || undefined,
      };
    case "gemini":
    default:
      return {
        provider: "gemini",
        apiKey: settings.geminiApiKey,
        model: settings.geminiModel,
      };
  }
}

/**
 * Hook to read and update scanner settings.
 * Backed by `useSyncExternalStore` for instantaneous, synchronous reads without
 * hydration flicker, and automatic cross-tab and cross-component reactivity.
 */
export function useScannerSettings() {
  const [settings] = scannerSettingsStore.useValue();

  const updateSetting = useCallback(
    <K extends keyof ScannerSettings>(key: K, value: ScannerSettings[K]) => {
      saveScannerSetting(key, value);
    },
    [],
  );

  return { settings, updateSetting, mounted: true };
}
