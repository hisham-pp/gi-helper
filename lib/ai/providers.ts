/**
 * Provider registry + a single `callAiProvider` entry point that normalizes
 * requests and responses across OpenAI-compatible, Anthropic, and Google
 * Gemini APIs. Adding a new OpenAI-compatible host is just another entry in
 * `AI_PROVIDERS` pointing at the `openai-chat` kind with its base URL.
 */

export type ProviderKind =
  | "openai-responses"
  | "openai-chat"
  | "anthropic"
  | "google";

export type ProviderId =
  | "openai-responses"
  | "openai-chat"
  | "anthropic"
  | "google"
  | "openrouter"
  | "groq"
  | "custom";

export type ProviderDefinition = {
  id: ProviderId;
  label: string;
  kind: ProviderKind;
  defaultBaseUrl: string;
  defaultModel: string;
  /** Whether the user is expected to supply their own base URL. */
  requiresBaseUrl: boolean;
  keyLabel: string;
  keyHint: string;
  docsUrl: string;
};

export const AI_PROVIDERS: ProviderDefinition[] = [
  {
    id: "openai-responses",
    label: "OpenAI (Responses API)",
    kind: "openai-responses",
    defaultBaseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-5-mini",
    requiresBaseUrl: false,
    keyLabel: "OpenAI API key",
    keyHint: "Starts with sk-…",
    docsUrl: "https://platform.openai.com/api-keys",
  },
  {
    id: "openai-chat",
    label: "OpenAI (Chat Completions)",
    kind: "openai-chat",
    defaultBaseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    requiresBaseUrl: false,
    keyLabel: "OpenAI API key",
    keyHint: "Starts with sk-…",
    docsUrl: "https://platform.openai.com/api-keys",
  },
  {
    id: "anthropic",
    label: "Anthropic (Claude)",
    kind: "anthropic",
    defaultBaseUrl: "https://api.anthropic.com/v1",
    defaultModel: "claude-haiku-4-5-20251001",
    requiresBaseUrl: false,
    keyLabel: "Anthropic API key",
    keyHint: "Starts with sk-ant-…",
    docsUrl: "https://console.anthropic.com/settings/keys",
  },
  {
    id: "google",
    label: "Google Gemini",
    kind: "google",
    defaultBaseUrl: "https://generativelanguage.googleapis.com/v1beta",
    defaultModel: "gemini-2.0-flash",
    requiresBaseUrl: false,
    keyLabel: "Google AI Studio key",
    keyHint: "From aistudio.google.com",
    docsUrl: "https://aistudio.google.com/app/apikey",
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    kind: "openai-chat",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "openai/gpt-4o-mini",
    requiresBaseUrl: false,
    keyLabel: "OpenRouter API key",
    keyHint: "Starts with sk-or-…",
    docsUrl: "https://openrouter.ai/keys",
  },
  {
    id: "groq",
    label: "Groq",
    kind: "openai-chat",
    defaultBaseUrl: "https://api.groq.com/openai/v1",
    defaultModel: "llama-3.3-70b-versatile",
    requiresBaseUrl: false,
    keyLabel: "Groq API key",
    keyHint: "Starts with gsk_…",
    docsUrl: "https://console.groq.com/keys",
  },
  {
    id: "custom",
    label: "Custom (OpenAI-compatible)",
    kind: "openai-chat",
    defaultBaseUrl: "",
    defaultModel: "",
    requiresBaseUrl: true,
    keyLabel: "API key",
    keyHint: "Optional for local servers",
    docsUrl: "",
  },
];

export const DEFAULT_PROVIDER_ID: ProviderId = "openai-responses";

export function getProviderDefinition(
  id: string | null | undefined,
): ProviderDefinition {
  return (
    AI_PROVIDERS.find((provider) => provider.id === id) ??
    AI_PROVIDERS.find((provider) => provider.id === DEFAULT_PROVIDER_ID)!
  );
}

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type TokenUsage = {
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
};

export type AiCallConfig = {
  providerId: ProviderId;
  baseUrl: string;
  apiKey: string | null;
  model: string;
  maxTokens: number;
  temperature: number | null;
  systemPrompt: string;
  messages: ChatMessage[];
};

export type AiCallResult =
  | { ok: true; text: string; usage: TokenUsage }
  | { ok: false; status: number; error: string };

function trimBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, "");
}

export async function callAiProvider(
  config: AiCallConfig,
): Promise<AiCallResult> {
  const provider = getProviderDefinition(config.providerId);
  const baseUrl = trimBaseUrl(config.baseUrl || provider.defaultBaseUrl);

  if (!baseUrl) {
    return { ok: false, status: 400, error: "No API base URL configured." };
  }

  try {
    switch (provider.kind) {
      case "openai-responses":
        return await callOpenAiResponses(baseUrl, config);
      case "openai-chat":
        return await callOpenAiChat(baseUrl, config);
      case "anthropic":
        return await callAnthropic(baseUrl, config);
      case "google":
        return await callGoogle(baseUrl, config);
      default:
        return { ok: false, status: 400, error: "Unsupported provider." };
    }
  } catch (error) {
    console.error("AI provider request failed", error);
    return {
      ok: false,
      status: 502,
      error:
        error instanceof Error
          ? error.message
          : "The AI provider request failed.",
    };
  }
}

async function callOpenAiResponses(
  baseUrl: string,
  config: AiCallConfig,
): Promise<AiCallResult> {
  if (!config.apiKey) {
    return { ok: false, status: 400, error: "API key is required." };
  }

  const response = await fetch(`${baseUrl}/responses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      instructions: config.systemPrompt,
      input: config.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      max_output_tokens: config.maxTokens,
      ...(config.temperature != null
        ? { temperature: config.temperature }
        : {}),
    }),
  });

  const payload = (await response.json().catch(() => null)) as {
    output_text?: string;
    output?: Array<{
      content?: Array<{ type?: string; text?: string }>;
    }>;
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      total_tokens?: number;
    };
    error?: {
      message?: string;
      metadata?: {
        message?: string;
        code?: string;
        [key: string]: unknown;
      };
    };
  } | null;

  if (!response.ok) {
    console.error("OpenAI responses API error response:", {
      status: response.status,
      payload,
    });

    const errorMessage =
      payload?.error?.metadata?.message ??
      payload?.error?.message ??
      "The assistant could not respond.";

    return {
      ok: false,
      status: response.status,
      error: errorMessage,
    };
  }

  const text =
    (typeof payload?.output_text === "string" && payload.output_text.trim()
      ? payload.output_text.trim()
      : payload?.output
          ?.flatMap((item) => item.content ?? [])
          .filter((content) => content.type === "output_text" && content.text)
          .map((content) => content.text)
          .join("\n")
          .trim()) ?? "";

  return {
    ok: true,
    text,
    usage: {
      inputTokens: payload?.usage?.input_tokens ?? null,
      outputTokens: payload?.usage?.output_tokens ?? null,
      totalTokens: payload?.usage?.total_tokens ?? null,
    },
  };
}

async function callOpenAiChat(
  baseUrl: string,
  config: AiCallConfig,
): Promise<AiCallResult> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (config.apiKey) {
    headers.Authorization = `Bearer ${config.apiKey}`;
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: config.systemPrompt },
        ...config.messages,
      ],
      max_tokens: config.maxTokens,
      ...(config.temperature != null
        ? { temperature: config.temperature }
        : {}),
    }),
  });

  const payload = (await response.json().catch(() => null)) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
    error?: {
      message?: string;
      metadata?: {
        message?: string;
        code?: string;
        [key: string]: unknown;
      };
    };
  } | null;

  if (!response.ok) {
    console.error("OpenAI chat API error response:", {
      status: response.status,
      payload,
    });

    const errorMessage =
      payload?.error?.metadata?.message ??
      payload?.error?.message ??
      "The assistant could not respond.";

    return {
      ok: false,
      status: response.status,
      error: errorMessage,
    };
  }

  const text = payload?.choices?.[0]?.message?.content?.trim() ?? "";

  return {
    ok: true,
    text,
    usage: {
      inputTokens: payload?.usage?.prompt_tokens ?? null,
      outputTokens: payload?.usage?.completion_tokens ?? null,
      totalTokens: payload?.usage?.total_tokens ?? null,
    },
  };
}

async function callAnthropic(
  baseUrl: string,
  config: AiCallConfig,
): Promise<AiCallResult> {
  if (!config.apiKey) {
    return { ok: false, status: 400, error: "API key is required." };
  }

  const response = await fetch(`${baseUrl}/messages`, {
    method: "POST",
    headers: {
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      system: config.systemPrompt,
      messages: config.messages,
      max_tokens: config.maxTokens,
      ...(config.temperature != null
        ? { temperature: config.temperature }
        : {}),
    }),
  });

  const payload = (await response.json().catch(() => null)) as {
    content?: Array<{ type?: string; text?: string }>;
    usage?: { input_tokens?: number; output_tokens?: number };
    error?: { message?: string };
  } | null;

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: payload?.error?.message ?? "The assistant could not respond.",
    };
  }

  const text =
    payload?.content
      ?.filter((block) => block.type === "text" && block.text)
      .map((block) => block.text)
      .join("\n")
      .trim() ?? "";

  const inputTokens = payload?.usage?.input_tokens ?? null;
  const outputTokens = payload?.usage?.output_tokens ?? null;

  return {
    ok: true,
    text,
    usage: {
      inputTokens,
      outputTokens,
      totalTokens:
        inputTokens != null && outputTokens != null
          ? inputTokens + outputTokens
          : null,
    },
  };
}

async function callGoogle(
  baseUrl: string,
  config: AiCallConfig,
): Promise<AiCallResult> {
  if (!config.apiKey) {
    return { ok: false, status: 400, error: "API key is required." };
  }

  const url = `${baseUrl}/models/${encodeURIComponent(
    config.model,
  )}:generateContent?key=${encodeURIComponent(config.apiKey)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: config.systemPrompt }],
      },
      contents: config.messages.map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }],
      })),
      generationConfig: {
        maxOutputTokens: config.maxTokens,
        ...(config.temperature != null
          ? { temperature: config.temperature }
          : {}),
      },
    }),
  });

  const payload = (await response.json().catch(() => null)) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
    usageMetadata?: {
      promptTokenCount?: number;
      candidatesTokenCount?: number;
      totalTokenCount?: number;
    };
    error?: { message?: string };
  } | null;

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: payload?.error?.message ?? "The assistant could not respond.",
    };
  }

  const text =
    payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join("\n")
      .trim() ?? "";

  return {
    ok: true,
    text,
    usage: {
      inputTokens: payload?.usageMetadata?.promptTokenCount ?? null,
      outputTokens: payload?.usageMetadata?.candidatesTokenCount ?? null,
      totalTokens: payload?.usageMetadata?.totalTokenCount ?? null,
    },
  };
}
