import type { AiSetting } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { decryptSecret, encryptSecret, maskSecret } from "@/lib/ai/crypto";
import {
  DEFAULT_PROVIDER_ID,
  getProviderDefinition,
  type ProviderId,
} from "@/lib/ai/providers";
import {
  CONTEXT_TOPIC_IDS,
  DEFAULT_SYSTEM_PROMPT,
  type ContextTopicId,
} from "@/lib/ai/topics";

export {
  AI_LIMITS,
  CONTEXT_TOPICS,
  CONTEXT_TOPIC_IDS,
  DEFAULT_SYSTEM_PROMPT,
} from "@/lib/ai/topics";
export type { ContextTopicId } from "@/lib/ai/topics";

/**
 * Shape returned to the client. The raw API key is never included — only a
 * boolean and a masked preview.
 */
export type AiSettingsView = {
  provider: ProviderId;
  baseUrl: string;
  hasApiKey: boolean;
  apiKeyPreview: string | null;
  model: string;
  maxTokens: number;
  temperature: number | null;
  systemPrompt: string;
  contextTopics: ContextTopicId[];
  includeTrackerContext: boolean;
  /** True when values come from server env vars rather than saved settings. */
  usingEnvFallback: boolean;
};

/** Fully resolved config the chat route uses to call a provider. */
export type ResolvedAiConfig = {
  provider: ProviderId;
  baseUrl: string;
  apiKey: string | null;
  model: string;
  maxTokens: number;
  temperature: number | null;
  systemPrompt: string;
  contextTopics: ContextTopicId[];
  includeTrackerContext: boolean;
  configured: boolean;
};

function parseTopics(raw: string | null | undefined): ContextTopicId[] {
  if (!raw) {
    return [...CONTEXT_TOPIC_IDS];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [...CONTEXT_TOPIC_IDS];
    }

    const filtered = parsed.filter((topic): topic is ContextTopicId =>
      CONTEXT_TOPIC_IDS.includes(topic as ContextTopicId),
    );

    return filtered;
  } catch {
    return [...CONTEXT_TOPIC_IDS];
  }
}

export async function getAiSetting(userId: string): Promise<AiSetting | null> {
  return prisma.aiSetting.findUnique({ where: { userId } });
}

export function toSettingsView(setting: AiSetting | null): AiSettingsView {
  if (!setting) {
    const envKey = process.env.OPENAI_API_KEY ?? null;
    const provider = getProviderDefinition(DEFAULT_PROVIDER_ID);

    return {
      provider: DEFAULT_PROVIDER_ID,
      baseUrl: "",
      hasApiKey: Boolean(envKey),
      apiKeyPreview: maskSecret(envKey),
      model: process.env.OPENAI_MODEL ?? provider.defaultModel,
      maxTokens: 700,
      temperature: null,
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      contextTopics: [...CONTEXT_TOPIC_IDS],
      includeTrackerContext: true,
      usingEnvFallback: true,
    };
  }

  const apiKey = decryptSecret(setting.apiKey);

  return {
    provider: getProviderDefinition(setting.provider).id,
    baseUrl: setting.baseUrl ?? "",
    hasApiKey: Boolean(apiKey),
    apiKeyPreview: maskSecret(apiKey),
    model: setting.model,
    maxTokens: setting.maxTokens,
    temperature: setting.temperature,
    systemPrompt: setting.systemPrompt ?? DEFAULT_SYSTEM_PROMPT,
    contextTopics: parseTopics(setting.contextTopics),
    includeTrackerContext: setting.includeTrackerContext,
    usingEnvFallback: false,
  };
}

/**
 * Resolves the effective config for a chat request: saved settings when they
 * exist, otherwise the legacy env-var based OpenAI defaults.
 */
export async function resolveAiConfig(
  userId: string,
): Promise<ResolvedAiConfig> {
  const setting = await getAiSetting(userId);

  if (!setting) {
    const provider = getProviderDefinition(DEFAULT_PROVIDER_ID);
    const apiKey = process.env.OPENAI_API_KEY ?? null;

    return {
      provider: DEFAULT_PROVIDER_ID,
      baseUrl: provider.defaultBaseUrl,
      apiKey,
      model: process.env.OPENAI_MODEL ?? provider.defaultModel,
      maxTokens: 700,
      temperature: null,
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      contextTopics: [...CONTEXT_TOPIC_IDS],
      includeTrackerContext: true,
      configured: Boolean(apiKey),
    };
  }

  const provider = getProviderDefinition(setting.provider);
  const apiKey = decryptSecret(setting.apiKey);
  const baseUrl = setting.baseUrl?.trim() || provider.defaultBaseUrl;

  return {
    provider: provider.id,
    baseUrl,
    apiKey,
    model: setting.model || provider.defaultModel,
    maxTokens: setting.maxTokens,
    temperature: setting.temperature,
    systemPrompt: setting.systemPrompt?.trim() || DEFAULT_SYSTEM_PROMPT,
    contextTopics: parseTopics(setting.contextTopics),
    includeTrackerContext: setting.includeTrackerContext,
    // Google + local servers may not need a key, but every hosted provider does.
    configured: Boolean(apiKey) || provider.id === "custom",
  };
}

export type AiSettingsInput = {
  provider: ProviderId;
  baseUrl: string;
  apiKey?: string | null;
  clearApiKey?: boolean;
  model: string;
  maxTokens: number;
  temperature: number | null;
  systemPrompt: string;
  contextTopics: ContextTopicId[];
  includeTrackerContext: boolean;
};

export async function saveAiSetting(
  userId: string,
  input: AiSettingsInput,
): Promise<AiSettingsView> {
  // Only overwrite the stored key when a new one is provided or an explicit
  // clear is requested; blank input leaves the existing key untouched.
  let apiKeyToStore: string | null | undefined = undefined;
  if (input.clearApiKey) {
    apiKeyToStore = null;
  } else if (input.apiKey && input.apiKey.trim()) {
    apiKeyToStore = encryptSecret(input.apiKey.trim());
  }

  const data = {
    provider: input.provider,
    baseUrl: input.baseUrl.trim() || null,
    model: input.model.trim(),
    maxTokens: input.maxTokens,
    temperature: input.temperature,
    systemPrompt: input.systemPrompt.trim() || null,
    contextTopics: JSON.stringify(input.contextTopics),
    includeTrackerContext: input.includeTrackerContext,
  };

  const saved = await prisma.aiSetting.upsert({
    where: { userId },
    create: {
      userId,
      ...data,
      apiKey: apiKeyToStore ?? null,
    },
    update: {
      ...data,
      ...(apiKeyToStore !== undefined ? { apiKey: apiKeyToStore } : {}),
    },
  });

  return toSettingsView(saved);
}
