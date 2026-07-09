"use client";

import { useMemo, useState } from "react";
import { KeyRound, Loader2, Plug, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";

import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Slider from "@mui/material/Slider";
import Switch from "@mui/material/Switch";

import AppButton from "@/components/core/button";
import AppTextField from "@/components/core/app-textfield";
import { Select } from "@/components/core/app-select";
import { Card } from "@/components/ui/card";
import {
  AI_PROVIDERS,
  getProviderDefinition,
  type ProviderId,
} from "@/lib/ai/providers";
import {
  AI_LIMITS,
  CONTEXT_TOPICS,
  DEFAULT_SYSTEM_PROMPT,
  type ContextTopicId,
} from "@/lib/ai/topics";
import type { AiSettingsView } from "@/lib/ai/settings";

type FormState = {
  provider: ProviderId;
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number | null;
  systemPrompt: string;
  contextTopics: ContextTopicId[];
  includeTrackerContext: boolean;
};

const providerOptions = AI_PROVIDERS.map((provider) => ({
  value: provider.id,
  label: provider.label,
}));

function fromView(view: AiSettingsView): FormState {
  return {
    provider: view.provider,
    baseUrl: view.baseUrl,
    model: view.model,
    maxTokens: view.maxTokens,
    temperature: view.temperature,
    systemPrompt: view.systemPrompt,
    contextTopics: view.contextTopics,
    includeTrackerContext: view.includeTrackerContext,
  };
}

export function AiSettingsForm({
  initialSettings,
}: Readonly<{ initialSettings: AiSettingsView }>) {
  const [form, setForm] = useState<FormState>(() => fromView(initialSettings));
  const [apiKey, setApiKey] = useState("");
  const [hasStoredKey, setHasStoredKey] = useState(initialSettings.hasApiKey);
  const [keyPreview, setKeyPreview] = useState(initialSettings.apiKeyPreview);
  const [clearKey, setClearKey] = useState(false);
  const [usingEnvFallback, setUsingEnvFallback] = useState(
    initialSettings.usingEnvFallback,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const provider = useMemo(
    () => getProviderDefinition(form.provider),
    [form.provider],
  );

  const useTemperature = form.temperature != null;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleProviderChange(nextId: string) {
    const next = getProviderDefinition(nextId);
    const previous = getProviderDefinition(form.provider);

    setForm((current) => ({
      ...current,
      provider: next.id,
      // Swap in the new provider's default model when the field is empty or
      // still holds the previous provider's default.
      model:
        !current.model.trim() || current.model === previous.defaultModel
          ? next.defaultModel
          : current.model,
    }));
  }

  function toggleTopic(topicId: ContextTopicId, checked: boolean) {
    setForm((current) => ({
      ...current,
      contextTopics: checked
        ? [...new Set([...current.contextTopics, topicId])]
        : current.contextTopics.filter((id) => id !== topicId),
    }));
  }

  function buildPayload() {
    return {
      provider: form.provider,
      baseUrl: form.baseUrl,
      model: form.model,
      maxTokens: form.maxTokens,
      temperature: form.temperature,
      systemPrompt: form.systemPrompt,
      contextTopics: form.contextTopics,
      includeTrackerContext: form.includeTrackerContext,
      ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
      ...(clearKey ? { clearApiKey: true } : {}),
    };
  }

  async function handleSave() {
    if (!form.model.trim()) {
      toast.error("Enter a model name.");
      return;
    }
    if (provider.requiresBaseUrl && !form.baseUrl.trim()) {
      toast.error("This provider needs a base URL.");
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch("/api/settings/ai", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const payload = (await response.json().catch(() => null)) as {
        settings?: AiSettingsView;
        error?: string;
      } | null;

      if (!response.ok || !payload?.settings) {
        throw new Error(payload?.error ?? "Could not save settings.");
      }

      const view = payload.settings;
      setForm(fromView(view));
      setHasStoredKey(view.hasApiKey);
      setKeyPreview(view.apiKeyPreview);
      setUsingEnvFallback(view.usingEnvFallback);
      setApiKey("");
      setClearKey(false);
      toast.success("AI settings saved.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save settings.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTest() {
    try {
      setIsTesting(true);
      const response = await fetch("/api/settings/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: form.provider,
          baseUrl: form.baseUrl,
          model: form.model,
          temperature: form.temperature,
          ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
        }),
      });
      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        reply?: string;
        usage?: { totalTokens?: number | null };
        error?: string;
      } | null;

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error ?? "Connection test failed.");
      }

      const tokens = payload.usage?.totalTokens;
      toast.success(
        `Connected. Model replied${tokens ? ` (~${tokens} tokens)` : ""}.`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Connection test failed.",
      );
    } finally {
      setIsTesting(false);
    }
  }

  const keyPlaceholder = hasStoredKey
    ? `Key saved${keyPreview ? ` (${keyPreview})` : ""} — leave blank to keep`
    : provider.keyHint;

  const busy = isSaving || isTesting;

  return (
    <div className="flex flex-col gap-6">
      {usingEnvFallback ? (
        <Card
          variant="outlined"
          className="border-primary/30 bg-primary/5 p-4 text-sm"
        >
          <p className="text-on-surface font-semibold">Using server defaults</p>
          <p className="text-on-surface-variant mt-1">
            The assistant is currently running on the app&apos;s built-in OpenAI
            configuration. Saving below overrides it with your own provider and
            key.
          </p>
        </Card>
      ) : null}

      {/* Provider & credentials */}
      <Card variant="outlined" className="flex flex-col gap-5 p-6">
        <div>
          <h2 className="text-on-surface text-lg font-bold">
            Provider & connection
          </h2>
          <p className="text-on-surface-variant text-sm">
            Pick any supported AI provider, or a custom OpenAI-compatible
            endpoint.
          </p>
        </div>

        <Select
          label="Provider"
          value={form.provider}
          options={providerOptions}
          onChange={handleProviderChange}
        />

        <AppTextField
          label={`Base URL${provider.requiresBaseUrl ? "" : " (optional)"}`}
          value={form.baseUrl}
          placeholder={provider.defaultBaseUrl || "https://…/v1"}
          onChange={(event) => update("baseUrl", event.target.value)}
          helperText={
            provider.requiresBaseUrl
              ? "Required for custom endpoints."
              : `Defaults to ${provider.defaultBaseUrl}`
          }
        />

        <AppTextField
          label="Model"
          value={form.model}
          placeholder={provider.defaultModel || "model-name"}
          onChange={(event) => update("model", event.target.value)}
        />

        <div className="flex flex-col gap-2">
          <AppTextField
            label={provider.keyLabel}
            type="password"
            value={apiKey}
            placeholder={keyPlaceholder}
            onChange={(event) => {
              setApiKey(event.target.value);
              if (event.target.value) setClearKey(false);
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <KeyRound className="text-on-surface-variant mr-2 h-4 w-4" />
                ),
              },
            }}
          />
          <div className="flex items-center gap-3">
            <p className="text-on-surface-variant text-xs">
              Stored encrypted at rest and never shown again after saving.
            </p>
            {hasStoredKey && !clearKey ? (
              <button
                type="button"
                className="text-xs font-semibold text-error underline-offset-2 hover:underline"
                onClick={() => {
                  setClearKey(true);
                  setApiKey("");
                }}
              >
                Remove saved key
              </button>
            ) : null}
            {clearKey ? (
              <span className="text-xs font-semibold text-error">
                Key will be removed on save.{" "}
                <button
                  type="button"
                  className="underline"
                  onClick={() => setClearKey(false)}
                >
                  Undo
                </button>
              </span>
            ) : null}
          </div>
        </div>

        <div>
          <AppButton
            variant="outlined"
            color="secondary"
            disabled={busy}
            startIcon={
              isTesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plug className="h-4 w-4" />
              )
            }
            onClick={handleTest}
          >
            {isTesting ? "Testing…" : "Test connection"}
          </AppButton>
        </div>
      </Card>

      {/* Tokens & sampling */}
      <Card variant="outlined" className="flex flex-col gap-5 p-6">
        <div>
          <h2 className="text-on-surface text-lg font-bold">Response limits</h2>
          <p className="text-on-surface-variant text-sm">
            Cap how many tokens each reply may use and, optionally, tune
            creativity.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-on-surface text-sm font-semibold">
              Max output tokens
            </label>
            <span className="text-on-surface-variant text-sm font-bold tabular-nums">
              {form.maxTokens}
            </span>
          </div>
          <Slider
            value={form.maxTokens}
            min={AI_LIMITS.minTokens}
            max={AI_LIMITS.maxTokens}
            step={16}
            onChange={(_, value) =>
              update("maxTokens", Array.isArray(value) ? value[0] : value)
            }
            sx={{ mt: 1 }}
          />
          <p className="text-on-surface-variant text-xs">
            Higher values allow longer answers but cost more per request.
          </p>
        </div>

        <div>
          <FormControlLabel
            control={
              <Switch
                checked={useTemperature}
                onChange={(event) =>
                  update("temperature", event.target.checked ? 0.7 : null)
                }
              />
            }
            label={
              <span className="text-on-surface text-sm font-semibold">
                Set temperature
              </span>
            }
          />
          {useTemperature ? (
            <div className="pl-1 pr-2">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant text-xs">Focused</span>
                <span className="text-on-surface-variant text-sm font-bold tabular-nums">
                  {form.temperature?.toFixed(2)}
                </span>
                <span className="text-on-surface-variant text-xs">
                  Creative
                </span>
              </div>
              <Slider
                value={form.temperature ?? 0.7}
                min={AI_LIMITS.minTemperature}
                max={AI_LIMITS.maxTemperature}
                step={0.05}
                onChange={(_, value) =>
                  update("temperature", Array.isArray(value) ? value[0] : value)
                }
              />
            </div>
          ) : (
            <p className="text-on-surface-variant text-xs">
              Off means the provider&apos;s default sampling is used.
            </p>
          )}
        </div>
      </Card>

      {/* Context & topics */}
      <Card variant="outlined" className="flex flex-col gap-5 p-6">
        <div>
          <h2 className="text-on-surface text-lg font-bold">
            Context & topics
          </h2>
          <p className="text-on-surface-variant text-sm">
            Control what the assistant knows about your account and how it
            behaves.
          </p>
        </div>

        <FormControlLabel
          control={
            <Switch
              checked={form.includeTrackerContext}
              onChange={(event) =>
                update("includeTrackerContext", event.target.checked)
              }
            />
          }
          label={
            <span className="text-on-surface text-sm font-semibold">
              Share tracker data with the assistant
            </span>
          }
        />

        <div className="flex flex-col gap-1">
          <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wide">
            Topics to include
          </p>
          <div className="grid gap-1 sm:grid-cols-2">
            {CONTEXT_TOPICS.map((topic) => (
              <FormControlLabel
                key={topic.id}
                disabled={!form.includeTrackerContext}
                control={
                  <Checkbox
                    checked={form.contextTopics.includes(topic.id)}
                    onChange={(event) =>
                      toggleTopic(topic.id, event.target.checked)
                    }
                  />
                }
                label={
                  <span className="text-on-surface text-sm">
                    <span className="font-semibold">{topic.label}</span>
                    <span className="text-on-surface-variant block text-xs">
                      {topic.description}
                    </span>
                  </span>
                }
                sx={{ alignItems: "flex-start", m: 0, py: 0.5 }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-on-surface text-sm font-semibold">
              System prompt
            </label>
            <button
              type="button"
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              onClick={() => update("systemPrompt", DEFAULT_SYSTEM_PROMPT)}
            >
              <RotateCcw className="h-3 w-3" /> Reset to default
            </button>
          </div>
          <AppTextField
            value={form.systemPrompt}
            multiline
            minRows={5}
            placeholder={DEFAULT_SYSTEM_PROMPT}
            onChange={(event) => update("systemPrompt", event.target.value)}
          />
          <p className="text-on-surface-variant text-xs">
            The base instructions sent before your tracker context on every
            request.
          </p>
        </div>
      </Card>

      <div className="sticky bottom-4 flex justify-end gap-3">
        <AppButton
          color="primary"
          disabled={busy}
          startIcon={
            isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )
          }
          onClick={handleSave}
        >
          {isSaving ? "Saving…" : "Save settings"}
        </AppButton>
      </div>
    </div>
  );
}
