"use client";

import { Sparkles } from "lucide-react";

import { EmptyState } from "@/components/dashboard/common/empty-state";
import { StatPill } from "@/components/dashboard/common/stat-pill";
import { RecursiveSourceList } from "@/components/dashboard/crafting/recursive-source-list";
import { Card } from "@/components/ui/card";
import type { CraftingSimulation, MaterialView } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export function CraftingResult({
  materials,
  simulation,
}: {
  materials: MaterialView[];
  simulation: CraftingSimulation | null;
}) {
  if (!simulation) {
    return (
      <div className="py-12">
        <EmptyState
          icon={<Sparkles className="h-10 w-10" />}
          title="Choose a material"
          description="Select a material to preview recursive crafting."
        />
      </div>
    );
  }

  const materialName = materials.find(
    (item) => item.id === simulation.materialId,
  )?.name;

  return (
    <div className="mt-4 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatPill
          label="Requested"
          value={formatNumber(simulation.requested)}
        />
        <StatPill
          label="Total Available"
          value={formatNumber(simulation.totalAvailable)}
        />
        <StatPill
          label="Deficit"
          value={formatNumber(simulation.remaining)}
          tone={simulation.remaining > 0 ? "danger" : "success"}
        />
        <StatPill
          label="Surplus"
          value={formatNumber(simulation.surplus)}
          tone={simulation.surplus > 0 ? "success" : "default"}
        />
      </div>
      <Card variant="filled" className="p-5">
        <p className="text-on-surface text-sm font-medium">
          {simulation.craftable
            ? `You can fully craft ${simulation.requested} ${materialName}.`
            : `You are short by ${simulation.remaining} after recursive crafting.`}
        </p>
        <p className="text-on-surface-variant mt-2 text-xs">
          Directly owned: {formatNumber(simulation.directOwned)}
        </p>
      </Card>
      <RecursiveSourceList sources={simulation.recursiveSources} />
    </div>
  );
}
