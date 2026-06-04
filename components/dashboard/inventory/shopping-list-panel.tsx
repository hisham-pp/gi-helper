"use client";

import { Sparkles } from "lucide-react";

import { EmptyState } from "@/components/dashboard/common/empty-state";
import { NeedCard } from "@/components/dashboard/inventory/need-card";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/core/app-select";
import AppTextField from "@/components/core/app-textfield";
import type { GoalMaterialView } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export function ShoppingListPanel({
  characters,
  characterFilter,
  goalTypes,
  goalTypeFilter,
  materialsStillNeeded,
  search,
  setCharacterFilter,
  setGoalTypeFilter,
  setSearch,
}: {
  characters: string[];
  characterFilter: string;
  goalTypes: string[];
  goalTypeFilter: string;
  materialsStillNeeded: GoalMaterialView[];
  search: string;
  setCharacterFilter: (character: string) => void;
  setGoalTypeFilter: (goalType: string) => void;
  setSearch: (search: string) => void;
}) {
  const totalRemaining = materialsStillNeeded.reduce(
    (sum, material) => sum + material.remaining,
    0,
  );

  return (
    <Card className="flex flex-col overflow-hidden" variant="outlined">
      <div className="border-b border-outline-variant bg-surface p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-on-surface text-xl font-bold">
                Shopping List
              </h3>
              <p className="text-on-surface-variant text-sm">
                Aggregated material requirements for active goals.
              </p>
            </div>
            <div className="text-on-primary-container w-fit rounded-lg border border-outline-variant bg-primary-container px-4 py-2">
              <p className="text-xs font-semibold uppercase">Total Needed</p>
              <p className="text-2xl font-black leading-tight">
                {formatNumber(totalRemaining)}
              </p>
              <p className="text-xs font-medium">
                {formatNumber(materialsStillNeeded.length)} material
                {materialsStillNeeded.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-[minmax(16rem,1.4fr)_minmax(12rem,1fr)_minmax(12rem,1fr)] xl:w-[46rem]">
            <AppTextField
              label="Search"
              variant="outlined"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Select
              label="Character"
              variant="outlined"
              value={characterFilter}
              onChange={setCharacterFilter}
              options={characters.map((character) => ({
                label: character,
                value: character,
              }))}
            />
            <Select
              label="Goal type"
              variant="outlined"
              value={goalTypeFilter}
              onChange={setGoalTypeFilter}
              options={goalTypes.map((goalType) => ({
                label: goalType,
                value: goalType,
              }))}
            />
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {materialsStillNeeded.length === 0 ? (
            <EmptyState
              icon={<Sparkles className="h-8 w-8" />}
              title="Everything covered"
              description="No remaining materials match your filters."
            />
          ) : (
            materialsStillNeeded.map((item) => (
              <NeedCard key={item.materialId} item={item} />
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
