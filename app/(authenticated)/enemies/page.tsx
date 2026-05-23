import { ShieldAlert } from "lucide-react";
import { Suspense } from "react";

import { EnemyList } from "@/components/dashboard/enemy-list";
import { getAllEnemies } from "@/lib/enemy-data";

export default function EnemiesPage() {
  const enemies = getAllEnemies();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-container text-on-primary-container">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-on-surface">
                Enemies
              </h1>
              <p className="mt-1 text-on-surface-variant">
                Browse enemy drops, linked materials, and recommended counter
                elements.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="h-96 animate-pulse rounded-2xl bg-surface-variant/20" />
        }
      >
        <EnemyList enemies={enemies} />
      </Suspense>
    </div>
  );
}
