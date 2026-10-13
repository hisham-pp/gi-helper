"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  X,
  CheckCircle2,
  Key,
  Cpu,
  Globe,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import {
  useScannerSettings,
  AiProvider,
  getActiveProviderConfig,
  ServerEnvProviderInfo,
} from "@/lib/scanner-settings";
import { listSupportedAdapters, getAiAdapter } from "@/lib/ai/adapters";
import { toast } from "sonner";

interface ScannerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverEnv?: Record<string, ServerEnvProviderInfo>;
}

export function ScannerSettingsModal({
  isOpen,
  onClose,
  serverEnv: serverEnvProp,
}: ScannerSettingsModalProps) {
  const { settings, updateSetting, mounted } = useScannerSettings();
  const [showKey, setShowKey] = useState(false);
  const [internalServerEnv, setInternalServerEnv] = useState<
    Record<string, ServerEnvProviderInfo>
  >({});

  useEffect(() => {
    if (serverEnvProp) {
      setInternalServerEnv(serverEnvProp);
      return;
    }
    fetch("/api/scanner/ai-vision")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.providers) {
          setInternalServerEnv(data.providers);
        }
      })
      .catch(() => {});
  }, [serverEnvProp, isOpen]);

  const serverEnv = serverEnvProp || internalServerEnv;
  const [testingStatus, setTestingStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  const adapters = listSupportedAdapters();
  const currentAdapter = getAiAdapter(settings.aiProvider);

  if (!isOpen || !mounted) return null;

  // Helpers to get and set active provider's specific fields
  const getActiveKey = (): string => {
    switch (settings.aiProvider) {
      case "openai":
        return settings.openaiApiKey;
      case "claude":
        return settings.claudeApiKey;
      case "grok":
        return settings.grokApiKey;
      case "custom":
        return settings.customApiKey;
      case "gemini":
      default:
        return settings.geminiApiKey;
    }
  };

  const getActiveModel = (): string => {
    switch (settings.aiProvider) {
      case "openai":
        return settings.openaiModel;
      case "claude":
        return settings.claudeModel;
      case "grok":
        return settings.grokModel;
      case "custom":
        return settings.customModel;
      case "gemini":
      default:
        return settings.geminiModel;
    }
  };

  const getActiveBaseUrl = (): string => {
    switch (settings.aiProvider) {
      case "openai":
        return settings.openaiBaseUrl;
      case "grok":
        return settings.grokBaseUrl;
      case "custom":
        return settings.customBaseUrl;
      default:
        return "";
    }
  };

  const handleUpdateActiveKey = (val: string) => {
    switch (settings.aiProvider) {
      case "openai":
        updateSetting("openaiApiKey", val);
        break;
      case "claude":
        updateSetting("claudeApiKey", val);
        break;
      case "grok":
        updateSetting("grokApiKey", val);
        break;
      case "custom":
        updateSetting("customApiKey", val);
        break;
      case "gemini":
      default:
        updateSetting("geminiApiKey", val);
        break;
    }
    setTestingStatus({ loading: false });
  };

  const handleUpdateActiveModel = (val: string) => {
    switch (settings.aiProvider) {
      case "openai":
        updateSetting("openaiModel", val);
        break;
      case "claude":
        updateSetting("claudeModel", val);
        break;
      case "grok":
        updateSetting("grokModel", val);
        break;
      case "custom":
        updateSetting("customModel", val);
        break;
      case "gemini":
      default:
        updateSetting("geminiModel", val);
        break;
    }
  };

  const handleUpdateActiveBaseUrl = (val: string) => {
    switch (settings.aiProvider) {
      case "openai":
        updateSetting("openaiBaseUrl", val);
        break;
      case "grok":
        updateSetting("grokBaseUrl", val);
        break;
      case "custom":
        updateSetting("customBaseUrl", val);
        break;
      default:
        break;
    }
  };

  const handleTestConnection = async () => {
    const config = getActiveProviderConfig(settings);

    setTestingStatus({ loading: true });

    try {
      const res = await fetch("/api/scanner/ai-vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          provider: config.provider,
          apiKey: config.apiKey,
          model: config.model,
          baseUrl: config.baseUrl,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setTestingStatus({
          loading: false,
          success: true,
          message: data.message || "Connected successfully!",
        });
        toast.success(`Connected to ${currentAdapter.displayName}!`);
      } else {
        setTestingStatus({
          loading: false,
          success: false,
          message: data.message || data.error || "Connection test failed.",
        });
        toast.error(`Connection failed: ${data.message || data.error}`);
      }
    } catch (err: any) {
      setTestingStatus({
        loading: false,
        success: false,
        message: err.message || "Network error while testing connection.",
      });
      toast.error("Network error during test");
    }
  };

  const currentKey = getActiveKey();
  const currentModel = getActiveModel();
  const currentBaseUrl = getActiveBaseUrl();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border-[0.5px] border-b-white/5 border-l-white/20 border-r-white/5 border-t-white/30 bg-gradient-to-br from-neutral-900/95 via-neutral-900/90 to-black/95 text-white shadow-[0_20px_60px_0_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/10 bg-primary/20 p-2.5 text-primary shadow-inner">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white drop-shadow-sm">
                Scanner AI Settings
              </h2>
              <p className="text-xs text-white/60">
                Choose your AI Vision provider and configure API credentials
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
            aria-label="Close settings"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6 sm:px-8">
          {/* Provider Selection Tabs */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-white/70">
                AI Vision Provider
              </label>
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                <Sparkles className="h-3 w-3" />
                Keys stored securely in your browser
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {adapters.map((adapter) => {
                const isSelected = settings.aiProvider === adapter.providerId;
                const userKey = (() => {
                  switch (adapter.providerId) {
                    case "openai":
                      return settings.openaiApiKey;
                    case "claude":
                      return settings.claudeApiKey;
                    case "grok":
                      return settings.grokApiKey;
                    case "custom":
                      return settings.customApiKey;
                    case "gemini":
                    default:
                      return settings.geminiApiKey;
                  }
                })();
                const hasUserKey = Boolean(userKey?.trim());

                return (
                  <button
                    key={adapter.providerId}
                    type="button"
                    onClick={() => {
                      updateSetting(
                        "aiProvider",
                        adapter.providerId as AiProvider,
                      );
                      setTestingStatus({ loading: false });
                    }}
                    className={`relative flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-center transition-all ${
                      isSelected
                        ? "border-primary bg-primary/20 text-white shadow-[0_0_15px_rgba(var(--md-sys-color-primary),0.3)]"
                        : "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                    }`}
                  >
                    <span className="text-xs font-bold">
                      {adapter.displayName}
                    </span>
                    {hasUserKey ? (
                      <span className="py-0.2 rounded bg-emerald-500/20 px-1 text-[9px] font-semibold text-emerald-300">
                        Configured
                      </span>
                    ) : adapter.providerId === "gemini" ? (
                      <span className="py-0.2 rounded bg-sky-500/20 px-1 text-[9px] font-semibold text-sky-300">
                        Free Tier
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Provider Card */}
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">
                  {currentAdapter.displayName} Configuration
                </h3>
                <p className="text-xs text-white/60">
                  {currentAdapter.description}
                </p>
              </div>
              {currentAdapter.docsUrl && (
                <a
                  href={currentAdapter.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/80 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  <span>Get API Key</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {/* API Key Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
                  <Key className="h-3.5 w-3.5 text-primary" />
                  <span>API Key</span>
                </label>
                {Boolean(currentKey?.trim()) ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    Key saved in browser
                  </span>
                ) : (
                  <span className="text-[10px] text-white/40">
                    User-configured (Stored in browser)
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={currentKey}
                  onChange={(e) => handleUpdateActiveKey(e.target.value)}
                  placeholder={
                    Boolean(serverEnv[settings.aiProvider]?.hasKey)
                      ? "Pre-configured on server (enter to override)"
                      : `Enter your ${currentAdapter.displayName} API key...`
                  }
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-3.5 py-2.5 pr-10 text-sm text-white placeholder-white/30 transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 transition-colors hover:text-white"
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Model Selection */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
                <Cpu className="h-3.5 w-3.5 text-primary" />
                <span>Model</span>
              </label>
              {currentAdapter.providerId === "custom" ? (
                <input
                  type="text"
                  value={currentModel}
                  onChange={(e) => handleUpdateActiveModel(e.target.value)}
                  placeholder="e.g. qwen/qwen-2-vl-72b-instruct"
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-sm text-white placeholder-white/30 transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              ) : (
                <select
                  value={currentModel}
                  onChange={(e) => handleUpdateActiveModel(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-neutral-900 px-3.5 py-2.5 text-sm text-white transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {currentAdapter.supportedModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Base URL (for OpenAI, Grok, Custom) */}
            {(currentAdapter.providerId === "openai" ||
              currentAdapter.providerId === "grok" ||
              currentAdapter.providerId === "custom") && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
                    <Globe className="h-3.5 w-3.5 text-primary" />
                    <span>Custom Base URL (Optional)</span>
                  </label>
                  {currentAdapter.defaultBaseUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateActiveBaseUrl(
                          currentAdapter.defaultBaseUrl || "",
                        )
                      }
                      className="text-[10px] text-white/50 underline hover:text-white"
                    >
                      Reset default
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={currentBaseUrl}
                  onChange={(e) => handleUpdateActiveBaseUrl(e.target.value)}
                  placeholder={
                    currentAdapter.defaultBaseUrl || "https://api.openai.com/v1"
                  }
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-sm text-white placeholder-white/30 transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}

            {/* Test Connection Button & Status */}
            <div className="pt-2">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={testingStatus.loading}
                  onClick={handleTestConnection}
                  className="flex items-center gap-2 rounded-xl border border-primary/50 bg-primary/20 px-4 py-2 text-xs font-bold text-primary transition-all hover:bg-primary/30 active:scale-95 disabled:opacity-50"
                >
                  {testingStatus.loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Testing API Key...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Test Connection</span>
                    </>
                  )}
                </button>

                {testingStatus.success && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{testingStatus.message}</span>
                  </div>
                )}

                {testingStatus.success === false && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-300">
                    <AlertCircle className="h-4 w-4" />
                    <span>{testingStatus.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* General Scanning Preferences */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/70">
              Workflow Preferences
            </h4>

            {/* Auto Review Toggle */}
            <div className="group flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-all hover:border-white/20 hover:bg-white/[0.07]">
              <div className="flex gap-3.5">
                <div className="mt-0.5 rounded-lg border border-white/10 bg-white/10 p-2 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <label
                    htmlFor="toggle-auto-review"
                    className="cursor-pointer text-sm font-semibold text-white drop-shadow-sm"
                  >
                    Auto-Review Scan Results
                  </label>
                  <p className="text-xs leading-relaxed text-white/70">
                    Automatically open the review modal after AI analysis to
                    verify detected materials and adjust quantities.
                  </p>
                </div>
              </div>

              <button
                id="toggle-auto-review"
                type="button"
                role="switch"
                aria-checked={settings.autoReviewResults}
                onClick={() =>
                  updateSetting(
                    "autoReviewResults",
                    !settings.autoReviewResults,
                  )
                }
                className={`relative mt-1 inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.autoReviewResults
                    ? "bg-primary shadow-[0_0_12px_rgba(var(--md-sys-color-primary),0.6)]"
                    : "bg-white/20"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.autoReviewResults
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 sm:px-8">
          <span className="text-xs text-white/40">
            Changes are saved instantly in your browser
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
