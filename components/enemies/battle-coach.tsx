"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { Loader2, Settings, Swords, Users } from "lucide-react";
import { toast } from "sonner";

import AppTextField from "@/components/core/app-textfield";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CharacterSummary = {
  name: string;
  element: string;
  weaponType: string;
  rarity: number;
};

type BattlePlanResponse = {
  roster: {
    recommended: CharacterSummary[];
    bench: CharacterSummary[];
    ownedCount: number;
  };
  plan: string | null;
  aiConfigured: boolean;
  aiError?: string;
  usage: { totalTokens: number | null } | null;
};

const elementDotClass: Record<string, string> = {
  Pyro: "bg-red-500",
  Hydro: "bg-blue-500",
  Anemo: "bg-teal-400",
  Electro: "bg-purple-500",
  Dendro: "bg-green-500",
  Cryo: "bg-cyan-400",
  Geo: "bg-amber-500",
};

function CharacterChip({
  character,
  highlight,
}: {
  character: CharacterSummary;
  highlight?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        highlight
          ? "text-on-primary-container border-primary/40 bg-primary-container"
          : "text-on-surface-variant border-outline-variant",
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          elementDotClass[character.element] ?? "bg-outline",
        )}
      />
      {character.name}
    </span>
  );
}

export function BattleCoach({
  enemyId,
  enemyName,
}: Readonly<{ enemyId: string; enemyName: string }>) {
  const [level, setLevel] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BattlePlanResponse | null>(null);

  async function handleAnalyze() {
    try {
      setIsLoading(true);
      const parsedLevel = level.trim() ? Number(level.trim()) : null;

      const response = await fetch(`/api/enemies/${enemyId}/battle-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level:
            parsedLevel != null && Number.isFinite(parsedLevel)
              ? parsedLevel
              : null,
          notes: notes.trim() || undefined,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | (BattlePlanResponse & { error?: string })
        | null;

      if (!response.ok || !payload) {
        throw new Error(payload?.error ?? "Could not build a battle plan.");
      }

      setResult(payload);

      if (payload.aiError) {
        toast.error(`Roster ready, but the AI plan failed: ${payload.aiError}`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not build a battle plan.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card variant="outlined" className="p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Swords className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-on-surface text-lg font-bold">Battle Coach</h2>
          <p className="text-on-surface-variant text-xs">
            A practice plan for {enemyName} built from the characters you own.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[12rem_1fr]">
        <AppTextField
          label="Your team level"
          type="number"
          variant="outlined"
          min={1}
          max={100}
          value={level}
          helperText="Optional"
          onChange={(event) => setLevel(event.target.value)}
        />
        <AppTextField
          label="What are you struggling with?"
          variant="outlined"
          value={notes}
          helperText="Optional — e.g. I keep dying to its charge attack"
          slotProps={{ htmlInput: { maxLength: 500 } }}
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>

      <button
        type="button"
        disabled={isLoading}
        onClick={handleAnalyze}
        className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:shadow-md disabled:pointer-events-none disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Building plan…
          </>
        ) : (
          <>
            <Swords className="h-4 w-4" /> Analyze my roster
          </>
        )}
      </button>

      {result ? (
        <div className="mt-5 space-y-5">
          {/* Roster match */}
          <div>
            <div className="text-on-surface flex items-center gap-2 text-sm font-bold">
              <Users className="h-4 w-4" /> From your roster
              <span className="text-on-surface-variant font-medium">
                ({result.roster.ownedCount} owned)
              </span>
            </div>
            {result.roster.ownedCount === 0 ? (
              <p className="text-on-surface-variant mt-2 text-sm">
                You haven&apos;t marked any characters as owned yet. Add some on
                the Characters page for tailored advice.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-on-surface-variant text-xs font-semibold uppercase">
                    Strong counters you own
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.roster.recommended.length > 0 ? (
                      result.roster.recommended.map((character) => (
                        <CharacterChip
                          key={character.name}
                          character={character}
                          highlight
                        />
                      ))
                    ) : (
                      <p className="text-on-surface-variant text-sm">
                        None of your owned characters match this enemy&apos;s
                        best counter elements — see the plan for the closest
                        options.
                      </p>
                    )}
                  </div>
                </div>
                {result.roster.bench.length > 0 ? (
                  <div>
                    <p className="text-on-surface-variant text-xs font-semibold uppercase">
                      Rest of your roster
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {result.roster.bench.map((character) => (
                        <CharacterChip
                          key={character.name}
                          character={character}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* AI plan */}
          {result.plan ? (
            <div>
              <p className="text-on-surface text-sm font-bold">
                Coach&apos;s plan
              </p>
              <div className="text-on-surface mt-2 whitespace-pre-wrap rounded-lg border border-outline-variant bg-surface-variant/30 p-4 text-sm leading-relaxed">
                {result.plan}
              </div>
              {result.usage?.totalTokens ? (
                <p className="text-on-surface-variant mt-2 text-xs">
                  {result.usage.totalTokens} tokens used
                </p>
              ) : null}
            </div>
          ) : !result.aiConfigured ? (
            <div className="text-on-surface-variant rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
              <p className="text-on-surface font-semibold">
                Want a full coached plan?
              </p>
              <p className="mt-1">
                Connect an AI model in{" "}
                <Link
                  href={"/settings" as Route}
                  className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                >
                  <Settings className="h-3.5 w-3.5" /> Settings
                </Link>{" "}
                to get a tailored team, rotation, and dodge tips.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
