"use client";

import { PackageSearch } from "lucide-react";

import { EmptyState } from "@/components/dashboard/common/empty-state";
import { SummaryList } from "@/components/dashboard/common/summary-list";
import { MaterialCard } from "@/components/dashboard/inventory/material-card";
import type { InventoryDraft, InventoryDraftSetter } from "@/components/dashboard/inventory/types";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { TextField } from "@/components/ui/text-field";
import type { GoalMaterialView, MaterialView } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export function ManageInventoryPanel({
  categories,
  categoryFilter,
  filteredMaterials,
  inventoryDraft,
  materialsStillNeeded,
  search,
  setCategoryFilter,
  setInventoryDraft,
  setSearch,
  onSaveMaterial,
}: {
  categories: string[];
  categoryFilter: string;
  filteredMaterials: MaterialView[];
  inventoryDraft: InventoryDraft;
  materialsStillNeeded: GoalMaterialView[];
  search: string;
  setCategoryFilter: (category: string) => void;
  setInventoryDraft: InventoryDraftSetter;
  setSearch: (search: string) => void;
  onSaveMaterial: (materialId: string) => void;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
      <Card className="flex flex-col overflow-hidden" variant="outlined">
        <div className="border-b border-outline-variant bg-surface p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-on-surface text-xl font-bold">Inventory</h3>
              <p className="text-on-surface-variant text-sm">
                Search, filter, and update owned quantities.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <TextField
                label="Search"
                variant="outlined"
                className="h-12"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <Select
                label="Category"
                variant="outlined"
                className="h-12"
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={categories.map((category) => ({
                  label: category,
                  value: category,
                }))}
              />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredMaterials.length === 0 ? (
              <EmptyState
                icon={<PackageSearch className="h-8 w-8" />}
                title="No materials"
                description="No materials match your search or filters."
              />
            ) : (
              filteredMaterials.map((material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  quantity={inventoryDraft[material.id] ?? 0}
                  onChange={(value) =>
                    setInventoryDraft((prev) => ({
                      ...prev,
                      [material.id]: value,
                    }))
                  }
                  onSave={() => onSaveMaterial(material.id)}
                />
              ))
            )}
          </div>
        </div>
      </Card>

      <div className="space-y-8">
        <SummaryList
          items={materialsStillNeeded.slice(0, 8).map((item) => ({
            id: item.id,
            title: item.materialName,
            subtitle: `${formatNumber(item.remaining)} still needed`,
            image: item.materialId,
          }))}
          title="Shortages Overview"
          description="Highest deficits across all farming goals."
          emptyText="No shortages. All goals are covered."
        />
      </div>
    </div>
  );
}
