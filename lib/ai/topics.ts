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
      "Which characters the user owns, with element, weapon type, level, and talent levels.",
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
  "Strongly factor in each owned character's level and talent levels (normal attack, elemental skill, elemental burst) when they are set. Prioritize farming for characters who are under-levelled or have low talent levels relative to their role, call out which talent is the biggest bottleneck, and don't recommend heavy investment in a character who is already well-built unless the user asks.",
  "When recommending characters, weapons, or materials to farm, use this exact format for each item:",
  "[ITEM_TYPE:ID] where ITEM_TYPE is one of: character, weapon, material, and ID is the exact id from the tracker context.",
  "For example: [character:albedo] or [material:grain-of-aerosiderite] or [weapon:skyward-blade]",
  "This will render the item with its proper icon and design in the chat interface.",
].join("\n");

export const AI_LIMITS = {
  minTokens: 64,
  maxTokens: 8000,
  minTemperature: 0,
  maxTemperature: 2,
} as const;
