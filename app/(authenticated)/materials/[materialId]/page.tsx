import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { rarityColorMap } from "@/lib/constants";
import {
  getMaterialById,
  getMaterialChildren,
  getMaterialTemplateUsage,
} from "@/lib/static-data";
import { cn } from "@/lib/utils";

type MaterialDetails = {
  source?: string | null;
  usedByCharacters?: string[];
};

export default async function MaterialDetailPage({
  params,
}: {
  params: Promise<{ materialId: string }>;
}) {
  const { materialId } = await params;

  const material = getMaterialById(materialId);

  if (!material) {
    notFound();
  }

  const parentMaterial = material.parentMaterialId
    ? getMaterialById(material.parentMaterialId)
    : null;
  const childMaterials = getMaterialChildren(material.id);
  const { characterTemplateMaterials, weaponTemplateMaterials } =
    getMaterialTemplateUsage(material.id);
  const details = ((material as any).details ?? {}) as MaterialDetails;
  const usedByCharacters = details.usedByCharacters ?? [];

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
          <Image
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
