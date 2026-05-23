"use client";

import Image from "next/image";
import Link from "next/link";
import { Gem, Sparkles } from "lucide-react";
import { useState } from "react";

import { Card } from "@/components/ui/card";
import { rarityColorMap } from "@/lib/constants";
import type { EnemyCatalogItem } from "@/lib/enemy-data";
import { cn } from "@/lib/utils";

type EnemyDetailTabsProps = {
  enemy: EnemyCatalogItem;
};

type DetailTab = "materials" | "elements";

export function EnemyDetailTabs({ enemy }: EnemyDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>("materials");

  return (
    <Card variant="outlined" className="overflow-hidden">
      <div className="flex border-b border-outline-variant">
        <button
          type="button"
          className={cn(
            "inline-flex min-h-12 flex-1 items-center justify-center gap-2 px-4 text-sm font-bold transition-colors sm:flex-none",
            activeTab === "materials"
              ? "bg-primary-container text-on-primary-container"
              : "text-on-surface-variant hover:bg-surface-variant/50",
          )}
          onClick={() => setActiveTab("materials")}
        >
          <Gem className="h-4 w-4" />
          Materials
        </button>
        <button
          type="button"
          className={cn(
            "inline-flex min-h-12 flex-1 items-center justify-center gap-2 px-4 text-sm font-bold transition-colors sm:flex-none",
            activeTab === "elements"
              ? "bg-primary-container text-on-primary-container"
              : "text-on-surface-variant hover:bg-surface-variant/50",
          )}
          onClick={() => setActiveTab("elements")}
        >
          <Sparkles className="h-4 w-4" />
          Best Elements
        </button>
      </div>

      <div className="p-5 sm:p-6">
        {activeTab === "materials" ? (
          enemy.materials.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {enemy.materials.map((drop) => {
                const content = (
                  <div className="flex min-h-24 items-center gap-3 rounded-lg border border-outline-variant p-3 transition-colors hover:bg-surface-variant/40">
                    <div
                      className={cn(
                        "relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br",
                        rarityColorMap[drop.rarity ?? 1] ?? rarityColorMap[1],
                      )}
                    >
                      {drop.id ? (
                        <Image
                          src={`/api/material-image/${drop.id}`}
                          alt={drop.name}
                          fill
                          className="object-contain p-1.5"
                          sizes="48px"
                        />
                      ) : (
                        <Gem className="m-3 h-6 w-6 text-white" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-bold text-on-surface">
                        {drop.name}
                      </h3>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        {drop.minimumLevel
                          ? `Lv. ${drop.minimumLevel}+`
                          : "Any listed level"}
                        {drop.rarity ? ` · Rarity ${drop.rarity}` : ""}
                      </p>
                      {drop.source ? (
                        <p className="mt-1 line-clamp-1 text-xs text-on-surface-variant">
                          {drop.source}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );

                return drop.id ? (
                  <Link key={`${drop.id}-${drop.name}`} href={`/materials/${drop.id}`}>
                    {content}
                  </Link>
                ) : (
                  <div key={drop.name}>{content}</div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant">
              No material drops are listed for this enemy yet.
            </p>
          )
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {enemy.advice.map((item) => (
              <div
                key={`${item.element}-${item.note}`}
                className="rounded-lg border border-outline-variant p-4"
              >
                <p className="text-xs font-semibold uppercase text-on-surface-variant">
                  {item.element === "General"
                    ? "General Advice"
                    : `${item.element} Variant`}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(item.bestElements.length > 0
                    ? item.bestElements
                    : ["Any"]
                  ).map((element) => (
                    <span
                      key={element}
                      className="rounded-full bg-secondary-container px-3 py-1 text-xs font-bold text-on-secondary-container"
                    >
                      {element}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                  {item.note}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
