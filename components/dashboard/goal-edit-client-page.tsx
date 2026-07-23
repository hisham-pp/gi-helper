"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { GoalEdit } from "@/components/dashboard/goal-edit";
import { Button } from "@/components/ui/button";
import { GoalDetailPageLoading } from "@/components/ui/page-loading";
import type { DashboardData, GoalView, MaterialView } from "@/lib/types";

type GoalDetailPayload = {
  goal: GoalView;
  materials: MaterialView[];
};

type LoadStatus =
  | "loading"
  | "ready"
  | "login-required"
  | "not-found"
  | "error";

export function GoalEditClientPage({ goalId }: { goalId: string }) {
  const router = useRouter();
  const [goal, setGoal] = useState<GoalView | null>(null);
  const [materials, setMaterials] = useState<MaterialView[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");

  const loadGoal = useCallback(async () => {
    setStatus("loading");

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        cache: "no-store",
      });

      if (response.status === 401) {
        setStatus("login-required");
        return;
      }

      if (response.status === 404) {
        setStatus("not-found");
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load goal.");
      }

      const payload = (await response.json()) as GoalDetailPayload;

      setGoal(payload.goal);
      setMaterials(payload.materials);
      setStatus("ready");
    } catch (error) {
      console.error("Goal detail load failed", error);
      setStatus("error");
      toast.error("Unable to load goal.");
    }
  }, [goalId]);

  useEffect(() => {
    void loadGoal();
  }, [loadGoal]);

  function handleDashboardUpdate(nextData: DashboardData) {
    const nextGoal = nextData.goals.find((item) => item.id === goalId);

    if (!nextGoal) {
      router.push("/goals");
      return;
    }

    setGoal(nextGoal);
    setMaterials(nextData.materials);
  }

  if (status === "loading") {
    return <GoalDetailPageLoading />;
  }

  if (status === "login-required") {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-outline-variant bg-surface p-8">
        <h1 className="text-on-surface text-2xl font-bold">Login required</h1>
        <p className="text-on-surface-variant mt-3 text-sm leading-6">
          Goal editing is personal data. Login to save and edit your goals.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link className="w-full" href="/login">
            <Button className="w-full rounded-lg">Login</Button>
          </Link>
          <Link className="w-full" href="/register">
            <Button className="w-full rounded-lg" variant="outlined">
              Create account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (status === "not-found") {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-outline-variant bg-surface p-8">
        <h1 className="text-on-surface text-2xl font-bold">Goal not found</h1>
        <p className="text-on-surface-variant mt-3 text-sm">
          This goal may have been deleted or belongs to another account.
        </p>
        <Link className="mt-6 block w-fit" href="/goals">
          <Button variant="outlined">Back to goals</Button>
        </Link>
      </div>
    );
  }

  if (status === "error" || !goal) {
    return (
      <div className="rounded-lg border border-outline-variant bg-surface p-8">
        <h1 className="text-on-surface text-2xl font-bold">
          Unable to load this goal.
        </h1>
        <p className="text-on-surface-variant mt-3 text-sm">
          Refresh the page or try again in a moment.
        </p>
      </div>
    );
  }

  return (
    <GoalEdit
      goal={goal}
      materials={materials}
      onDashboardUpdate={handleDashboardUpdate}
    />
  );
}
