"use client";

import { useState, useEffect, useCallback } from "react";
import { AiProviderId } from "./ai/adapters/types";

export type AiProvider = AiProviderId;

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
  openaiModel: "gpt-4o-mini",
  openaiBaseUrl: "",

  claudeApiKey: "",
  claudeModel: "claude-3-5-sonnet-latest",

  grokApiKey: "",
  grokModel: "grok-2-vision-1212",
  grokBaseUrl: "https://api.x.ai/v1",

  customApiKey: "",
  customModel: "qwen/qwen-2-vl-72b-instruct",
  customBaseUrl: "https://openrouter.ai/api/v1",
};

export function getScannerSettings(): ScannerSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SCANNER_SETTINGS;
  }

  try {
    const layoutVal = localStorage.getItem(STORAGE_KEY_LAYOUT);
    const reviewVal = localStorage.getItem(STORAGE_KEY_REVIEW);
    const providerVal = localStorage.getItem(
      STORAGE_KEY_AI_PROVIDER,
    ) as AiProvider | null;

    let storedGeminiModel =
      localStorage.getItem(STORAGE_KEY_GEMINI_MODEL) ||
      DEFAULT_SCANNER_SETTINGS.geminiModel;

    // Migrate deprecated model strings
    if (storedGeminiModel === "gemini-1.5-flash" || storedGeminiModel === "gemini-2.0-flash") {
      storedGeminiModel = "gemini-flash-latest";
      try {
        localStorage.setItem(STORAGE_KEY_GEMINI_MODEL, "gemini-flash-latest");
      } catch {}
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
  } catch (e) {
    console.error("Failed to read scanner settings from localStorage", e);
    return DEFAULT_SCANNER_SETTINGS;
  }
}

export function saveScannerSetting<K extends keyof ScannerSettings>(
  key: K,
  value: ScannerSettings[K],
): void {
  if (typeof window === "undefined") return;

  try {
    const keyMap: Record<keyof ScannerSettings, string> = {
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

    const storageKey = keyMap[key];
    if (storageKey) {
      localStorage.setItem(storageKey, String(value));
      window.dispatchEvent(
        new CustomEvent("scanner_settings_changed", {
          detail: { key, value },
        }),
      );
    }
  } catch (e) {
    console.error("Failed to save scanner setting to localStorage", e);
  }
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
    <K extends keyof ScannerSettings>(key: K, value: ScannerSettings[K]) => {
      saveScannerSetting(key, value);
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  return { settings, updateSetting, mounted };
}
