"use client";

import { Bot, Loader2, Send, X } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import { cn } from "@/lib/utils";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const initialMessages: ChatMessage[] = [
  {
    role: "assistant",
    content: "What are we farming today?",
  },
];

export function ChatAssistantPanel({
  onClose,
}: Readonly<{
  onClose: () => void;
}>) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    window.setTimeout(() => inputRef.current?.focus(), 120);
  }, []);

  async function sendMessage() {
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
        error?: string;
      } | null;

      if (!response.ok || !payload?.reply) {
        throw new Error(payload?.error ?? "Assistant failed to respond.");
      }

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
        {
          role: "assistant",
          content: message,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <section
      aria-label="AI farming assistant"
      className="fixed bottom-4 left-4 right-4 z-50 flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface shadow-2xl sm:left-auto sm:w-[24rem]"
    >
      <header className="flex items-center justify-between gap-3 border-b border-outline-variant px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-on-surface truncate text-sm font-black">
              Farming Assistant
            </h2>
            <p className="text-on-surface-variant truncate text-xs font-medium">
              Ready
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close assistant"
          className="text-on-surface-variant hover:text-on-surface grid h-9 w-9 flex-shrink-0 place-items-center rounded-full transition hover:bg-surface-variant"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="max-h-[52dvh] min-h-64 flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm leading-relaxed",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "text-on-surface bg-surface-variant",
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isSending ? (
            <div className="flex justify-start">
              <div className="text-on-surface-variant flex items-center gap-2 rounded-lg bg-surface-variant px-3 py-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking
              </div>
            </div>
          ) : null}
          <div ref={messageEndRef} />
        </div>

        {error ? (
          <div className="text-on-error-container mx-4 mb-3 rounded-lg border border-error/30 bg-error-container px-3 py-2 text-xs font-medium">
            {error}
          </div>
        ) : null}

        <form
          className="border-t border-outline-variant p-3"
          onSubmit={handleSubmit}
        >
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={draft}
              rows={2}
              maxLength={1800}
              placeholder="Ask a farming question..."
              className="text-on-surface placeholder:text-on-surface-variant min-h-11 flex-1 resize-none rounded-lg border border-outline-variant bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="submit"
              disabled={!draft.trim() || isSending}
              aria-label="Send message"
              className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:shadow-md disabled:pointer-events-none disabled:opacity-40"
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
