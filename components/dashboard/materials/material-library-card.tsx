"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { rarityBorderMap, rarityColorMap } from "@/lib/constants";
import type { MaterialView } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";

export function MaterialLibraryCard({
  material,
  canEdit,
  onEdit,
}: {
  material: MaterialView;
  canEdit: boolean;
  onEdit: (material: MaterialView) => void;
}) {
  return (
    <Card
      variant="outlined"
      className={cn(
        "p-5 transition-transform hover:scale-[1.02]",
        rarityBorderMap[material.rarity] ?? rarityBorderMap[1],
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br",
            rarityColorMap[material.rarity] ?? rarityColorMap[1],
          )}
        >
          <Image
            src={`/api/material-image/${material.id}`}
            alt=""
            fill
            className="object-contain p-2"
            sizes="64px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-on-surface font-bold">{material.name}</h3>
            <div className="flex items-center gap-2">
              {canEdit ? (
                <Button variant="text" onClick={() => onEdit(material)}>
                  Edit
                </Button>
              ) : null}
              <Link
                href={`/materials/${material.id}`}
                className="inline-flex h-10 items-center justify-center rounded-full px-6 text-sm font-medium text-primary transition-all hover:bg-primary/5"
              >
                Details
              </Link>
              <span className="rounded-full bg-secondary-container px-2.5 py-1 text-xs font-medium text-secondary-on-container">
                {material.category}
              </span>
            </div>
          </div>
          <p className="text-on-surface-variant mt-2 line-clamp-2 text-sm">
            {material.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="text-on-surface-variant rounded-full border border-outline-variant px-2.5 py-1 font-medium">
              Rarity {material.rarity}
            </span>
            <span className="text-on-surface-variant rounded-full border border-outline-variant px-2.5 py-1 font-medium">
              Owned {formatNumber(material.quantity)}
            </span>
            {material.combinable && material.parentMaterialId ? (
              <span className="text-on-surface-variant rounded-full border border-outline-variant px-2.5 py-1 font-medium">
                3:1 Crafting
              </span>
            ) : (
              <span className="text-on-surface-variant rounded-full border border-outline-variant px-2.5 py-1 font-medium">
                Highest tier
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
