"use client";

import dynamic from "next/dynamic";
import { Loader2, MessageCircle, Sparkles } from "lucide-react";
import { useState } from "react";

const ChatAssistantPanel = dynamic(
  () =>
    import("@/components/layout/chat-assistant").then(
      (module) => module.ChatAssistantPanel,
    ),
  {
    loading: () => (
      <button
        type="button"
        aria-label="Loading farming assistant"
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-80 shadow-xl"
      >
        <Loader2 className="h-6 w-6 animate-spin" />
      </button>
    ),
    ssr: false,
  },
);

export function ChatAssistantLoader() {
  const [isOpen, setIsOpen] = useState(false);

  if (isOpen) {
    return <ChatAssistantPanel onClose={() => setIsOpen(false)} />;
  }

  return (
    <button
      type="button"
      aria-label="Open farming assistant"
      className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition hover:scale-105 hover:shadow-2xl"
      onClick={() => setIsOpen(true)}
    >
      <MessageCircle className="h-6 w-6" />
      <Sparkles className="absolute right-2 top-2 h-3.5 w-3.5" />
    </button>
  );
}
