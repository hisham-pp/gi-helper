"use client";

export type CharacterSummary = {
  name: string;
  element: string;
  weaponType: string;
  rarity: number;
  matchReason?: "element" | "absorption" | null;
};

export type TeamMember = {
  name: string;
  role: string | null;
  reason: string | null;
  characterId: string | null;
  image: string | null;
  element: string | null;
  rarity: number | null;
};

export type BattlePlanResponse = {
  roster: {
    recommended: CharacterSummary[];
    bench: CharacterSummary[];
    ownedCount: number;
  };
  team: TeamMember[];
  plan: string | null;
  aiConfigured: boolean;
  aiError?: string;
  usage: { totalTokens: number | null } | null;
};

export type StoredBattlePlan = {
  level: string;
  notes: string;
  result: BattlePlanResponse;
  savedAt: number;
};

const STORAGE_KEY = "gmt:battle-plans:v1";
const MAX_STORED_PLANS = 20;

type StoredBattlePlanMap = Record<string, StoredBattlePlan>;

function isStoredBattlePlan(value: unknown): value is StoredBattlePlan {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<StoredBattlePlan>;

  return (
    typeof candidate.level === "string" &&
    typeof candidate.notes === "string" &&
    typeof candidate.savedAt === "number" &&
    Boolean(candidate.result) &&
    typeof candidate.result === "object" &&
    Array.isArray(candidate.result.team) &&
    Boolean(candidate.result.roster) &&
    Array.isArray(candidate.result.roster.recommended) &&
    Array.isArray(candidate.result.roster.bench)
  );
}

function loadStoredBattlePlanMap(): StoredBattlePlanMap {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    const entries = Object.entries(parsed as Record<string, unknown>).filter(
      (entry): entry is [string, StoredBattlePlan] =>
        isStoredBattlePlan(entry[1]),
    );

    return Object.fromEntries(entries);
  } catch {
    return {};
  }
}

/**
 * Loads the last saved battle plan for one enemy, or null when there is none
 * (or storage is unavailable / holds unparseable data).
 */
export function loadStoredBattlePlan(enemyId: string): StoredBattlePlan | null {
  return loadStoredBattlePlanMap()[enemyId] ?? null;
}

/**
 * Saves the battle plan for one enemy, keeping only the most recently saved
 * MAX_STORED_PLANS enemies so the key stays bounded.
 */
export function saveStoredBattlePlan(
  enemyId: string,
  plan: Omit<StoredBattlePlan, "savedAt">,
) {
  try {
    const map = loadStoredBattlePlanMap();
    map[enemyId] = { ...plan, savedAt: Date.now() };

    const trimmed = Object.fromEntries(
      Object.entries(map)
        .sort((left, right) => right[1].savedAt - left[1].savedAt)
        .slice(0, MAX_STORED_PLANS),
    );

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage may be unavailable (private browsing, quota, disabled cookies)
    // — the plan still works in-memory, it just won't persist.
  }
}
