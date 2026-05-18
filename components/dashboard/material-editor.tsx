"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { TextField } from "@/components/ui/text-field";

export type MaterialEditorForm = {
  id: string;
  name: string;
  iconName: string;
  rarity: number;
  category: string;
  description: string;
  combinable: boolean;
  combineRatio: number | null;
  parentMaterialId: string | null;
};

const generateMaterialIdFromName = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function MaterialEditor({
  open,
  close,
  form,
  setForm,
  onSave,
  categoryOptions,
  parentOptions,
}: {
  open: boolean;
  close: () => void;
  form: MaterialEditorForm;
  setForm: (next: MaterialEditorForm) => void;
  onSave: () => Promise<void> | void;
  categoryOptions: Array<{ label: string; value: string }>;
  parentOptions: Array<{ label: string; value: string }>;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="material-editor-title"
    >
      <div className="w-full max-w-2xl">
        <Card className="p-6">
          <h3
            id="material-editor-title"
            className="text-on-surface mb-4 text-lg font-bold"
          >
            Material Editor
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            <TextField
              label="ID"
              value={form.id}
              readOnly
              helperText="Auto-generated for new materials and fixed after creation."
            />
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => {
                const nextName = e.target.value;
                setForm({
                  ...form,
                  name: nextName,
                  id: form.id || generateMaterialIdFromName(nextName),
                });
              }}
            />
            <TextField
              label="Icon Name"
              value={form.iconName}
              onChange={(e) => setForm({ ...form, iconName: e.target.value })}
              helperText="Enter the icon identifier like UI_ItemIcon_100001"
            />
            <Select
              label="Category"
              variant="outlined"
              value={form.category}
              onChange={(value) => setForm({ ...form, category: value })}
              options={categoryOptions}
            />
            <TextField
              label="Rarity"
              type="number"
              value={String(form.rarity)}
              onChange={(e) =>
                setForm({ ...form, rarity: Number(e.target.value) })
              }
            />
            <TextField
              label="Combine Ratio"
              type="number"
              value={form.combineRatio ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  combineRatio: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
            <Select
              label="Parent Material"
              variant="outlined"
              value={form.parentMaterialId ?? ""}
              onChange={(value) =>
                setForm({ ...form, parentMaterialId: value || null })
              }
              options={parentOptions}
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="text" onClick={close}>
              Cancel
            </Button>
            <Button onClick={onSave}>Save</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
