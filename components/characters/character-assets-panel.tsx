"use client";

import Image from "next/image";

import { Card } from "@/components/ui/card";
import type { CharacterAsset } from "@/components/characters/character-goal-builder";

export function CharacterAssetsPanel({
  assets,
  characterId,
}: {
  assets: CharacterAsset[];
  characterId: string;
}) {
  if (assets.length === 0) {
    return (
      <Card variant="outlined" className="p-6">
        <p className="text-on-surface-variant text-sm">
          No local character images are available for this character.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {assets.map((asset) => (
        <Card key={asset.key} variant="outlined" className="overflow-hidden">
          <div className="relative aspect-[4/3] bg-surface-variant/30">
            <Image
              src={`/api/character-asset/${characterId}/${asset.key}`}
              alt={asset.label}
              fill
              className="object-contain p-4"
              sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
            />
          </div>
          <div className="border-t border-outline-variant p-3">
            <p className="text-on-surface text-sm font-semibold">
              {asset.label}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
