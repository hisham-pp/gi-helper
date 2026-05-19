"use client";

import { Card } from "@/components/ui/card";
import type {
  CharacterDetail,
  CharacterDetails,
} from "@/components/characters/character-goal-builder";

export function CharacterDetailsPanel({
  character,
  details,
}: {
  character: CharacterDetail;
  details?: CharacterDetails | null;
}) {
  const facts = [
    ["Element", character.element],
    ["Weapon", character.weaponType],
    ["Region", character.region],
    ["Affiliation", details?.affiliation],
    ["Constellation", details?.constellation],
    ["Birthday", formatBirthday(details?.birthday)],
    ["Release", details?.release],
    ["Special Dish", details?.specialDish],
  ].filter(([, value]) => Boolean(value));

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <Card variant="outlined" className="p-5 sm:p-6">
        <h2 className="text-on-surface text-xl font-bold">Profile</h2>
        <p className="text-on-surface-variant mt-3 text-sm leading-6">
          {details?.description ?? "No profile details are available yet."}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {facts.map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg border border-outline-variant p-3"
            >
              <p className="text-on-surface-variant text-xs font-semibold uppercase">
                {label}
              </p>
              <p className="text-on-surface mt-1 text-sm font-semibold">
                {value}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card variant="outlined" className="p-5 sm:p-6">
        <h2 className="text-on-surface text-lg font-bold">Talents</h2>
        <div className="mt-4 space-y-4">
          {(details?.skillTalents ?? []).slice(0, 3).map((talent) => (
            <div key={`${talent.unlock}-${talent.name}`}>
              <p className="text-on-surface text-sm font-semibold">
                {talent.name}
              </p>
              <p className="text-on-surface-variant mt-1 text-xs">
                {talent.unlock}
              </p>
              <p className="text-on-surface-variant mt-2 line-clamp-3 text-xs leading-5">
                {talent.description}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card variant="outlined" className="p-5 sm:p-6 lg:col-span-2">
        <h2 className="text-on-surface text-lg font-bold">Passives</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {(details?.passiveTalents ?? []).map((talent) => (
            <div
              key={`${talent.unlock}-${talent.name}`}
              className="rounded-lg border border-outline-variant p-3"
            >
              <p className="text-on-surface text-sm font-semibold">
                {talent.name}
              </p>
              <p className="text-on-surface-variant mt-1 text-xs">
                {talent.unlock}
              </p>
              <p className="text-on-surface-variant mt-2 line-clamp-4 text-xs leading-5">
                {talent.description}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function formatBirthday(value?: string | null) {
  if (!value) {
    return null;
  }

  return value.replace(/^0000-/, "");
}
