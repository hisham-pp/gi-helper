import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getAssistantTrackerContext } from "@/lib/chat-context";
import { autoTagItemReferences } from "@/lib/ai/item-tags";
import { callAiProvider, type ChatMessage } from "@/lib/ai/providers";
import {
  CONTEXT_TOPICS,
  resolveAiConfig,
  type ContextTopicId,
} from "@/lib/ai/settings";

const MAX_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 1800;

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ChatMessage>;

  return (
    (candidate.role === "user" || candidate.role === "assistant") &&
    typeof candidate.content === "string" &&
    candidate.content.trim().length > 0 &&
    candidate.content.length <= MAX_MESSAGE_LENGTH
  );
}

function buildTrackerContextJson(
  fullContext: Record<string, unknown>,
  topics: ContextTopicId[],
) {
  const selectedKeys = new Set<string>(
    CONTEXT_TOPICS.filter((topic) => topics.includes(topic.id)).map(
      (topic) => topic.contextKey,
    ),
  );

  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fullContext)) {
    if (selectedKeys.has(key)) {
      filtered[key] = value;
    }
  }

  return filtered;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const config = await resolveAiConfig(user.id);

  if (!config.configured) {
    return NextResponse.json(
      {
        error:
          "The AI assistant is not configured yet. Add a provider and API key in Settings.",
      },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    messages?: unknown;
  } | null;
  const messages = Array.isArray(body?.messages)
    ? body.messages.filter(isChatMessage).slice(-MAX_MESSAGES)
    : [];

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json(
      { error: "Send at least one user message." },
      { status: 400 },
    );
  }

  let systemPrompt = config.systemPrompt;

  if (config.includeTrackerContext && config.contextTopics.length > 0) {
    const trackerContext = await getAssistantTrackerContext(user.id);
    const filtered = buildTrackerContextJson(
      trackerContext as unknown as Record<string, unknown>,
      config.contextTopics,
    );

    systemPrompt = `${systemPrompt}\n\nTracker context JSON:\n${JSON.stringify(
      filtered,
    )}`;
  }

  const result = await callAiProvider({
    providerId: config.provider,
    baseUrl: config.baseUrl,
    apiKey: config.apiKey,
    model: config.model,
    maxTokens: config.maxTokens,
    temperature: config.temperature,
    systemPrompt,
    messages,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  if (!result.text) {
    return NextResponse.json(
      { error: "The assistant returned an empty response." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    reply: autoTagItemReferences(result.text),
    usage: result.usage,
  });
}
