"use client";

import { Sparkles } from "lucide-react";

import { EmptyState } from "@/components/dashboard/common/empty-state";
import { SummaryList } from "@/components/dashboard/common/summary-list";
import { NeedCard } from "@/components/dashboard/inventory/need-card";
import { Card } from "@/components/ui/card";
import type { GoalMaterialView } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export function ShoppingListPanel({
  completedMaterials,
  materialsStillNeeded,
}: {
  completedMaterials: GoalMaterialView[];
  materialsStillNeeded: GoalMaterialView[];
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
      <Card className="flex flex-col overflow-hidden" variant="outlined">
        <div className="border-b border-outline-variant bg-surface p-6">
          <h3 className="text-on-surface text-xl font-bold">Shopping List</h3>
          <p className="text-on-surface-variant text-sm">
            Aggregated material requirements for all active goals.
          </p>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {materialsStillNeeded.length === 0 ? (
              <EmptyState
                icon={<Sparkles className="h-8 w-8" />}
                title="Everything covered"
                description="You have enough materials for all your goals!"
              />
            ) : (
              materialsStillNeeded.map((item) => (
                <NeedCard key={item.materialId} item={item} />
              ))
            )}
          </div>
        </div>
      </Card>

      <div className="space-y-8">
        <SummaryList
          items={completedMaterials.slice(0, 8).map((item) => ({
            id: item.id,
            title: item.materialName,
            subtitle: `${formatNumber(item.required)} ready`,
            image: item.materialId,
          }))}
          title="Completed Materials"
          description="Goal requirements satisfied by current inventory."
          emptyText="Completed requirements will appear here."
        />
      </div>
    </div>
  );
}
