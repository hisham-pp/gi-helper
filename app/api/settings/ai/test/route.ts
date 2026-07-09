import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { AI_LIMITS, resolveAiConfig } from "@/lib/ai/settings";
import {
  AI_PROVIDERS,
  callAiProvider,
  getProviderDefinition,
  type ProviderId,
} from "@/lib/ai/providers";

const providerIds = AI_PROVIDERS.map((provider) => provider.id) as [
  ProviderId,
  ...ProviderId[],
];

/**
 * Optional overrides let the user test the values currently in the form before
 * saving. Any field left out falls back to the saved configuration. When the
 * API key is omitted, the previously saved (encrypted) key is reused.
 */
const testSchema = z
  .object({
    provider: z.enum(providerIds).optional(),
    baseUrl: z.string().trim().max(2048).optional(),
    apiKey: z.string().max(4096).optional(),
    model: z.string().trim().max(200).optional(),
    maxTokens: z
      .number()
      .int()
      .min(AI_LIMITS.minTokens)
      .max(AI_LIMITS.maxTokens)
      .optional(),
    temperature: z
      .number()
      .min(AI_LIMITS.minTemperature)
      .max(AI_LIMITS.maxTemperature)
      .nullable()
      .optional(),
  })
  .default({});

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const json = await request.json().catch(() => ({}));
  const parsed = testSchema.safeParse(json ?? {});

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid test payload." },
      { status: 400 },
    );
  }

  const saved = await resolveAiConfig(user.id);
  const overrides = parsed.data;

  const providerId = overrides.provider ?? saved.provider;
  const provider = getProviderDefinition(providerId);
  const baseUrl =
    overrides.baseUrl?.trim() || saved.baseUrl || provider.defaultBaseUrl;
  const model = overrides.model?.trim() || saved.model || provider.defaultModel;
  const apiKey =
    overrides.apiKey && overrides.apiKey.trim()
      ? overrides.apiKey.trim()
      : saved.apiKey;

  if (!apiKey && provider.id !== "custom") {
    return NextResponse.json(
      { error: "Add an API key before testing the connection." },
      { status: 400 },
    );
  }

  const result = await callAiProvider({
    providerId,
    baseUrl,
    apiKey,
    model,
    maxTokens: Math.min(overrides.maxTokens ?? 64, 128),
    temperature: overrides.temperature ?? saved.temperature,
    systemPrompt:
      "You are a connection test. Reply with a single short word to confirm you are reachable.",
    messages: [
      { role: "user", content: "Say 'connected' if you can read this." },
    ],
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({
    ok: true,
    reply: result.text,
    usage: result.usage,
    provider: provider.label,
    model,
  });
}
