"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  X,
  CheckCircle2,
  Key,
  Cpu,
  Globe,
  ExternalLink,
  Sparkles,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import {
  useScannerSettings,
  AiProvider,
  ServerEnvProviderInfo,
  DEFAULT_SERVER_ENV_PROVIDERS,
} from "@/lib/scanner/settings";
import {
  listSupportedAdapters,
  getAiAdapter,
  resolveAdapterModel,
} from "@/lib/ai/adapters";
import { toast } from "sonner";
import { GlassInput } from "@/components/ui/GlassInput";
import { PillDropdown } from "@/components/ui/PillDropdown";
import { triggerHaptic } from "@/lib/haptics";

export interface ScannerSettingsContentProps {
  onClose?: () => void;
  serverEnv?: Record<string, ServerEnvProviderInfo>;
  isPage?: boolean;
}

/**
 * Shared Scanner & AI Vision settings content.
 * Rendered both inside the desktop modal and on the dedicated mobile settings page.
 */
export function ScannerSettingsContent({
  onClose,
  serverEnv: serverEnvProp,
  isPage = false,
}: ScannerSettingsContentProps) {
  const router = useRouter();
  const { settings, updateSetting, mounted } = useScannerSettings();
  const [internalServerEnv, setInternalServerEnv] = useState<
    Record<string, ServerEnvProviderInfo>
  >(serverEnvProp || DEFAULT_SERVER_ENV_PROVIDERS);

  useEffect(() => {
    if (serverEnvProp) {
      setInternalServerEnv(serverEnvProp);
      return;
    }
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return;
    }
    fetch("/api/scanner/ai-vision")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.providers) {
          setInternalServerEnv(data.providers);
        }
      })
      .catch(() => {
        setInternalServerEnv(DEFAULT_SERVER_ENV_PROVIDERS);
      });
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
      case "gemini":
      case "claude":
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
    triggerHaptic("selection");
    setTestingStatus({ loading: true });

    try {
      const activeKey = getActiveKey();
      const activeModel = getActiveModel();
      const activeBaseUrl = getActiveBaseUrl();

      const res = await fetch("/api/scanner/ai-vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: settings.aiProvider,
          apiKey: activeKey,
          model: activeModel,
          baseUrl: activeBaseUrl,
          testOnly: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        triggerHaptic("success");
        setTestingStatus({
          loading: false,
          success: true,
          message: data.message || "Connection verified successfully!",
        });
        toast.success(
          `${currentAdapter.displayName} connection tested successfully.`,
        );
      } else {
        triggerHaptic("error");
        setTestingStatus({
          loading: false,
          success: false,
          message: data.message || data.error || "Connection test failed.",
        });
        toast.error(`Connection failed: ${data.message || data.error}`);
      }
    } catch (err: unknown) {
      triggerHaptic("error");
      const message =
        err instanceof Error
          ? err.message
          : "Network error while testing connection.";
      setTestingStatus({
        loading: false,
        success: false,
        message,
      });
      toast.error("Network error during test");
    }
  };

  const currentKey = getActiveKey();
  const currentModel = resolveAdapterModel(currentAdapter, getActiveModel());
  const currentBaseUrl = getActiveBaseUrl();

  const handleDone = () => {
    triggerHaptic("selection");
    if (onClose) {
      onClose();
    } else if (isPage) {
      router.back();
    }
  };

  return (
    <div className="flex flex-col w-full text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8 sm:py-5">
        <div className="flex items-center gap-3">
          {isPage ? (
            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                router.back();
              }}
              className="glass-chip h-9 w-9 justify-center rounded-xl text-white/70 hover:text-white transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : (
            <div className="glass-chip h-10 w-10 justify-center rounded-xl text-cyan-300">
              <Settings className="h-5 w-5" />
            </div>
          )}
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white drop-shadow-sm">
              Scanner AI Settings
            </h2>
            <p className="text-xs text-white/60">
              Choose your AI Vision provider and configure API credentials
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic("light");
              onClose();
            }}
            className="glass-icon-btn h-9 w-9 rounded-full"
            aria-label="Close settings"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Scrollable / Flow Body */}
      <div
        className={`flex-1 space-y-6 px-5 py-6 sm:px-8 ${
          isPage ? "" : "max-h-[70vh] overflow-y-auto"
        }`}
      >
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
                    triggerHaptic("selection");
                    updateSetting("aiProvider", adapter.providerId as AiProvider);
                    setTestingStatus({ loading: false });
                  }}
                  aria-pressed={isSelected}
                  data-active={isSelected}
                  className={`glass-card glass-card--hover flex flex-col items-center justify-center gap-1 rounded-2xl p-2.5 text-center hover:transform-none motion-safe:hover:animate-squish ${
                    isSelected ? "text-white" : "text-white/70 hover:text-white"
                  }`}
                >
                  <span className="text-xs font-bold">{adapter.displayName}</span>
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
            <GlassInput
              type="password"
              value={currentKey}
              onValueChange={handleUpdateActiveKey}
              placeholder={
                Boolean(serverEnv[settings.aiProvider]?.hasKey)
                  ? "Pre-configured on server (enter to override)"
                  : `Enter your ${currentAdapter.displayName} API key...`
              }
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          {/* Model Selection */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
              <Cpu className="h-3.5 w-3.5 text-cyan-300" />
              <span>Model</span>
            </label>
            {currentAdapter.providerId === "custom" ? (
              <GlassInput
                value={currentModel}
                onValueChange={handleUpdateActiveModel}
                placeholder="e.g. google/gemini-3.8-flash"
                spellCheck={false}
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
              <GlassInput
                type="url"
                value={currentBaseUrl}
                onValueChange={handleUpdateActiveBaseUrl}
                placeholder={
                  currentAdapter.defaultBaseUrl || "https://api.openai.com/v1"
                }
                spellCheck={false}
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
              onClick={() => {
                triggerHaptic("selection");
                updateSetting(
                  "autoReviewResults",
                  !settings.autoReviewResults,
                );
              }}
              className={`relative mt-1 inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 ${
                settings.autoReviewResults
                  ? "bg-cyan-400/40 shadow-[inset_0_0_0_1px_rgba(165,243,252,0.55),inset_0_0_10px_rgba(103,232,249,0.35),0_0_14px_-2px_rgba(34,211,238,0.6)]"
                  : "glass-well"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-gradient-to-b from-snow to-cyan-50 shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_-1px_1px_rgba(8,145,178,0.25)] ring-0 transition duration-200 ease-in-out ${
                  settings.autoReviewResults ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/10 px-5 py-4 sm:px-8">
        <span className="text-xs text-white/40">
          Changes are saved instantly in your browser
        </span>
        <button
          type="button"
          onClick={handleDone}
          className="glass-btn glass-btn--primary px-6 py-2.5 text-sm font-bold"
        >
          Done
        </button>
      </div>
    </div>
  );
}
