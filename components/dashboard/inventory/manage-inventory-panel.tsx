"use client";

import { PackageSearch } from "lucide-react";

import { EmptyState } from "@/components/dashboard/common/empty-state";
import { MaterialCard } from "@/components/dashboard/inventory/material-card";
import type {
  InventoryDraft,
  InventoryDraftSetter,
} from "@/components/dashboard/inventory/types";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/core/app-select";
import AppTextField from "@/components/core/app-textfield";
import type { MaterialView } from "@/lib/types";

export function ManageInventoryPanel({
  categories,
  categoryFilter,
  filteredMaterials,
  inventoryDraft,
  isLoading = false,
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
  isLoading?: boolean;
  search: string;
  setCategoryFilter: (category: string) => void;
  setInventoryDraft: InventoryDraftSetter;
  setSearch: (search: string) => void;
  onSaveMaterial: (materialId: string) => void;
}) {
  return (
    <Card className="flex flex-col overflow-hidden" variant="outlined">
      <div className="border-b border-outline-variant bg-surface p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-on-surface text-xl font-bold">Inventory</h3>
            <p className="text-on-surface-variant text-sm">
              Search, filter, and update owned quantities.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(18rem,1.5fr)_minmax(14rem,1fr)] lg:w-[42rem]">
            <AppTextField
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
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 8 }, (_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-lg border border-outline-variant bg-surface-variant/20"
              />
            ))
          ) : filteredMaterials.length === 0 ? (
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
  );
}
