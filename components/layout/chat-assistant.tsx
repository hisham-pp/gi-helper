"use client";

import type { Route } from "next";
import Link from "next/link";
import { Bot, Loader2, Maximize2, Send, X } from "lucide-react";
import { useEffect, useRef, useMemo, type FormEvent, type KeyboardEvent } from "react";

import {
  formatUsage,
  useAssistantChat,
} from "@/components/assistant/use-assistant-chat";
import { Markdown } from "@/components/ui/markdown";
import { useStaticCharacters, useStaticMaterials, useStaticWeapons } from "@/lib/cached-data";
import { cn } from "@/lib/utils";

export function ChatAssistantPanel({
  onClose,
}: Readonly<{
  onClose: () => void;
}>) {
  const { messages, draft, setDraft, isSending, error, usage, sendMessage } =
    useAssistantChat();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch item data for rendering
  const { data: charactersData } = useStaticCharacters();
  const { data: weaponsData } = useStaticWeapons();
  const { data: materialsData } = useStaticMaterials();

  // Prepare item data maps for Markdown component
  const itemData = useMemo(() => {
    const charactersMap = new Map();
    const weaponsMap = new Map();
    const materialsMap = new Map();

    if (charactersData?.characters) {
      charactersData.characters.forEach((char) => {
        charactersMap.set(char.id, {
          id: char.id,
          name: char.name,
          image: char.image,
          rarity: char.rarity,
          element: char.element,
          weaponType: char.weaponType,
        });
      });
    }

    if (weaponsData?.weapons) {
      weaponsData.weapons.forEach((weapon) => {
        weaponsMap.set(weapon.id, {
          id: weapon.id,
          name: weapon.name,
          image: weapon.image,
          rarity: weapon.rarity,
          weaponType: weapon.weaponType,
        });
      });
    }

    if (materialsData?.materials) {
      materialsData.materials.forEach((material) => {
        materialsMap.set(material.id, {
          id: material.id,
          name: material.name,
          image: material.image,
          rarity: material.rarity,
          category: material.category,
        });
      });
    }

    return {
      characters: charactersMap,
      weapons: weaponsMap,
      materials: materialsMap,
    };
  }, [charactersData, weaponsData, materialsData]);

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

  const usageLabel = formatUsage(usage);

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
              {usageLabel ?? "Ready"}
            </p>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1">
          <Link
            href={"/assistant" as Route}
            aria-label="Open full assistant page"
            title="Open full page"
            className="text-on-surface-variant hover:text-on-surface grid h-9 w-9 place-items-center rounded-full transition hover:bg-surface-variant"
            onClick={onClose}
          >
            <Maximize2 className="h-4 w-4" />
          </Link>
          <button
            type="button"
            aria-label="Close assistant"
            className="text-on-surface-variant hover:text-on-surface grid h-9 w-9 place-items-center rounded-full transition hover:bg-surface-variant"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
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
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                  message.role === "user"
                    ? "whitespace-pre-wrap bg-primary text-primary-foreground"
                    : "text-on-surface bg-surface-variant",
                )}
              >
                {message.role === "assistant" ? (
                  <Markdown itemData={itemData}>{message.content}</Markdown>
                ) : (
                  message.content
                )}
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
