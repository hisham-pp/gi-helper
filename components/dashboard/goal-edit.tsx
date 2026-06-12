"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ArrowLeft,
  CheckCircle2,
  PlusCircle,
  Target,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  completeGoalAction,
  deleteGoalAction,
  deleteGoalMaterialAction,
  saveGoalMaterialAction,
} from "@/app/actions";
import { rarityColorMap } from "@/lib/constants";
import type { DashboardData, GoalView, MaterialView } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CachedImage } from "@/components/ui/cached-image";
import AppTextField from "@/components/core/app-textfield";
import { Select } from "@/components/core/app-select";
import { Progress } from "@/components/ui/progress";

type GoalEditProps = {
  goal: GoalView;
  materials: MaterialView[];
  onDashboardUpdate?: (data: DashboardData) => void;
};

type GoalMaterialFormValues = {
  materialId: string;
  required: number;
};

export function GoalEdit({
  goal,
  materials,
  onDashboardUpdate,
}: GoalEditProps) {
  const router = useRouter();
  const [isRequirementDialogOpen, setIsRequirementDialogOpen] = useState(false);
  const [isAddingRequirement, setIsAddingRequirement] = useState(false);
  const [isUpdatingRequirement, setIsUpdatingRequirement] = useState(false);
  const [isUpdatingGoal, setIsUpdatingGoal] = useState(false);
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
    watch,
  } = useForm<GoalMaterialFormValues>({
    defaultValues: {
      materialId: materials[0]?.id ?? "",
      required: 1,
    },
  });
  const selectedMaterialId = watch("materialId");
  const selectedRequirement = goal.materials.find(
    (item) => item.materialId === selectedMaterialId,
  );
  const isExistingRequirement = Boolean(selectedRequirement);
  const isSavingRequirement = isAddingRequirement || isUpdatingRequirement;
  const isBusy = isSavingRequirement || isUpdatingGoal;

  useEffect(() => {
    if (!isRequirementDialogOpen) {
      return;
    }

    setValue("required", selectedRequirement?.required ?? 1);
  }, [
    isRequirementDialogOpen,
    selectedMaterialId,
    selectedRequirement?.required,
    setValue,
  ]);

  function handleOpenRequirementDialog() {
    reset({ materialId: materials[0]?.id ?? "", required: 1 });
    setIsRequirementDialogOpen(true);
  }

  function handleCloseRequirementDialog() {
    reset({ materialId: materials[0]?.id ?? "", required: 1 });
    setIsRequirementDialogOpen(false);
  }

  async function handleSaveGoalMaterial(values: GoalMaterialFormValues) {
    const isUpdatingExistingRequirement = goal.materials.some(
      (item) => item.materialId === values.materialId,
    );

    if (isUpdatingExistingRequirement) {
      setIsUpdatingRequirement(true);
    } else {
      setIsAddingRequirement(true);
    }

    try {
      const result = await saveGoalMaterialAction({
        goalId: goal.id,
        materialId: values.materialId,
        required: values.required,
      });

      if (!result.success || !result.data) {
        setError("root", {
          message: result.error ?? "Unable to save requirement.",
        });
        toast.error(result.error ?? "Unable to save requirement.");
        return;
      }

      toast.success(
        isUpdatingExistingRequirement
          ? "Requirement updated."
          : "Requirement added.",
      );
      reset({ materialId: materials[0]?.id ?? "", required: 1 });
      setIsRequirementDialogOpen(false);
      if (result.data && onDashboardUpdate) {
        onDashboardUpdate(result.data);
      } else {
        router.refresh();
      }
    } finally {
      if (isUpdatingExistingRequirement) {
        setIsUpdatingRequirement(false);
      } else {
        setIsAddingRequirement(false);
      }
    }
  }

  async function handleCompleteGoal() {
    setIsUpdatingGoal(true);

    try {
      const result = await completeGoalAction({ goalId: goal.id });

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Unable to complete goal.");
        return;
      }

      toast.success("Goal completed! Materials consumed from inventory.");
      if (result.data && onDashboardUpdate) {
        onDashboardUpdate(result.data);
      } else {
        router.refresh();
      }
    } finally {
      setIsUpdatingGoal(false);
    }
  }

  async function handleDeleteGoal() {
    setIsUpdatingGoal(true);

    try {
      const result = await deleteGoalAction({ goalId: goal.id });

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Unable to delete goal.");
        return;
      }

      toast.success("Goal deleted.");
      router.push("/goals");
    } finally {
      setIsUpdatingGoal(false);
    }
  }

  async function handleDeleteGoalMaterial(goalMaterialId: string) {
    setIsUpdatingGoal(true);

    try {
      const result = await deleteGoalMaterialAction({ goalMaterialId });

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Unable to remove requirement.");
        return;
      }

      toast.success("Requirement removed.");
      if (result.data && onDashboardUpdate) {
        onDashboardUpdate(result.data);
      } else {
        router.refresh();
      }
    } finally {
      setIsUpdatingGoal(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/goals">
          <Button variant="text" className="p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-on-surface text-3xl font-bold tracking-tight">
              {goal.name}
            </h1>
            {goal.completed && (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Completed
              </span>
            )}
          </div>
          <p className="text-on-surface-variant mt-1">
            {goal.description ?? "Custom farming plan."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!goal.completed && (
            <Button
              variant="tonal"
              className="bg-primary/10 text-primary hover:bg-primary/20"
              onClick={handleCompleteGoal}
              disabled={isBusy || goal.materials.length === 0}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {isUpdatingGoal ? "Updating..." : "Complete Goal"}
            </Button>
          )}
          <Button
            variant="text"
            className="text-error hover:bg-error/5"
            onClick={handleDeleteGoal}
            disabled={isBusy}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <section className="space-y-6">
        <div>
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-on-surface-variant font-medium">
              Overall Progress
            </span>
            <span className="font-bold text-primary">
              {goal.completed ? 100 : goal.progressPercent}%
            </span>
          </div>
          <Progress
            value={goal.completed ? 100 : goal.progressPercent}
            className="h-2"
          />
        </div>

        <Card variant="outlined" className="p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-on-surface font-bold">Material Requirements</h3>
            {!goal.completed && (
              <Button
                variant="tonal"
                type="button"
                onClick={handleOpenRequirementDialog}
                disabled={isBusy}
              >
                <PlusCircle className="h-4 w-4" />
                Add Requirement
              </Button>
            )}
          </div>
          {goal.materials.length === 0 ? (
            <div className="py-12 text-center">
              <Target className="text-on-surface-variant mx-auto mb-2 h-8 w-8" />
              <p className="text-on-surface-variant text-sm">
                No materials added yet.
              </p>
              <p className="text-on-surface-variant text-xs">
                Add materials to start tracking this goal.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {goal.materials.map((item) => (
                <Card
                  key={item.id}
                  variant="filled"
                  className="bg-surface-variant/30 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <div
                        className={cn(
                          "relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br",
                          rarityColorMap[item.rarity] ?? rarityColorMap[1],
                        )}
                      >
                        <CachedImage
                          src={`/api/material-image/${item.materialId}`}
                          alt={item.materialName}
                          fill
                          className="object-contain p-2"
                          sizes="48px"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-on-surface font-bold">
                          {item.materialName}
                        </p>
                        <p className="text-on-surface-variant text-xs">
                          {goal.completed
                            ? `${formatNumber(item.required)} / ${formatNumber(item.required)} collected`
                            : `${formatNumber(item.allocated)} / ${formatNumber(item.required)} allocated`}
                        </p>
                      </div>
                    </div>
                    {!goal.completed && (
                      <Button
                        variant="text"
                        className="h-8 px-3 text-error hover:bg-error/5"
                        onClick={() => handleDeleteGoalMaterial(item.id)}
                        disabled={isBusy}
                        aria-label={`Remove ${item.materialName} from goal`}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="mt-4">
                    <Progress
                      value={
                        goal.completed
                          ? 100
                          : (item.allocated / Math.max(item.required, 1)) * 100
                      }
                      className="h-1.5"
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </section>

      {isRequirementDialogOpen && (
        <div
          className="bg-scrim/55 fixed inset-0 z-50 grid place-items-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="goal-requirement-title"
          aria-describedby="goal-requirement-description"
        >
          <Card
            variant="outlined"
            className="w-full max-w-lg rounded-lg bg-surface p-6 shadow-xl"
          >
            <form
              className="space-y-6"
              onSubmit={handleSubmit(handleSaveGoalMaterial)}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2
                    id="goal-requirement-title"
                    className="text-on-surface text-xl font-bold"
                  >
                    Add Requirement
                  </h2>
                  <p
                    id="goal-requirement-description"
                    className="text-on-surface-variant mt-1 text-sm"
                  >
                    Attach materials to this goal.
                  </p>
                </div>
                <button
                  aria-label="Close requirement form"
                  className="text-on-surface grid h-9 w-9 place-items-center rounded-lg border border-outline-variant transition hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50"
                  type="button"
                  onClick={handleCloseRequirementDialog}
                  disabled={isSavingRequirement}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <Controller
                control={control}
                name="materialId"
                rules={{ required: "Select a material." }}
                render={({ field }) => (
                  <Select
                    label="Select Material"
                    variant="outlined"
                    value={field.value}
                    onChange={field.onChange}
                    options={materials.map((material) => ({
                      label: material.name,
                      value: material.id,
                    }))}
                    isDisabled={goal.completed || isSavingRequirement}
                  />
                )}
              />
              {errors.materialId?.message && (
                <p className="-mt-4 text-sm font-medium text-error">
                  {errors.materialId.message}
                </p>
              )}
              <AppTextField
                label="Required Quantity"
                variant="outlined"
                type="number"
                min={0}
                error={Boolean(errors.required)}
                helperText={
                  errors.required?.message ??
                  "How many of this material do you need?"
                }
                disabled={goal.completed || isSavingRequirement}
                {...register("required", {
                  min: {
                    value: 0,
                    message: "Required quantity cannot be negative.",
                  },
                  required: "Required quantity is required.",
                  valueAsNumber: true,
                })}
              />
              {errors.root?.message && (
                <p className="text-sm font-medium text-error">
                  {errors.root.message}
                </p>
              )}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="text"
                  type="button"
                  onClick={handleCloseRequirementDialog}
                  disabled={isSavingRequirement}
                >
                  Cancel
                </Button>
                <Button
                  variant="tonal"
                  type="submit"
                  disabled={isSavingRequirement || goal.completed}
                >
                  {isUpdatingRequirement
                    ? "Updating..."
                    : isAddingRequirement
                      ? "Adding..."
                      : isExistingRequirement
                        ? "Update Requirement"
                        : "Add Requirement"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
