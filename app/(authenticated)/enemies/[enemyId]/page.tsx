import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldAlert } from "lucide-react";

import { EnemyDetailTabs } from "@/components/dashboard/enemy-detail-tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAllEnemies, getEnemyById } from "@/lib/enemy-data";

export function generateStaticParams() {
  return getAllEnemies().map((enemy) => ({
    enemyId: enemy.id,
  }));
}

export default async function EnemyDetailPage({
  params,
}: {
  params: Promise<{ enemyId: string }>;
}) {
  const { enemyId } = await params;
  const enemy = getEnemyById(enemyId);

  if (!enemy) {
    notFound();
  }

  const heroImage = enemy.portrait ?? enemy.image;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start gap-4">
        <Link href={"/enemies" as Route}>
          <Button variant="text" className="h-10 w-10 p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="relative grid h-20 w-20 flex-shrink-0 place-items-center overflow-hidden rounded-xl bg-surface-variant">
          {heroImage ? (
            <img
              src={heroImage}
              alt={enemy.name}
              className="h-full w-full object-contain p-1.5"
            />
          ) : (
            <ShieldAlert className="h-10 w-10 text-on-surface-variant" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">
            {enemy.name}
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {enemy.type} · {enemy.family} · {enemy.region}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(enemy.elements.length > 0 ? enemy.elements : ["No fixed element"]).map(
              (element) => (
                <span
                  key={element}
                  className="rounded-full border border-outline-variant px-3 py-1 text-xs font-semibold text-on-surface-variant"
                >
                  {element}
                </span>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Card variant="outlined" className="p-5 sm:p-6">
            <h2 className="text-xl font-bold text-on-surface">Details</h2>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
              {enemy.description}
            </p>
          </Card>

          <EnemyDetailTabs enemy={enemy} />
        </div>

        <Card variant="outlined" className="h-fit p-5 sm:p-6">
          <h2 className="text-lg font-bold text-on-surface">Quick Counters</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-lg border border-outline-variant p-3">
              <p className="text-xs font-semibold uppercase text-on-surface-variant">
                Best Elements
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(enemy.bestElements.length > 0
                  ? enemy.bestElements
                  : ["Any"]
                ).map((element) => (
                  <span
                    key={element}
                    className="rounded-full bg-primary-container px-3 py-1 text-xs font-bold text-on-primary-container"
                  >
                    {element}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-outline-variant p-3">
              <p className="text-xs font-semibold uppercase text-on-surface-variant">
                Material Drops
              </p>
              <p className="mt-1 text-sm font-semibold text-on-surface">
                {enemy.materials.length}
              </p>
            </div>
            {enemy.faction ? (
              <div className="rounded-lg border border-outline-variant p-3">
                <p className="text-xs font-semibold uppercase text-on-surface-variant">
                  Faction
                </p>
                <p className="mt-1 text-sm font-semibold text-on-surface">
                  {enemy.faction}
                </p>
              </div>
            ) : null}
          </div>
        </Card>

        {enemy.sourceUrl ? (
          <a
            href={enemy.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="block rounded-lg border border-outline-variant p-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
          >
            View Wiki Source
          </a>
        ) : null}
      </div>
    </div>
  );
}
