"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { createGoalAction } from "@/app/actions";
import AppTextField from "@/components/core/app-textfield";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

type CreateGoalFormValues = {
  name: string;
  description: string;
};

export function CreateGoal() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<CreateGoalFormValues>({
    defaultValues: {
      description: "",
      name: "",
    },
  });

  function handleCreateGoal(values: CreateGoalFormValues) {
    startTransition(async () => {
      const result = await createGoalAction({
        name: values.name,
        description: values.description,
      });

      if (!result.success || !result.data) {
        setError("root", {
          message: result.error ?? "Unable to create goal.",
        });
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
          <form
            className="mt-6 space-y-6"
            onSubmit={handleSubmit(handleCreateGoal)}
          >
            <AppTextField
              label="Goal name"
              variant="outlined"
              error={Boolean(errors.name)}
              helperText={
                errors.name?.message ??
                "Give your farming goal a memorable name (e.g., 'Ascend Nahida to 90')"
              }
              {...register("name", {
                maxLength: {
                  value: 60,
                  message: "Goal name must be 60 characters or fewer.",
                },
                minLength: {
                  value: 2,
                  message: "Goal name must be at least 2 characters.",
                },
                required: "Goal name is required.",
              })}
            />
            <AppTextField
              label="Description (optional)"
              variant="outlined"
              multiline
              error={Boolean(errors.description)}
              helperText={errors.description?.message}
              rows={4}
              {...register("description", {
                maxLength: {
                  value: 180,
                  message: "Description must be 180 characters or fewer.",
                },
              })}
            />
            {errors.root?.message && (
              <p className="text-sm font-medium text-error">
                {errors.root.message}
              </p>
            )}
            <div className="flex gap-3">
              <Button
                className="flex-1"
                disabled={isPending}
                type="submit"
              >
                {isPending ? "Creating..." : "Create Goal"}
              </Button>
              <Link href="/goals" className="flex-1">
                <Button type="button" variant="outlined" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Panel>
      </div>
    </div>
  );
}
