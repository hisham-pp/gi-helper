import { Bug, Ellipsis, Lightbulb, MessageSquare, type LucideIcon } from "lucide-react";
import type { FeedbackKind } from "@/lib/feedback/types";

/** How each kind of message looks in the send form and the inbox. */
export const KIND_META: Record<
  FeedbackKind,
  { label: string; plural: string; icon: LucideIcon; color: string; placeholder: string }
> = {
  feedback: {
    label: "Feedback",
    plural: "Feedback",
    icon: MessageSquare,
    color: "text-cyan-300",
    placeholder: "What do you like about GI Helper, or what could be better?",
  },
  bug: {
    label: "Bug",
    plural: "Bugs",
    icon: Bug,
    color: "text-rose-300",
    placeholder:
      "What happened, and what did you expect? Steps to reproduce and a screenshot help a lot.",
  },
  idea: {
    label: "Idea",
    plural: "Ideas",
    icon: Lightbulb,
    color: "text-amber-300",
    placeholder: "What would you like GI Helper to do?",
  },
  other: {
    label: "Other",
    plural: "Other",
    icon: Ellipsis,
    color: "text-violet-300",
    placeholder: "What's on your mind?",
  },
};

const DATE = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

/** "Oct 14, 2026"; fixed locale and zone, so server and browser render the same text. */
export function formatFeedbackDate(iso: string): string {
  return DATE.format(new Date(iso));
}
