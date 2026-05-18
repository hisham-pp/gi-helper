"use client";

import { MaterialEditor, type MaterialEditorForm } from "@/components/dashboard/material-editor";
import { MaterialLibraryCard } from "@/components/dashboard/materials/material-library-card";
import { Panel } from "@/components/dashboard/common/panel";
import { Button } from "@/components/ui/button";
import type { MaterialView } from "@/lib/types";

export function MaterialsSection({
  categoryOptions,
  isEditorOpen,
  isMaster,
  materials,
  parentOptions,
  editorForm,
  setEditorForm,
  closeEditor,
  onCreate,
  onEdit,
  onSave,
}: {
  categoryOptions: Array<{ label: string; value: string }>;
  isEditorOpen: boolean;
  isMaster: boolean;
  materials: MaterialView[];
  parentOptions: Array<{ label: string; value: string }>;
  editorForm: MaterialEditorForm;
  setEditorForm: (next: MaterialEditorForm) => void;
  closeEditor: () => void;
  onCreate: () => void;
  onEdit: (material: MaterialView) => void;
  onSave: () => Promise<void> | void;
}) {
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
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {materials.map((material) => (
            <MaterialLibraryCard
              key={material.id}
              material={material}
              canEdit={isMaster}
              onEdit={onEdit}
            />
          ))}
        </div>
      </Panel>
      <MaterialEditor
        open={isEditorOpen}
        close={closeEditor}
        form={editorForm}
        setForm={setEditorForm}
        onSave={onSave}
        categoryOptions={categoryOptions}
        parentOptions={parentOptions}
      />
    </>
  );
}
