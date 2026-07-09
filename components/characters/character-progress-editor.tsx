"use client";

import { useState, useTransition } from "react";
import { Gauge, Save } from "lucide-react";
import { toast } from "sonner";

import { updateOwnedCharacterProgressAction } from "@/app/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type CharacterProgress = {
  level: number | null;
  normalAttackLevel: number | null;
  elementalSkillLevel: number | null;
  elementalBurstLevel: number | null;
};

type FieldKey = keyof CharacterProgress;

const TALENT_FIELDS: Array<{ key: FieldKey; label: string }> = [
  { key: "normalAttackLevel", label: "Normal Attack" },
  { key: "elementalSkillLevel", label: "Elemental Skill" },
  { key: "elementalBurstLevel", label: "Elemental Burst" },
];

function toInput(value: number | null | undefined): string {
  return value == null ? "" : String(value);
}

function parseField(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
}

export function CharacterProgressEditor({
  characterId,
  characterName,
  initialProgress,
}: Readonly<{
  characterId: string;
  characterName: string;
  initialProgress: CharacterProgress | null;
}>) {
  const [level, setLevel] = useState(toInput(initialProgress?.level));
  const [normalAttack, setNormalAttack] = useState(
    toInput(initialProgress?.normalAttackLevel),
  );
  const [skill, setSkill] = useState(
    toInput(initialProgress?.elementalSkillLevel),
  );
  const [burst, setBurst] = useState(
    toInput(initialProgress?.elementalBurstLevel),
  );
  const [isPending, startTransition] = useTransition();

  const talentValues: Record<FieldKey, string> = {
    level,
    normalAttackLevel: normalAttack,
    elementalSkillLevel: skill,
    elementalBurstLevel: burst,
  };
  const talentSetters: Record<FieldKey, (value: string) => void> = {
    level: setLevel,
    normalAttackLevel: setNormalAttack,
    elementalSkillLevel: setSkill,
    elementalBurstLevel: setBurst,
  };

  function handleSave() {
    const levelValue = parseField(level);
    if (levelValue != null && (levelValue < 1 || levelValue > 90)) {
      toast.error("Character level must be between 1 and 90.");
      return;
    }
    for (const { key, label } of TALENT_FIELDS) {
      const value = parseField(talentValues[key]);
      if (value != null && (value < 1 || value > 10)) {
        toast.error(`${label} level must be between 1 and 10.`);
        return;
      }
    }

    startTransition(async () => {
      const result = await updateOwnedCharacterProgressAction({
        characterId,
        level: levelValue,
        normalAttackLevel: parseField(normalAttack),
        elementalSkillLevel: parseField(skill),
        elementalBurstLevel: parseField(burst),
      });

      if (!result.success) {
        toast.error(result.error ?? "Unable to save progress.");
        return;
      }

      toast.success(`Saved ${characterName}'s levels.`);
    });
  }

  return (
    <Card variant="outlined" className="p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Gauge className="h-5 w-5 text-primary" />
        <div>
          <h2 className="text-on-surface text-lg font-bold">Your progress</h2>
          <p className="text-on-surface-variant text-xs">
            Track this character&apos;s level and talent levels — the AI
            assistant uses them for tailored advice.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1">
          <span className="text-on-surface-variant text-xs font-semibold">
            Character level (1–90)
          </span>
          <input
            type="number"
            min={1}
            max={90}
            inputMode="numeric"
            value={level}
            placeholder="—"
            onChange={(event) => setLevel(event.target.value)}
            className="text-on-surface min-h-11 rounded-lg border border-outline-variant bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        {TALENT_FIELDS.map(({ key, label }) => (
          <label key={key} className="flex flex-col gap-1">
            <span className="text-on-surface-variant text-xs font-semibold">
              {label} (1–10)
            </span>
            <input
              type="number"
              min={1}
              max={10}
              inputMode="numeric"
              value={talentValues[key]}
              placeholder="—"
              onChange={(event) => talentSetters[key](event.target.value)}
              className="text-on-surface min-h-11 rounded-lg border border-outline-variant bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button className="gap-2" onClick={handleSave} disabled={isPending}>
          <Save className="h-4 w-4" />
          {isPending ? "Saving…" : "Save progress"}
        </Button>
        <p className="text-on-surface-variant text-xs">
          Leave a field blank to clear it.
        </p>
      </div>
    </Card>
  );
}
