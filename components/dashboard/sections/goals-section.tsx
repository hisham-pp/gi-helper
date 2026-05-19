"use client";

import Link from "next/link";
import { Sparkles, Target } from "lucide-react";

import { EmptyState } from "@/components/dashboard/common/empty-state";
import { GoalCard } from "@/components/dashboard/goals/goal-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import AppTextField from "@/components/core/app-textfield";
import type { GoalView } from "@/lib/types";

export function GoalsSection({
  categoryFilter,
  characterFilter,
  categories,
  characters,
  goals,
  search,
  statusFilter,
  setCategoryFilter,
  setCharacterFilter,
  setSearch,
  setStatusFilter,
}: {
  categoryFilter: string;
  characterFilter: string;
  categories: string[];
  characters: string[];
  goals: GoalView[];
  search: string;
  statusFilter: "incomplete" | "completed" | "all";
  setCategoryFilter: (category: string) => void;
  setCharacterFilter: (character: string) => void;
  setSearch: (search: string) => void;
  setStatusFilter: (status: "incomplete" | "completed" | "all") => void;
}) {
  return (
    <section className="space-y-6" aria-labelledby="goals-section-title">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2
            id="goals-section-title"
            className="text-on-surface text-2xl font-bold tracking-tight"
          >
            Farming Goals
          </h2>
          <p className="text-on-surface-variant mt-1">
            Track and manage your farming objectives.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={"/goal-templates" as any}>
            <Button variant="outlined" className="h-11 gap-2">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Templates
            </Button>
          </Link>
          <Link href={"/goals/new" as any}>
            <Button className="h-11 gap-2">
              <Target className="h-4 w-4" aria-hidden="true" />
              Custom Goal
            </Button>
          </Link>
        </div>
      </div>

      <Card variant="outlined" className="p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AppTextField
            label="Search Goals"
            variant="outlined"
            className="h-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name or description..."
          />
          <Select
            label="Status"
            variant="outlined"
            className="h-11"
            value={statusFilter}
            onChange={(value) =>
              setStatusFilter(value as "incomplete" | "completed" | "all")
            }
            options={[
              { label: "Incomplete", value: "incomplete" },
              { label: "Completed", value: "completed" },
              { label: "All", value: "all" },
            ]}
          />
          <Select
            label="Character"
            variant="outlined"
            className="h-11"
            value={characterFilter}
            onChange={setCharacterFilter}
            options={characters.map((character) => ({
              label: character,
              value: character,
            }))}
          />
          <Select
            label="Category"
            variant="outlined"
            className="h-11"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categories.map((category) => ({
              label: category.charAt(0).toUpperCase() + category.slice(1),
              value: category,
            }))}
          />
        </div>
      </Card>

      {goals.length === 0 ? (
        <Card variant="outlined" className="p-12">
          <EmptyState
            icon={<Target className="h-12 w-12" />}
            title="No Goals Found"
            description="Try adjusting your filters or search terms to find what you're looking for."
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </section>
  );
}
