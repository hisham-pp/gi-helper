"use client";

import { CachedImage } from "@/components/ui/cached-image";
import { rarityColorMap } from "@/lib/constants";
import { cn } from "@/lib/utils";

type ItemType = "character" | "weapon" | "material";

interface ItemCardProps {
  type: ItemType;
  id: string;
  name: string;
  image: string;
  rarity: number;
  element?: string;
  weaponType?: string;
  category?: string;
}

const elementDotClass: Record<string, string> = {
  Pyro: "bg-red-500",
  Hydro: "bg-blue-500",
  Anemo: "bg-teal-400",
  Electro: "bg-purple-500",
  Dendro: "bg-green-500",
  Cryo: "bg-cyan-400",
  Geo: "bg-amber-500",
};

export function ItemCard({
  type,
  id,
  name,
  image,
  rarity,
  element,
  weaponType,
  category,
}: ItemCardProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-variant/50 px-2 py-1.5 text-sm">
      <div
        className={cn(
          "relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-md bg-gradient-to-br",
          rarityColorMap[rarity] ?? rarityColorMap[1],
        )}
      >
        {image ? (
          <CachedImage
            src={image}
            alt={name}
            fill
            unoptimized
            className="object-contain p-1"
            sizes="32px"
          />
        ) : (
          <div className="grid h-full place-items-center text-[10px] font-black text-white">
            {name.slice(0, 2)}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {element ? (
            <span
              className={cn(
                "h-2 w-2 flex-shrink-0 rounded-full",
                elementDotClass[element] ?? "bg-outline",
              )}
            />
          ) : null}
          <span className="text-on-surface truncate font-semibold">{name}</span>
        </div>
        <div className="text-on-surface-variant mt-0.5 flex items-center gap-2 text-[10px]">
          {type === "character" && weaponType && (
            <span>{weaponType}</span>
          )}
          {type === "weapon" && weaponType && (
            <span>{weaponType}</span>
          )}
          {type === "material" && category && (
            <span>{category}</span>
          )}
        </div>
      </div>
    </div>
  );
}
