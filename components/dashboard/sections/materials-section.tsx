"use client";

import { PackageSearch } from "lucide-react";

import {
  MaterialEditor,
  type MaterialEditorForm,
} from "@/components/dashboard/material-editor";
import { EmptyState } from "@/components/dashboard/common/empty-state";
import { MaterialLibraryCard } from "@/components/dashboard/materials/material-library-card";
import { Panel } from "@/components/dashboard/common/panel";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/core/app-select";
import AppTextField from "@/components/core/app-textfield";
import type { MaterialView } from "@/lib/types";

export function MaterialsSection({
  categories,
  categoryFilter,
  categoryOptions,
  isEditorOpen,
  isMaster,
  materials,
  parentOptions,
  search,
  setCategoryFilter,
  editorForm,
  setSearch,
  closeEditor,
  onCreate,
  onEdit,
  onSave,
}: {
  categories: string[];
  categoryFilter: string;
  categoryOptions: Array<{ label: string; value: string }>;
  isEditorOpen: boolean;
  isMaster: boolean;
  materials: MaterialView[];
  parentOptions: Array<{ label: string; value: string }>;
  search: string;
  setCategoryFilter: (category: string) => void;
  editorForm: MaterialEditorForm;
  setSearch: (search: string) => void;
  closeEditor: () => void;
  onCreate: () => void;
  onEdit: (material: MaterialView) => void;
  onSave: (values: MaterialEditorForm) => Promise<void> | void;
}) {
  const hasFilters = search.length > 0 || categoryFilter !== "All";

  return (
    <>
      <Panel
        title="Material Library"
        description="Preloaded data with rarity colors and crafting links."
        action={
          isMaster ? (
            <div className="flex gap-2">
              <Button onClick={onCreate}>New Material</Button>
              <Button onClick={onCreate}>Edit Library</Button>
            </div>
          ) : undefined
        }
      >
        <div className="mt-6 flex flex-col gap-4 border-b border-outline-variant pb-6 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-on-surface-variant text-sm">
            Showing {materials.length} material
            {materials.length === 1 ? "" : "s"}
          </p>
          <div className="grid gap-3 sm:grid-cols-[minmax(18rem,1.5fr)_minmax(14rem,1fr)_auto] lg:w-[48rem]">
            <AppTextField
              label="Search materials"
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
            <Button
              variant="outlined"
              className="h-12 whitespace-nowrap"
              disabled={!hasFilters}
              onClick={() => {
                setSearch("");
                setCategoryFilter("All");
              }}
            >
              Clear
            </Button>
          </div>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {materials.length === 0 ? (
            <div className="md:col-span-2 xl:col-span-3">
              <EmptyState
                icon={<PackageSearch className="h-8 w-8" />}
                title="No materials"
                description="No materials match your search or filters."
              />
            </div>
          ) : (
            materials.map((material) => (
              <MaterialLibraryCard
                key={material.id}
                material={material}
                canEdit={isMaster}
                onEdit={onEdit}
              />
            ))
          )}
        </div>
      </Panel>
      <MaterialEditor
        open={isEditorOpen}
        close={closeEditor}
        form={editorForm}
        onSave={onSave}
        categoryOptions={categoryOptions}
        parentOptions={parentOptions}
      />
    </>
  );
}
