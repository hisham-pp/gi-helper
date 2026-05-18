"use client";

import Image from "next/image";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextField } from "@/components/ui/text-field";
import { rarityBorderMap, rarityColorMap } from "@/lib/constants";
import type { MaterialView } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";

export function MaterialCard({
  material,
  quantity,
  onChange,
  onSave,
}: {
  material: MaterialView;
  quantity: number;
  onChange: (value: number) => void;
  onSave: () => void;
}) {
  return (
    <Card
      variant="outlined"
      className={cn(
        "p-4 transition-all hover:shadow-md",
        rarityBorderMap[material.rarity] ?? rarityBorderMap[1],
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br",
            rarityColorMap[material.rarity] ?? rarityColorMap[1],
          )}
        >
          <Image
            src={`/api/material-image/${material.id}`}
            alt=""
            fill
            className="object-contain p-2"
            sizes="56px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-on-surface truncate font-bold">
            {material.name}
          </h3>
          <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
            <span className="text-on-surface-variant rounded-full bg-surface-variant px-2 py-0.5 font-medium">
              {material.category}
            </span>
            <span className="text-on-primary-container rounded-full bg-primary-container px-2 py-0.5 font-medium">
              Craftable {formatNumber(material.totalCraftable)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1">
          <TextField
            label={`${material.name} quantity`}
            variant="outlined"
            type="number"
            min={0}
            className="h-11"
            value={quantity}
            onChange={(event) => onChange(Number(event.target.value))}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onSave();
              }
            }}
          />
        </div>
        <Button
          variant="filled"
          className="h-11 px-4"
          onClick={onSave}
          aria-label={`Save ${material.name} quantity`}
        >
          <Save className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </Card>
  );
}
