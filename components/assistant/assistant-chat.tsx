"use client";

import type { Route } from "next";
import Link from "next/link";
import { Bot, Loader2, RotateCcw, Send, Settings } from "lucide-react";
import { useEffect, useRef, type FormEvent, type KeyboardEvent } from "react";

import {
  formatUsage,
  initialAssistantMessages,
  useAssistantChat,
} from "@/components/assistant/use-assistant-chat";
import { Markdown } from "@/components/ui/markdown";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "What should I farm today with my current goals?",
  "Which of my characters still need boss materials?",
  "Prioritize my open goals by what I can finish soonest.",
  "What talent books do I still need this week?",
];

export function AssistantChat() {
  const {
    messages,
    draft,
    setDraft,
    isSending,
    error,
    usage,
    sendMessage,
    reset,
  } = useAssistantChat();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    window.setTimeout(() => inputRef.current?.focus(), 120);
  }, []);

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

  function applySuggestion(text: string) {
    setDraft(text);
    inputRef.current?.focus();
  }

  const usageLabel = formatUsage(usage);
  const isFresh =
    messages.length <= initialAssistantMessages.length && !isSending;

  return (
    <div className="flex h-[calc(100dvh-9rem)] min-h-[520px] flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface lg:h-[calc(100dvh-7rem)]">
      <header className="flex items-center justify-between gap-3 border-b border-outline-variant px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-on-surface truncate text-base font-black">
              Farming Assistant
            </h1>
            <p className="text-on-surface-variant truncate text-xs font-medium">
              {usageLabel ?? "Grounded in your inventory, goals, and roster"}
            </p>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label="Clear conversation"
            title="New conversation"
            disabled={isFresh}
            onClick={reset}
            className="text-on-surface-variant hover:text-on-surface grid h-9 w-9 place-items-center rounded-full transition hover:bg-surface-variant disabled:pointer-events-none disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <Link
            href={"/settings" as Route}
            aria-label="AI settings"
            title="AI settings"
            className="text-on-surface-variant hover:text-on-surface grid h-9 w-9 place-items-center rounded-full transition hover:bg-surface-variant"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6">
        <div className="flex-1 space-y-4">
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
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:text-[0.95rem]",
                  message.role === "user"
                    ? "whitespace-pre-wrap bg-primary text-primary-foreground"
                    : "text-on-surface bg-surface-variant",
                )}
              >
                {message.role === "assistant" ? (
                  <Markdown>{message.content}</Markdown>
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))}
          {isSending ? (
            <div className="flex justify-start">
              <div className="text-on-surface-variant flex items-center gap-2 rounded-2xl bg-surface-variant px-4 py-2.5 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking
              </div>
            </div>
          ) : null}
          <div ref={messageEndRef} />
        </div>

        {isFresh ? (
          <div className="mt-6">
            <p className="text-on-surface-variant mb-2 text-xs font-semibold uppercase tracking-wide">
              Try asking
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => applySuggestion(suggestion)}
                  className="text-on-surface-variant hover:text-on-surface rounded-full border border-outline-variant px-3 py-1.5 text-left text-xs font-medium transition hover:bg-surface-variant"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          <div className="text-on-error-container mb-3 rounded-lg border border-error/30 bg-error-container px-3 py-2 text-xs font-medium">
            {error}
          </div>
        </div>
      ) : null}

      <form
        className="border-t border-outline-variant px-4 py-4 sm:px-6"
        onSubmit={handleSubmit}
      >
        <div className="mx-auto flex w-full max-w-3xl items-end gap-2">
          <textarea
            ref={inputRef}
            value={draft}
            rows={1}
            maxLength={1800}
            placeholder="Ask a farming question…"
            className="text-on-surface placeholder:text-on-surface-variant max-h-40 min-h-12 flex-1 resize-none rounded-2xl border border-outline-variant bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="submit"
            disabled={!draft.trim() || isSending}
            aria-label="Send message"
            className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:shadow-md disabled:pointer-events-none disabled:opacity-40"
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
  );
}
