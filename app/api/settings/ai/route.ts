import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import {
  AI_LIMITS,
  CONTEXT_TOPIC_IDS,
  getAiSetting,
  saveAiSetting,
  toSettingsView,
  type ContextTopicId,
} from "@/lib/ai/settings";
import { AI_PROVIDERS, type ProviderId } from "@/lib/ai/providers";

const providerIds = AI_PROVIDERS.map((provider) => provider.id) as [
  ProviderId,
  ...ProviderId[],
];

const topicIds = CONTEXT_TOPIC_IDS as [ContextTopicId, ...ContextTopicId[]];

const updateSchema = z.object({
  provider: z.enum(providerIds),
  baseUrl: z.string().trim().max(2048).default(""),
  apiKey: z.string().max(4096).optional(),
  clearApiKey: z.boolean().optional(),
  model: z.string().trim().min(1, "Model is required.").max(200),
  maxTokens: z.number().int().min(AI_LIMITS.minTokens).max(AI_LIMITS.maxTokens),
  temperature: z
    .number()
    .min(AI_LIMITS.minTemperature)
    .max(AI_LIMITS.maxTemperature)
    .nullable()
    .default(null),
  systemPrompt: z.string().max(8000).default(""),
  contextTopics: z.array(z.enum(topicIds)).default([]),
  includeTrackerContext: z.boolean().default(true),
});

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const setting = await getAiSetting(user.id);

  return NextResponse.json({ settings: toSettingsView(setting) });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid settings." },
      { status: 400 },
    );
  }

  const view = await saveAiSetting(user.id, {
    provider: parsed.data.provider,
    baseUrl: parsed.data.baseUrl,
    apiKey: parsed.data.apiKey ?? null,
    clearApiKey: parsed.data.clearApiKey,
    model: parsed.data.model,
    maxTokens: parsed.data.maxTokens,
    temperature: parsed.data.temperature,
    systemPrompt: parsed.data.systemPrompt,
    contextTopics: parsed.data.contextTopics,
    includeTrackerContext: parsed.data.includeTrackerContext,
  });

  return NextResponse.json({ settings: view });
}
