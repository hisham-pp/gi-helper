"use client";

import { CachedImage } from "@/components/ui/cached-image";
import { Card } from "@/components/ui/card";
import { rarityBorderMap, rarityColorMap } from "@/lib/constants";
import type { GoalMaterialView } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";

export function NeedCard({ item }: { item: GoalMaterialView }) {
  return (
    <Card
      variant="outlined"
      className={cn(
        "flex items-center gap-4 p-4",
        rarityBorderMap[item.rarity] ?? rarityBorderMap[1],
      )}
    >
      <div
        className={cn(
          "relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br",
          rarityColorMap[item.rarity] ?? rarityColorMap[1],
        )}
      >
        <CachedImage
          src={`/api/material-image/${item.materialId}`}
          alt=""
          fill
          className="object-contain p-1.5"
          sizes="48px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-on-surface truncate text-sm font-bold">
          {item.materialName}
        </h3>
        <p className="mt-0.5 text-lg font-black text-primary">
          <span className="sr-only">Remaining: </span>
          {formatNumber(item.remaining)}
        </p>
        <p className="text-on-surface-variant text-xs font-medium">
          {formatNumber(item.ownedNeeded ?? item.allocated)} /{" "}
          {formatNumber(item.required)} owned
        </p>
      </div>
    </Card>
  );
}
