import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEnemyById } from "@/lib/enemy-data";
import { getAllCharacters } from "@/lib/static-data";
import { callAiProvider } from "@/lib/ai/providers";
import { resolveAiConfig } from "@/lib/ai/settings";

const bodySchema = z
  .object({
    level: z.number().int().min(1).max(100).nullable().optional(),
    notes: z.string().trim().max(500).optional(),
  })
  .default({});

type CharacterSummary = {
  name: string;
  element: string;
  weaponType: string;
  rarity: number;
  level: number | null;
  talents: {
    normalAttack: number | null;
    elementalSkill: number | null;
    elementalBurst: number | null;
  };
};

const COACH_SYSTEM_PROMPT = [
  "You are an expert Genshin Impact combat coach helping a player beat a specific enemy.",
  "You are given the enemy's data and the exact roster of characters the player owns.",
  "Produce a short, practical battle plan with these sections:",
  "1. Recommended team — pick up to 4 characters ONLY from the owned roster, and say each one's job (main DPS, sub-DPS, support, shield/heal).",
  "2. Why it works — the element counters and reactions that beat this enemy.",
  "3. Rotation & timing — a simple step-by-step opener the player can practice.",
  "4. Dodge & mechanics — concrete tips for this enemy's dangerous attacks.",
  "5. If the roster is weak against this enemy, say so plainly and recommend the closest owned option plus what to build or level next.",
  "Each owned character includes their current level and talent levels when the player has set them; factor these in and call out anything under-levelled that is worth upgrading before this fight.",
  "Never invent characters the player does not own. Keep it concise and actionable, using short bullet points.",
].join("\n");

export async function POST(
  request: Request,
  { params }: { params: Promise<{ enemyId: string }> },
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const { enemyId } = await params;
  const enemy = getEnemyById(enemyId);

  if (!enemy) {
    return NextResponse.json({ error: "Enemy not found." }, { status: 404 });
  }

  const json = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json ?? {});

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const owned = await prisma.ownedCharacter.findMany({
    where: { userId: user.id },
    select: {
      characterId: true,
      level: true,
      normalAttackLevel: true,
      elementalSkillLevel: true,
      elementalBurstLevel: true,
    },
  });
  const ownedIds = new Set(owned.map((item) => item.characterId));
  const progressById = new Map(owned.map((item) => [item.characterId, item]));

  const ownedCharacters: CharacterSummary[] = getAllCharacters()
    .filter((character) => ownedIds.has(character.id))
    .map((character) => {
      const progress = progressById.get(character.id);

      return {
        name: character.name,
        element: character.element,
        weaponType: character.weaponType,
        rarity: character.rarity,
        level: progress?.level ?? null,
        talents: {
          normalAttack: progress?.normalAttackLevel ?? null,
          elementalSkill: progress?.elementalSkillLevel ?? null,
          elementalBurst: progress?.elementalBurstLevel ?? null,
        },
      };
    });

  const bestElements = enemy.bestElements;
  const recommended = ownedCharacters.filter((character) =>
    bestElements.includes(character.element as (typeof bestElements)[number]),
  );
  const bench = ownedCharacters.filter(
    (character) => !recommended.includes(character),
  );

  const roster = {
    recommended,
    bench,
    ownedCount: ownedCharacters.length,
  };

  const config = await resolveAiConfig(user.id);

  // Deterministic roster match is always returned; the AI plan is best-effort.
  if (!config.configured) {
    return NextResponse.json({
      roster,
      plan: null,
      aiConfigured: false,
      usage: null,
    });
  }

  const level = parsed.data.level ?? null;
  const notes = parsed.data.notes ?? "";

  const coachContext = {
    enemy: {
      name: enemy.name,
      type: enemy.type,
      family: enemy.family,
      region: enemy.region,
      elements: enemy.elements,
      bestElements: enemy.bestElements,
      counterNotes: enemy.advice.map((item) => ({
        variant: item.element,
        counters: item.bestElements,
        note: item.note,
      })),
      description: enemy.description,
    },
    ownedCharacters,
    recommendedFromRoster: recommended.map((character) => character.name),
    playerCharacterLevel: level,
    playerNotes: notes || null,
  };

  const userMessage = [
    `Help me beat ${enemy.name}.`,
    level ? `My characters are around level ${level}.` : null,
    notes ? `Extra context: ${notes}` : null,
    "Use only the characters in my owned roster from the context.",
  ]
    .filter(Boolean)
    .join(" ");

  const result = await callAiProvider({
    providerId: config.provider,
    baseUrl: config.baseUrl,
    apiKey: config.apiKey,
    model: config.model,
    maxTokens: Math.max(config.maxTokens, 700),
    temperature: config.temperature,
    systemPrompt: `${COACH_SYSTEM_PROMPT}\n\nBattle context JSON:\n${JSON.stringify(
      coachContext,
    )}`,
    messages: [{ role: "user", content: userMessage }],
  });

  if (!result.ok) {
    // Still return the roster so the player gets something useful.
    return NextResponse.json({
      roster,
      plan: null,
      aiConfigured: true,
      aiError: result.error,
      usage: null,
    });
  }

  return NextResponse.json({
    roster,
    plan: result.text,
    aiConfigured: true,
    usage: result.usage,
  });
}
