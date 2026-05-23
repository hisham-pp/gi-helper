"use client";

import {
  Bot,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";
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

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, messages]);

  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen]);

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
    <>
      {isOpen ? (
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
                <h2 className="truncate text-sm font-black text-on-surface">
                  Farming Assistant
                </h2>
                <p className="truncate text-xs font-medium text-on-surface-variant">
                  Ready
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close assistant"
              className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-on-surface-variant transition hover:bg-surface-variant hover:text-on-surface"
              onClick={() => setIsOpen(false)}
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
                        : "bg-surface-variant text-on-surface",
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isSending ? (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-lg bg-surface-variant px-3 py-2 text-sm text-on-surface-variant">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking
                  </div>
                </div>
              ) : null}
              <div ref={messageEndRef} />
            </div>

            {error ? (
              <div className="mx-4 mb-3 rounded-lg border border-error/30 bg-error-container px-3 py-2 text-xs font-medium text-on-error-container">
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
                  className="min-h-11 flex-1 resize-none rounded-lg border border-outline-variant bg-background px-3 py-2 text-sm text-on-surface outline-none transition placeholder:text-on-surface-variant focus:border-primary focus:ring-2 focus:ring-primary/20"
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
      ) : (
        <button
          type="button"
          aria-label="Open farming assistant"
          className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition hover:scale-105 hover:shadow-2xl"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-6 w-6" />
          <Sparkles className="absolute right-2 top-2 h-3.5 w-3.5" />
        </button>
      )}
    </>
  );
}
