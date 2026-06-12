"use client";

import type { Route } from "next";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CachedImage } from "@/components/ui/cached-image";
import { MaterialDetailPageLoading } from "@/components/ui/page-loading";
import { rarityColorMap } from "@/lib/constants";
import { cn } from "@/lib/utils";

type MaterialDetails = {
  source?: string | null;
  usedByCharacters?: string[];
};

type MaterialDetailItem = {
  id: string;
  name: string;
  image: string;
  rarity: number;
  category: string;
  description: string;
  combinable: boolean;
  combineRatio: number | null;
  parentMaterialId: string | null;
};

type TemplateUsage = {
  id: string;
  required: number;
  template: {
    name: string;
    character?: {
      name: string;
    } | null;
    weapon?: {
      name: string;
    } | null;
  };
};

type EnemyUsage = {
  id: string;
  name: string;
  type: string;
  image?: string | null;
};

type MaterialDetailPayload = {
  material: MaterialDetailItem;
  parentMaterial: MaterialDetailItem | null;
  childMaterials: MaterialDetailItem[];
  characterTemplateMaterials: TemplateUsage[];
  weaponTemplateMaterials: TemplateUsage[];
  droppedByEnemies: EnemyUsage[];
  details: MaterialDetails;
  usedByCharacters: string[];
};

export function MaterialDetailClientPage({
  materialId,
}: {
  materialId: string;
}) {
  const [payload, setPayload] = useState<MaterialDetailPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadMaterial = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/materials/${materialId}`, {
        cache: "no-store",
      });

      if (response.status === 404) {
        setNotFound(true);
        setPayload(null);
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load material.");
      }

      const nextPayload = (await response.json()) as MaterialDetailPayload;

      setPayload(nextPayload);
      setNotFound(false);
      setLoadError(null);
    } catch (error) {
      console.error("Material detail load failed", error);
      setLoadError("Unable to load this material right now.");
      toast.error("Unable to load material.");
    } finally {
      setIsLoading(false);
    }
  }, [materialId]);

  useEffect(() => {
    void loadMaterial();
  }, [loadMaterial]);

  if (isLoading) {
    return <MaterialDetailPageLoading />;
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-outline-variant bg-surface p-8">
        <h1 className="text-on-surface text-2xl font-bold">
          Material not found
        </h1>
        <p className="text-on-surface-variant mt-3 text-sm">
          That material is not available in the local data set.
        </p>
        <Link className="mt-6 block w-fit" href="/materials">
          <Button variant="outlined">Back to materials</Button>
        </Link>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="rounded-lg border border-outline-variant bg-surface p-8">
        <h1 className="text-on-surface text-2xl font-bold">
          {loadError ?? "Unable to load this material."}
        </h1>
        <p className="text-on-surface-variant mt-3 text-sm">
          Refresh the page or try again in a moment.
        </p>
      </div>
    );
  }

  const {
    material,
    parentMaterial,
    childMaterials,
    characterTemplateMaterials,
    weaponTemplateMaterials,
    droppedByEnemies,
    details,
    usedByCharacters,
  } = payload;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start gap-4">
        <Link href="/materials">
          <Button variant="text" className="h-10 w-10 p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div
          className={cn(
            "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br",
            rarityColorMap[material.rarity] ?? rarityColorMap[1],
          )}
        >
          <CachedImage
            src={`/api/material-image/${material.id}`}
            alt={material.name}
            fill
            className="object-contain p-2"
            sizes="64px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-on-surface text-3xl font-bold tracking-tight">
            {material.name}
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            {material.category} · Rarity {material.rarity}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card variant="outlined" className="p-5 sm:p-6">
          <h2 className="text-on-surface text-xl font-bold">Details</h2>
          <p className="text-on-surface-variant mt-3 text-sm leading-6">
            {material.description}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ["Category", material.category],
              ["Rarity", `${material.rarity}`],
              ["Source", details.source ?? "No source data yet"],
              [
                "Crafting",
                material.combinable && parentMaterial
                  ? `${material.combineRatio ?? 3}:1 into ${parentMaterial.name}`
                  : "Highest tier or not craftable",
              ],
            ].map(([label, value]) => (
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
          <h2 className="text-on-surface text-lg font-bold">Material Chain</h2>
          <div className="mt-4 space-y-3">
            {parentMaterial ? (
              <Link
                href={`/materials/${parentMaterial.id}`}
                className="block rounded-lg border border-outline-variant p-3 transition-colors hover:bg-surface-variant/40"
              >
                <p className="text-on-surface-variant text-xs font-semibold uppercase">
                  Crafts Into
                </p>
                <p className="text-on-surface mt-1 text-sm font-semibold">
                  {parentMaterial.name}
                </p>
              </Link>
            ) : null}
            {childMaterials.map((child) => (
              <Link
                key={child.id}
                href={`/materials/${child.id}`}
                className="block rounded-lg border border-outline-variant p-3 transition-colors hover:bg-surface-variant/40"
              >
                <p className="text-on-surface-variant text-xs font-semibold uppercase">
                  Crafted From
                </p>
                <p className="text-on-surface mt-1 text-sm font-semibold">
                  {child.name}
                </p>
              </Link>
            ))}
            {!parentMaterial && childMaterials.length === 0 ? (
              <p className="text-on-surface-variant text-sm">
                No crafting chain is linked for this material.
              </p>
            ) : null}
          </div>
        </Card>

        <Card variant="outlined" className="p-5 sm:p-6">
          <h2 className="text-on-surface text-lg font-bold">
            Dropped By Enemies
          </h2>
          {droppedByEnemies.length > 0 ? (
            <div className="mt-4 space-y-3">
              {droppedByEnemies.map((enemy) => (
                <Link
                  key={enemy.id}
                  href={`/enemies/${enemy.id}` as Route}
                  className="flex items-center gap-3 rounded-lg border border-outline-variant p-3 transition-colors hover:bg-surface-variant/40"
                >
                  <div className="relative grid h-10 w-10 flex-shrink-0 place-items-center overflow-hidden rounded-lg bg-surface-variant">
                    {enemy.image ? (
                      <CachedImage
                        src={enemy.image}
                        alt={enemy.name}
                        fill
                        className="object-contain p-1"
                        sizes="40px"
                      />
                    ) : (
                      <ShieldAlert className="text-on-surface-variant h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-on-surface truncate text-sm font-semibold">
                      {enemy.name}
                    </p>
                    <p className="text-on-surface-variant truncate text-xs">
                      {enemy.type}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-on-surface-variant mt-3 text-sm">
              No enemy source is linked for this material yet.
            </p>
          )}
        </Card>

        <Card variant="outlined" className="p-5 sm:p-6 lg:col-span-2">
          <h2 className="text-on-surface text-lg font-bold">Used By</h2>
          {usedByCharacters.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {usedByCharacters.map((characterId) => (
                <Link
                  key={characterId}
                  href={`/characters/${characterId}`}
                  className="rounded-full border border-outline-variant px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
                >
                  {characterId}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-on-surface-variant mt-3 text-sm">
              No character usage details are available in the seed data yet.
            </p>
          )}

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {characterTemplateMaterials.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-outline-variant p-3"
              >
                <p className="text-on-surface text-sm font-semibold">
                  {item.template.character?.name}
                </p>
                <p className="text-on-surface-variant mt-1 text-xs">
                  {item.template.name}
                </p>
                <p className="text-on-surface-variant mt-2 text-xs">
                  Requires {item.required}
                </p>
              </div>
            ))}
            {weaponTemplateMaterials.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-outline-variant p-3"
              >
                <p className="text-on-surface text-sm font-semibold">
                  {item.template.weapon?.name}
                </p>
                <p className="text-on-surface-variant mt-1 text-xs">
                  {item.template.name}
                </p>
                <p className="text-on-surface-variant mt-2 text-xs">
                  Requires {item.required}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
