"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { ArrowLeft, Trash2, Target } from "lucide-react";
import { toast } from "sonner";

import {
  deleteGoalAction,
  deleteGoalMaterialAction,
  saveGoalMaterialAction,
} from "@/app/actions";
import { rarityColorMap } from "@/lib/constants";
import type { DashboardData, GoalView, MaterialView } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { Select } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Panel } from "@/components/ui/panel";
import { EmptyState } from "@/components/ui/empty-state";

type GoalEditProps = {
  goal: GoalView;
  materials: MaterialView[];
  allData: DashboardData;
  onUpdateData: (data: DashboardData) => void;
};

export function GoalEdit({
  goal,
  materials,
  allData,
  onUpdateData,
}: GoalEditProps) {
  const router = useRouter();
  const [selectedMaterialId, setSelectedMaterialId] = useState(
    materials[0]?.id ?? "",
  );
  const [goalMaterialRequired, setGoalMaterialRequired] = useState(1);
  const [isPending, startTransition] = useTransition();

  function handleSaveGoalMaterial() {
    if (!goal.id || !selectedMaterialId) {
      toast.error("Select a material.");
      return;
    }

    startTransition(async () => {
      const result = await saveGoalMaterialAction({
        goalId: goal.id,
        materialId: selectedMaterialId,
        required: goalMaterialRequired,
      });

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Unable to save requirement.");
        return;
      }

      onUpdateData(result.data);
      toast.success("Requirement added.");
      setSelectedMaterialId("");
      setGoalMaterialRequired(1);
    });
  }

  function handleDeleteGoal() {
    startTransition(async () => {
      const result = await deleteGoalAction({ goalId: goal.id });

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Unable to delete goal.");
        return;
      }

      onUpdateData(result.data);
      toast.success("Goal deleted.");
      router.push("/materials?tab=goals");
    });
  }

  function handleDeleteGoalMaterial(goalMaterialId: string) {
    startTransition(async () => {
      const result = await deleteGoalMaterialAction({ goalMaterialId });

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Unable to remove requirement.");
        return;
      }

      onUpdateData(result.data);
      toast.success("Requirement removed.");
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/materials">
          <Button variant="text" className="p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-on-surface text-3xl font-bold tracking-tight">
            {goal.name}
          </h1>
          <p className="text-on-surface-variant mt-1">
            {goal.description ?? "Custom farming plan."}
          </p>
        </div>
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

      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.4fr]">
        <Panel
          title="Add Requirement"
          description="Attach materials to this goal."
        >
          <div className="mt-6 space-y-6">
            <Select
              label="Select Material"
              value={selectedMaterialId}
              onChange={setSelectedMaterialId}
              options={materials.map((material) => ({
                label: material.name,
                value: material.id,
              }))}
            />
            <TextField
              label="Required Quantity"
              variant="outlined"
              type="number"
              min={0}
              value={goalMaterialRequired}
              onChange={(event) =>
                setGoalMaterialRequired(Number(event.target.value))
              }
              helperText="How many of this material do you need?"
            />
            <Button
              className="w-full"
              variant="tonal"
              onClick={handleSaveGoalMaterial}
              disabled={isPending}
            >
              {isPending ? "Adding..." : "Add Requirement"}
            </Button>
          </div>
        </Panel>

        <div className="space-y-6">
          <div>
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-on-surface-variant font-medium">
                Overall Progress
              </span>
              <span className="font-bold text-primary">
                {goal.progressPercent}%
              </span>
            </div>
            <Progress value={goal.progressPercent} className="h-2" />
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
                            {formatNumber(item.allocated)} /{" "}
                            {formatNumber(item.required)} allocated
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="text"
                        className="text-on-surface-variant h-8 w-8 p-0 hover:bg-error/5 hover:text-error"
                        onClick={() => handleDeleteGoalMaterial(item.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-4">
                      <Progress
                        value={
                          (item.allocated / Math.max(item.required, 1)) * 100
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
