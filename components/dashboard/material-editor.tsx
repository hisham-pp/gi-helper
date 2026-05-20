"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import AppTextField from "@/components/core/app-textfield";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/core/app-select";

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
  onSave,
  categoryOptions,
  parentOptions,
}: {
  open: boolean;
  close: () => void;
  form: MaterialEditorForm;
  onSave: (values: MaterialEditorForm) => Promise<void> | void;
  categoryOptions: Array<{ label: string; value: string }>;
  parentOptions: Array<{ label: string; value: string }>;
}) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<MaterialEditorForm>({
    defaultValues: form,
  });
  const materialId = watch("id");

  useEffect(() => {
    reset(form);
  }, [form, reset]);

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
          <form onSubmit={handleSubmit(onSave)}>
            <h3
              id="material-editor-title"
              className="text-on-surface mb-4 text-lg font-bold"
            >
              Material Editor
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <AppTextField
                label="ID"
                readOnly
                error={Boolean(errors.id)}
                helperText={
                  errors.id?.message ??
                  "Auto-generated for new materials and fixed after creation."
                }
                {...register("id", { required: "Material ID is required." })}
              />
              <AppTextField
                label="Name"
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
                {...register("name", {
                  maxLength: {
                    value: 200,
                    message: "Name must be 200 characters or fewer.",
                  },
                  onChange: (event) => {
                    if (!materialId) {
                      setValue(
                        "id",
                        generateMaterialIdFromName(event.target.value),
                        { shouldDirty: true, shouldValidate: true },
                      );
                    }
                  },
                  required: "Name is required.",
                })}
              />
              <AppTextField
                label="Icon Name"
                error={Boolean(errors.iconName)}
                helperText={
                  errors.iconName?.message ??
                  "Enter the icon identifier like UI_ItemIcon_100001"
                }
                {...register("iconName", {
                  maxLength: {
                    value: 200,
                    message: "Icon name must be 200 characters or fewer.",
                  },
                  required: "Icon name is required.",
                })}
              />
              <Controller
                control={control}
                name="category"
                rules={{ required: "Category is required." }}
                render={({ field }) => (
                  <div>
                    <Select
                      label="Category"
                      variant="outlined"
                      value={field.value}
                      onChange={field.onChange}
                      options={categoryOptions}
                    />
                    {errors.category?.message && (
                      <p className="mt-1 text-sm font-medium text-error">
                        {errors.category.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <AppTextField
                label="Rarity"
                type="number"
                error={Boolean(errors.rarity)}
                helperText={errors.rarity?.message}
                {...register("rarity", {
                  max: { value: 5, message: "Rarity cannot be above 5." },
                  min: { value: 1, message: "Rarity must be at least 1." },
                  required: "Rarity is required.",
                  valueAsNumber: true,
                })}
              />
              <AppTextField
                label="Combine Ratio"
                type="number"
                error={Boolean(errors.combineRatio)}
                helperText={errors.combineRatio?.message}
                {...register("combineRatio", {
                  setValueAs: (value) => (value === "" ? null : Number(value)),
                })}
              />
              <Controller
                control={control}
                name="parentMaterialId"
                render={({ field }) => (
                  <Select
                    label="Parent Material"
                    variant="outlined"
                    value={field.value ?? ""}
                    onChange={(value) => field.onChange(value || null)}
                    options={parentOptions}
                  />
                )}
              />
              <AppTextField
                label="Description"
                error={Boolean(errors.description)}
                helperText={errors.description?.message}
                {...register("description", {
                  maxLength: {
                    value: 1000,
                    message: "Description must be 1000 characters or fewer.",
                  },
                })}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="text" onClick={close}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
