/**
 * Pure, dependency-free AI constants that are safe to import from client
 * components. Server-only helpers live in `lib/ai/settings.ts`, which
 * re-exports these values.
 */

/**
 * The knowledge "topics" the assistant can be given about the user's tracker.
 * Each maps to a section of the assistant tracker context.
 */
export const CONTEXT_TOPICS = [
  {
    id: "characters",
    label: "Owned characters",
    description:
      "Which characters the user owns, with element and weapon type.",
    contextKey: "ownedCharacters",
  },
  {
    id: "inventory",
    label: "Inventory",
    description: "Material quantities the user currently has in stock.",
    contextKey: "inventory",
  },
  {
    id: "materials-needed",
    label: "Materials still needed",
    description: "Outstanding materials across every open goal.",
    contextKey: "materialsStillNeeded",
  },
  {
    id: "goals",
    label: "Active goals",
    description: "In-progress farming goals and their per-material progress.",
    contextKey: "activeGoals",
  },
] as const;

export type ContextTopicId = (typeof CONTEXT_TOPICS)[number]["id"];

export const CONTEXT_TOPIC_IDS = CONTEXT_TOPICS.map(
  (topic) => topic.id,
) as ContextTopicId[];

export const DEFAULT_SYSTEM_PROMPT = [
  "You are a concise Genshin Impact farming assistant inside a material tracker app.",
  "Use the tracker context as the source of truth for the user's owned characters, inventory, open goals, and missing materials.",
  "Prefer practical farming and prioritization advice. If the user asks for data that is not in the context, say what is missing and suggest the closest useful next step.",
  "Do not invent inventory quantities, owned characters, or goal progress.",
].join("\n");

export const AI_LIMITS = {
  minTokens: 64,
  maxTokens: 8000,
  minTemperature: 0,
  maxTemperature: 2,
} as const;
