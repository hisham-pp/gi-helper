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
  "Respond in exactly two parts.",
  'PART 1 — a single fenced ```json code block containing {"team":[{"name":"<exact name from the owned roster>","role":"Main DPS|Sub-DPS|Support|Shield/Heal","reason":"one short sentence"}]} with up to 4 characters chosen ONLY from the owned roster. Use the exact character names as written in the roster.',
  "PART 2 — after the closing ```, write the rest of the plan in Markdown using these sections as bold headings: 'Why it works' (element counters and reactions), 'Rotation & timing' (a simple step-by-step opener to practice), and 'Dodge & mechanics' (this enemy's dangerous attacks). Do NOT repeat the team roster in the Markdown.",
  "If the roster is weak against this enemy, still pick the closest owned options for the team and explain the weakness under 'Why it works', noting what to build or level next.",
  "Each owned character includes their current level and talent levels when the player has set them; factor these in and flag anything under-levelled worth upgrading first.",
  "Never invent characters the player does not own. Keep it concise and actionable.",
  "IMPORTANT: Only include ONE Traveler in the team (e.g., either Traveler (Hydro) OR Traveler (Anemo), never both). The player can only use one Traveler at a time.",
].join("\n");

type RawTeamMember = {
  name?: unknown;
  role?: unknown;
  reason?: unknown;
};

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/**
 * Splits the model output into the leading ```json team block and the
 * remaining Markdown. Falls back to an empty team + the full text when the
 * block is missing or unparseable, so the plan always still renders.
 */
function extractTeamAndPlan(text: string): {
  team: RawTeamMember[];
  plan: string;
} {
  const match = text.match(/```json\s*([\s\S]*?)```/i);

  if (!match) {
    return { team: [], plan: text.trim() };
  }

  try {
    const parsed = JSON.parse(match[1]) as { team?: unknown };
    const team = Array.isArray(parsed?.team)
      ? (parsed.team as RawTeamMember[])
      : [];
    const plan = text.replace(match[0], "").trim();

    return { team, plan };
  } catch {
    return { team: [], plan: text.replace(match[0], "").trim() };
  }
}

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

  const ownedFull = getAllCharacters().filter((character) =>
    ownedIds.has(character.id),
  );
  // Lets us map an AI-picked character name back to its portrait + metadata.
  const metaByName = new Map(
    ownedFull.map((character) => [normalizeName(character.name), character]),
  );

  const ownedCharacters: CharacterSummary[] = ownedFull.map((character) => {
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
      team: [],
      plan: null,
      aiConfigured: true,
      aiError: result.error,
      usage: null,
    });
  }

  const { team: rawTeam, plan } = extractTeamAndPlan(result.text);

  const filteredRawTeam = rawTeam
    .filter((member): member is RawTeamMember & { name: string } =>
      Boolean(member && typeof member.name === "string" && member.name.trim()),
    )
    .slice(0, 4);

  // Ensure only one Traveler is included (player can only use one at a time)
  const travelerCount = filteredRawTeam.filter((member) =>
    member.name.toLowerCase().includes("traveler"),
  ).length;

  let finalRawTeam = filteredRawTeam;
  if (travelerCount > 1) {
    // Keep only the first Traveler and remove the rest
    let travelerSeen = false;
    finalRawTeam = filteredRawTeam.filter((member) => {
      if (member.name.toLowerCase().includes("traveler")) {
        if (!travelerSeen) {
          travelerSeen = true;
          return true;
        }
        return false;
      }
      return true;
    });
  }

  const team = finalRawTeam.map((member) => {
    const meta = metaByName.get(normalizeName(member.name));

    return {
      name: meta?.name ?? member.name,
      role: typeof member.role === "string" ? member.role : null,
      reason: typeof member.reason === "string" ? member.reason : null,
      characterId: meta?.id ?? null,
      image: meta?.image ?? null,
      element: meta?.element ?? null,
      rarity: meta?.rarity ?? null,
    };
  });

  return NextResponse.json({
    roster,
    team,
    plan,
    aiConfigured: true,
    usage: result.usage,
  });
}
