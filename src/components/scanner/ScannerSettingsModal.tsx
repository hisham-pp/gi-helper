"use client";

import { createPortal } from "react-dom";
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

import { PillDropdown } from "@/components/ui/PillDropdown";
import { usePauseBackground } from "@/lib/use-pause-background";
import { useModalMotion } from "@/lib/use-modal-motion";

interface ScannerSettingsModalProps {
  onClose: () => void;
  serverEnv?: Record<string, ServerEnvProviderInfo>;
}

/**
 * AI Vision settings. The parent mounts it only while open (via
 * LazyScannerSettingsModal), so the server-env check runs once per open
 * instead of on every page load.
 */
export function ScannerSettingsModal({
  onClose,
  serverEnv: serverEnvProp,
}: ScannerSettingsModalProps) {
  const { settings, updateSetting, mounted } = useScannerSettings();
  const [showKey, setShowKey] = useState(false);
  const [internalServerEnv, setInternalServerEnv] = useState<
    Record<string, ServerEnvProviderInfo>
  >({});

  usePauseBackground();
  // Renders nothing until the saved settings load, so the entrance waits for them
  const { dialogRef, backdropRef, close } = useModalMotion(onClose, mounted);

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
  }, [serverEnvProp]);

  const serverEnv = serverEnvProp || internalServerEnv;
  const [testingStatus, setTestingStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  const adapters = listSupportedAdapters();
  const currentAdapter = getAiAdapter(settings.aiProvider);

  if (!mounted) return null;

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

  // Portal to <body>: an ancestor's transform/filter (e.g. the tab panel's entry
  // animation) would otherwise trap the fixed overlay and the glass blur inside it.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 bg-black/55 backdrop-blur-sm transition-opacity duration-300"
        onClick={close}
      />

      {/* Modal Dialog */}
      <div
        ref={dialogRef}
        className="glass-card glass-card--lg glass-card--raised relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="glass-chip h-10 w-10 justify-center rounded-xl text-cyan-300">
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
            onClick={close}
            className="glass-icon-btn h-9 w-9 rounded-full"
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

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
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
                    aria-pressed={isSelected}
                    data-active={isSelected}
                    className={`glass-card glass-card--hover flex flex-col items-center justify-center gap-1 rounded-2xl p-2.5 text-center hover:transform-none motion-safe:hover:animate-squish ${
                      isSelected ? "text-white" : "text-white/70 hover:text-white"
                    }`}
                  >
                    <span className="text-xs font-bold">
                      {adapter.displayName}
                    </span>
                    {hasUserKey ? (
                      <span className="rounded-full bg-emerald-500/20 px-1.5 text-[9px] font-semibold text-emerald-300">
                        Configured
                      </span>
                    ) : adapter.providerId === "gemini" ? (
                      <span className="rounded-full bg-sky-500/20 px-1.5 text-[9px] font-semibold text-sky-300">
                        Free Tier
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Provider Card */}
          <div className="glass-card space-y-4 rounded-3xl p-5">
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
                  className="glass-chip gap-1.5 px-3 py-1 text-xs font-semibold"
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
                  <Key className="h-3.5 w-3.5 text-cyan-300" />
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
                  className="glass-input w-full rounded-xl px-3.5 py-2.5 pr-11 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="glass-icon-btn absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2 rounded-lg bg-transparent shadow-none"
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
                <Cpu className="h-3.5 w-3.5 text-cyan-300" />
                <span>Model</span>
              </label>
              {currentAdapter.providerId === "custom" ? (
                <input
                  type="text"
                  value={currentModel}
                  onChange={(e) => handleUpdateActiveModel(e.target.value)}
                  placeholder="e.g. qwen/qwen-2-vl-72b-instruct"
                  className="glass-input w-full rounded-xl px-3.5 py-2.5 text-sm"
                />
              ) : (
                <PillDropdown
                  block
                  triggerRadius="rounded-xl"
                  value={currentModel}
                  onChange={(v) => handleUpdateActiveModel(v)}
                  options={currentAdapter.supportedModels.map((m) => ({
                    value: m.id,
                    label: m.label,
                  }))}
                />
              )}
            </div>

            {/* Base URL (for OpenAI, Grok, Custom) */}
            {(currentAdapter.providerId === "openai" ||
              currentAdapter.providerId === "grok" ||
              currentAdapter.providerId === "custom") && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
                    <Globe className="h-3.5 w-3.5 text-cyan-300" />
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
                  className="glass-input w-full rounded-xl px-3.5 py-2.5 text-sm"
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
                  className="glass-btn glass-btn--primary px-4 py-2 text-xs font-bold"
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
                  <div className="glass-chip gap-1.5 bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{testingStatus.message}</span>
                  </div>
                )}

                {testingStatus.success === false && (
                  <div className="glass-chip gap-1.5 bg-rose-500/15 px-3 py-1.5 text-xs font-medium text-rose-300">
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
            <div className="glass-card group flex items-start justify-between gap-4 rounded-3xl p-4">
              <div className="flex gap-3.5">
                <div className="glass-chip mt-0.5 h-8 w-8 shrink-0 justify-center rounded-lg text-emerald-300">
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
                className={`relative mt-1 inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 ${
                  settings.autoReviewResults
                    ? "bg-cyan-400/40 shadow-[inset_0_0_0_1px_rgba(165,243,252,0.55),inset_0_0_10px_rgba(103,232,249,0.35),0_0_14px_-2px_rgba(34,211,238,0.6)]"
                    : "glass-well"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-gradient-to-b from-snow to-cyan-50 shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_-1px_1px_rgba(8,145,178,0.25)] ring-0 transition duration-200 ease-in-out ${
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
            onClick={close}
            className="glass-btn glass-btn--primary px-6 py-2.5 text-sm font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
