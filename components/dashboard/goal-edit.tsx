"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { ArrowLeft, Trash2, Target, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import {
  completeGoalAction,
  deleteGoalAction,
  deleteGoalMaterialAction,
  saveGoalMaterialAction,
} from "@/app/actions";
import { rarityColorMap } from "@/lib/constants";
import type { GoalView, MaterialView } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppTextField from "@/components/core/app-textfield";
import { Select } from "@/components/core/app-select";
import { Progress } from "@/components/ui/progress";
import { Panel } from "@/components/ui/panel";

type GoalEditProps = {
  goal: GoalView;
  materials: MaterialView[];
};

type GoalMaterialFormValues = {
  materialId: string;
  required: number;
};

export function GoalEdit({ goal, materials }: GoalEditProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<GoalMaterialFormValues>({
    defaultValues: {
      materialId: materials[0]?.id ?? "",
      required: 1,
    },
  });

  function handleSaveGoalMaterial(values: GoalMaterialFormValues) {
    startTransition(async () => {
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

      toast.success("Requirement added.");
      reset({ materialId: "", required: 1 });
      router.refresh();
    });
  }

  function handleCompleteGoal() {
    startTransition(async () => {
      const result = await completeGoalAction({ goalId: goal.id });

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Unable to complete goal.");
        return;
      }

      toast.success("Goal completed! Materials consumed from inventory.");
      router.refresh();
    });
  }

  function handleDeleteGoal() {
    startTransition(async () => {
      const result = await deleteGoalAction({ goalId: goal.id });

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Unable to delete goal.");
        return;
      }

      toast.success("Goal deleted.");
      router.push("/goals");
    });
  }

  function handleDeleteGoalMaterial(goalMaterialId: string) {
    startTransition(async () => {
      const result = await deleteGoalMaterialAction({ goalMaterialId });

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Unable to remove requirement.");
        return;
      }

      toast.success("Requirement removed.");
      router.refresh();
    });
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
              disabled={isPending || goal.materials.length === 0}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Complete Goal
            </Button>
          )}
          <Button
            variant="text"
            className="text-error hover:bg-error/5"
            onClick={handleDeleteGoal}
            disabled={isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.4fr]">
        <Panel
          title="Add Requirement"
          description="Attach materials to this goal."
        >
          <form
            className="mt-6 space-y-6"
            onSubmit={handleSubmit(handleSaveGoalMaterial)}
          >
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
                  isDisabled={goal.completed}
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
              disabled={goal.completed}
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
            <Button
              className="w-full"
              variant="tonal"
              type="submit"
              disabled={isPending || goal.completed}
            >
              {isPending
                ? "Adding..."
                : goal.completed
                  ? "Goal Completed"
                  : "Add Requirement"}
            </Button>
          </form>
        </Panel>

        <div className="space-y-6">
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
            <h3 className="text-on-surface mb-4 font-bold">
              Material Requirements
            </h3>
            {goal.materials.length === 0 ? (
              <div className="py-12 text-center">
                <Target className="text-on-surface-variant mx-auto mb-2 h-8 w-8" />
                <p className="text-on-surface-variant text-sm">
                  No materials added yet.
                </p>
                <p className="text-on-surface-variant text-xs">
                  Add materials on the left to start tracking.
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
                          <Image
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
                          disabled={isPending}
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
                            : (item.allocated / Math.max(item.required, 1)) *
                              100
                        }
                        className="h-1.5"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}
