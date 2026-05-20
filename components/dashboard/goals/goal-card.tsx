"use client";

import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { GoalView } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export function GoalCard({ goal }: { goal: GoalView }) {
  const isCompleted = goal.completed;

  return (
    <Link href={`/goals/${goal.id}` as any} aria-label={`Open ${goal.name}`}>
      <Card
        variant="outlined"
        className="h-full cursor-pointer p-6 transition-all hover:border-primary hover:shadow-lg"
      >
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-on-surface truncate font-bold">
                  {goal.name}
                </h3>
                {isCompleted && (
                  <Sparkles
                    className="h-3.5 w-3.5 text-primary"
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="mt-1 flex flex-wrap gap-2">
                {goal.characterName && (
                  <span className="rounded-full bg-secondary-container px-2 py-0.5 text-[10px] font-bold text-secondary-on-container">
                    {goal.characterName}
                  </span>
                )}
                {goal.category && (
                  <span className="text-on-surface-variant rounded-full border border-outline-variant bg-surface-variant px-2 py-0.5 text-[10px] font-bold capitalize">
                    {goal.category}
                  </span>
                )}
              </div>
              <p className="text-on-surface-variant mt-2 line-clamp-2 text-sm">
                {goal.description ?? "Custom farming plan"}
              </p>
            </div>
            <ChevronRight
              className="text-on-surface-variant h-5 w-5 flex-shrink-0"
              aria-hidden="true"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface-variant">Progress</span>
              <span className="font-bold text-primary">
                {isCompleted ? 100 : goal.progressPercent}%
              </span>
            </div>
            <Progress
              value={isCompleted ? 100 : goal.progressPercent}
              className="h-2"
            />
          </div>

          <div className="text-on-surface-variant flex items-center justify-between border-t border-outline-variant pt-2 text-xs">
            <span>
              {goal.materials.length} material
              {goal.materials.length !== 1 ? "s" : ""}
            </span>
            <span>{formatNumber(goal.totalRequired)} total needed</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
