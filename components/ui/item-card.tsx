"use client";

import Link from "next/link";
import type { Route } from "next";

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

const detailPathByType: Record<ItemType, string> = {
  character: "/characters",
  weapon: "/weapons",
  material: "/materials",
};

/**
 * Compact inline reference to a character, weapon, or material, used inside
 * Markdown-rendered AI chat text (see components/ui/markdown.tsx). Must stay
 * a single, inline-level element (no `<div>`) — this is inserted mid-sentence
 * inside `<p>`, `<li>`, and `<td>` elements, and a block-level element there
 * makes the browser auto-close the surrounding paragraph, fragmenting it.
 */
export function ItemCard({
  type,
  id,
  name,
  image,
  rarity,
  element,
}: ItemCardProps) {
  return (
    <Link
      href={`${detailPathByType[type]}/${id}` as Route}
      title={name}
      className="text-on-surface mx-0.5 inline-flex max-w-[14rem] shrink-0 items-center gap-1 rounded-md border border-outline-variant bg-surface-variant/60 py-0.5 pl-0.5 pr-1.5 align-middle text-[0.85em] font-semibold leading-none no-underline transition-colors hover:border-primary hover:bg-primary/10"
    >
      <span
        className={cn(
          "relative h-4 w-4 flex-shrink-0 overflow-hidden rounded-sm bg-gradient-to-br",
          rarityColorMap[rarity] ?? rarityColorMap[1],
        )}
      >
        {image ? (
          <CachedImage
            src={image}
            alt=""
            fill
            unoptimized
            className="object-contain"
            sizes="16px"
          />
        ) : null}
      </span>
      {element ? (
        <span
          className={cn(
            "h-1.5 w-1.5 flex-shrink-0 rounded-full",
            elementDotClass[element] ?? "bg-outline",
          )}
        />
      ) : null}
      <span className="truncate">{name}</span>
    </Link>
  );
}
