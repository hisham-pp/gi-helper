"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { createGoalAction } from "@/app/actions";
import { TextField } from "@/components/ui/text-field";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { useState } from "react";

export function CreateGoal() {
  const router = useRouter();
  const [goalName, setGoalName] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleCreateGoal() {
    if (!goalName.trim()) {
      toast.error("Goal name is required.");
      return;
    }

    startTransition(async () => {
      const result = await createGoalAction({
        name: goalName,
        description: goalDescription,
      });

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Unable to create goal.");
        return;
      }

      toast.success("Goal created.");
      const createdGoal = result.data.goals[result.data.goals.length - 1];
      if (createdGoal) {
        router.push(`/goals/${createdGoal.id}` as any);
      } else {
        router.push("/goals");
      }
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
        <div>
          <h1 className="text-on-surface text-3xl font-bold tracking-tight">
            Create New Goal
          </h1>
          <p className="text-on-surface-variant mt-1">
            Set up a new farming target to track.
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Panel
          title="Goal Details"
          description="Basic information about your farming goal."
        >
          <div className="mt-6 space-y-6">
            <TextField
              label="Goal name"
              variant="outlined"
              value={goalName}
              onChange={(event) => setGoalName(event.target.value)}
              helperText="Give your farming goal a memorable name (e.g., 'Ascend Nahida to 90')"
            />
            <Textarea
              label="Description (optional)"
              variant="outlined"
              value={goalDescription}
              onChange={(event) => setGoalDescription(event.target.value)}
              rows={4}
            />
            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={handleCreateGoal}
                disabled={isPending}
              >
                {isPending ? "Creating..." : "Create Goal"}
              </Button>
              <Link href="/goals" className="flex-1">
                <Button variant="outlined" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
