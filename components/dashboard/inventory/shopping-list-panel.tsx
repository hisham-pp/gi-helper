"use client";

import { RefreshCw, Sparkles } from "lucide-react";

import { EmptyState } from "@/components/dashboard/common/empty-state";
import { NeedCard } from "@/components/dashboard/inventory/need-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/core/app-select";
import AppTextField from "@/components/core/app-textfield";
import type { GoalMaterialView } from "@/lib/types";

export function ShoppingListPanel({
  characters,
  characterFilter,
  goalTypes,
  goalTypeFilter,
  materialTypeFilter,
  materialTypes,
  materialsStillNeeded,
  search,
  setCharacterFilter,
  setGoalTypeFilter,
  setMaterialTypeFilter,
  setSearch,
  isRefreshing = false,
  onRefresh,
}: {
  characters: string[];
  characterFilter: string;
  goalTypes: string[];
  goalTypeFilter: string;
  materialTypeFilter: string;
  materialTypes: string[];
  materialsStillNeeded: GoalMaterialView[];
  search: string;
  setCharacterFilter: (character: string) => void;
  setGoalTypeFilter: (goalType: string) => void;
  setMaterialTypeFilter: (materialType: string) => void;
  setSearch: (search: string) => void;
  isRefreshing?: boolean;
  onRefresh: () => void;
}) {
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
            <Button
              type="button"
              variant="outlined"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh shopping list"
              className="w-fit px-4"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Refreshing" : "Refresh"}
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:w-[60rem] xl:grid-cols-[minmax(14rem,1.3fr)_repeat(3,minmax(10rem,1fr))]">
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
            <Select
              label="Material type"
              variant="outlined"
              value={materialTypeFilter}
              onChange={setMaterialTypeFilter}
              options={materialTypes.map((materialType) => ({
                label: materialType,
                value: materialType,
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
