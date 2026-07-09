import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getAssistantTrackerContext } from "@/lib/chat-context";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ResponsesPayload = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  error?: {
    message?: string;
    metadata?: {
      message?: string;
      code?: string;
      [key: string]: unknown;
    };
  };
};

const MAX_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 1800;
const DEFAULT_MODEL = "gpt-5-mini";

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

function extractResponseText(payload: ResponsesPayload) {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  return (
    payload.output
      ?.flatMap((item) => item.content ?? [])
      .filter((content) => content.type === "output_text" && content.text)
      .map((content) => content.text)
      .join("\n")
      .trim() ?? ""
  );
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured." },
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

  const trackerContext = await getAssistantTrackerContext(user.id);
  const model = process.env.OPENAI_MODEL ?? DEFAULT_MODEL;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions: [
        "You are a concise Genshin Impact farming assistant inside a material tracker app.",
        "Use the tracker context as the source of truth for the user's owned characters, inventory, open goals, and missing materials.",
        "Prefer practical farming and prioritization advice. If the user asks for data that is not in the context, say what is missing and suggest the closest useful next step.",
        "Do not invent inventory quantities, owned characters, or goal progress.",
        `Tracker context JSON:\n${JSON.stringify(trackerContext)}`,
      ].join("\n\n"),
      input: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      max_output_tokens: 700,
    }),
  });

  const payload = (await response.json().catch(() => null)) as
    | ResponsesPayload
    | null;

  if (!response.ok) {
    console.error("Chat API error response:", {
      status: response.status,
      payload,
    });

    const errorMessage =
      payload?.error?.metadata?.message ??
      payload?.error?.message ??
      "The assistant could not respond right now.";

    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: response.status },
    );
  }

  const reply = payload ? extractResponseText(payload) : "";

  if (!reply) {
    return NextResponse.json(
      { error: "The assistant returned an empty response." },
      { status: 502 },
    );
  }

  return NextResponse.json({ reply });
}
