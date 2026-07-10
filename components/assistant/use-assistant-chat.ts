"use client";

import { useCallback, useEffect, useState } from "react";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type TokenUsage = {
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
};

export const initialAssistantMessages: ChatMessage[] = [
  {
    role: "assistant",
    content: "What are we farming today?",
  },
];

const STORAGE_KEY = "gmt:assistant-chat:v1";
const MAX_STORED_MESSAGES = 60;

type StoredChatState = {
  messages: ChatMessage[];
  usage: TokenUsage | null;
};

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ChatMessage>;

  return (
    (candidate.role === "user" || candidate.role === "assistant") &&
    typeof candidate.content === "string"
  );
}

function loadStoredChat(): StoredChatState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<StoredChatState> | null;
    const messages = Array.isArray(parsed?.messages)
      ? parsed.messages.filter(isChatMessage)
      : null;

    if (!messages || messages.length === 0) {
      return null;
    }

    return { messages, usage: parsed?.usage ?? null };
  } catch {
    return null;
  }
}

function saveStoredChat(state: StoredChatState) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        messages: state.messages.slice(-MAX_STORED_MESSAGES),
        usage: state.usage,
      }),
    );
  } catch {
    // Storage may be unavailable (private browsing, quota, disabled cookies)
    // — the conversation still works in-memory, it just won't persist.
  }
}

/**
 * Shared chat state + send logic used by both the floating assistant modal and
 * the full-page assistant. Keeping it in one hook means the two surfaces stay
 * behaviourally identical, and since both read/write the same localStorage
 * key, a conversation started in one continues seamlessly in the other.
 */
export function useAssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialAssistantMessages,
  );
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<TokenUsage | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Restore a saved conversation after mount. Deferred to an effect (rather
  // than a useState initializer) so the server-rendered markup and the first
  // client render match exactly; the swap to persisted content happens right
  // after, same pattern as next-themes reading a saved theme.
  useEffect(() => {
    const stored = loadStoredChat();

    if (stored) {
      setMessages(stored.messages);
      setUsage(stored.usage);
    }

    setIsHydrated(true);
  }, []);

  // Persist on every change, but only once hydration has resolved — writing
  // before that would overwrite a saved conversation with the pre-load
  // default state.
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    saveStoredChat({ messages, usage });
  }, [messages, usage, isHydrated]);

  const sendMessage = useCallback(async () => {
    const content = draft.trim();

    if (!content || isSending) {
      return;
    }

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content },
    ];

    setDraft("");
    setError(null);
    setMessages(nextMessages);
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const payload = (await response.json().catch(() => null)) as {
        reply?: string;
        usage?: TokenUsage;
        error?: string;
      } | null;

      if (!response.ok || !payload?.reply) {
        throw new Error(payload?.error ?? "Assistant failed to respond.");
      }

      setUsage(payload.usage ?? null);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: payload.reply ?? "" },
      ]);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Assistant failed to respond.";

      setError(message);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: message },
      ]);
    } finally {
      setIsSending(false);
    }
  }, [draft, isSending, messages]);

  const reset = useCallback(() => {
    setMessages(initialAssistantMessages);
    setDraft("");
    setError(null);
    setUsage(null);
  }, []);

  return {
    messages,
    draft,
    setDraft,
    isSending,
    error,
    usage,
    sendMessage,
    reset,
  };
}

export function formatUsage(usage: TokenUsage | null): string | null {
  if (!usage?.totalTokens) {
    return null;
  }

  const detail =
    usage.inputTokens != null && usage.outputTokens != null
      ? ` (${usage.inputTokens} in / ${usage.outputTokens} out)`
      : "";

  return `Last reply · ${usage.totalTokens} tokens${detail}`;
}
