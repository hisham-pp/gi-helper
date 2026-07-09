"use client";

import { useCallback, useState } from "react";

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

/**
 * Shared chat state + send logic used by both the floating assistant modal and
 * the full-page assistant. Keeping it in one hook means the two surfaces stay
 * behaviourally identical.
 */
export function useAssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialAssistantMessages,
  );
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<TokenUsage | null>(null);

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
