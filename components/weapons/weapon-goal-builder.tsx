"use client";

import type { Route } from "next";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckSquare,
  ListChecks,
  Minus,
  Plus,
  Square,
  Target,
} from "lucide-react";
import { toast } from "sonner";

import { createGoalsFromTemplatesAction } from "@/app/actions";
import { LoginRequiredDialog } from "@/components/auth/login-required-dialog";
import { rarityColorMap } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CachedImage } from "@/components/ui/cached-image";

export type WeaponTemplate = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  sortOrder: number;
  materials?: Array<{
    id: string;
    required: number;
    material: {
      id: string;
      name: string;
      rarity: number;
      image: string;
    };
  }>;
};

export type WeaponDetail = {
  id: string;
  name: string;
  image: string;
  rarity: number;
  weaponType: string;
  baseAttack?: number;
  subStat?: string;
  subStatValue?: number;
  description?: string;
  templates: WeaponTemplate[];
};

type TemplateGroup = {
  key: string;
  title: string;
  templates: WeaponTemplate[];
};

export function WeaponGoalBuilder({
  weapon,
  isAuthenticated = true,
}: {
  weapon: WeaponDetail;
  isAuthenticated?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Map<string, number>>(new Map());
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const totalGoalCount = useMemo(
    () => [...selected.values()].reduce((sum, count) => sum + count, 0),
    [selected],
  );

  const groupedTemplates = useMemo<TemplateGroup[]>(() => {
    const groups = new Map<string, WeaponTemplate[]>();

    for (const template of weapon.templates) {
      const list = groups.get(template.category) ?? [];
      list.push(template);
      groups.set(template.category, list);
    }

    for (const list of groups.values()) {
      list.sort((a, b) => a.sortOrder - b.sortOrder);
    }

    return [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, templates]) => ({
        key: category,
        title: category,
        templates,
      }));
  }, [weapon.templates]);

  function setCount(templateId: string, count: number) {
    setSelected((prev) => {
      const next = new Map(prev);
      if (count <= 0) {
        next.delete(templateId);
      } else {
        next.set(templateId, count);
      }
      return next;
    });
  }

  function toggleTemplate(templateId: string) {
    setCount(templateId, selected.has(templateId) ? 0 : 1);
  }

  function selectAll() {
    setSelected(
      new Map(weapon.templates.map((template) => [template.id, 1])),
    );
  }

  function clearSelection() {
    setSelected(new Map());
  }

  function handleCreateGoals() {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    if (totalGoalCount === 0) {
      toast.error("Select at least one template.");
      return;
    }

    const templateIds = [...selected.entries()].flatMap(([templateId, count]) =>
      Array.from({ length: count }, () => templateId),
    );

    startTransition(async () => {
      const result = await createGoalsFromTemplatesAction({
        type: "weapon",
        templateIds,
      });

      if (!result.success) {
        toast.error(result.error ?? "Unable to create goals.");
        return;
      }

      toast.success(
        `Created ${templateIds.length} goal${templateIds.length === 1 ? "" : "s"} from templates.`,
      );
      router.push("/goals");
    });
  }

  const subStatLabel =
    weapon.subStat && weapon.subStatValue
      ? `${weapon.subStat} ${weapon.subStatValue}`
      : weapon.subStat;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start gap-4">
        <Link href={"/weapons" as Route}>
          <Button variant="text" className="h-10 w-10 p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div
          className={cn(
            "relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br",
            rarityColorMap[weapon.rarity] ?? rarityColorMap[1],
          )}
        >
          <CachedImage
            src={weapon.image}
            alt={weapon.name}
            fill
            unoptimized
            className="object-cover"
            sizes="56px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-on-surface text-3xl font-bold tracking-tight">
            {weapon.name}
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            {[
              `${weapon.rarity}★`,
              weapon.weaponType,
              weapon.baseAttack ? `ATK ${weapon.baseAttack}` : null,
              subStatLabel,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outlined" onClick={selectAll} disabled={isPending}>
            Select all
          </Button>
          <Button variant="text" onClick={clearSelection} disabled={isPending}>
            Clear
          </Button>
          <Button
            className="gap-2"
            disabled={isPending || totalGoalCount === 0}
            onClick={handleCreateGoals}
          >
            <Target className="h-4 w-4" />
            {isPending
              ? "Creating..."
              : `Create ${totalGoalCount || ""} goal${totalGoalCount === 1 ? "" : "s"}`}
          </Button>
        </div>
      </div>

      {weapon.description ? (
        <p className="text-on-surface-variant max-w-3xl text-sm leading-6">
          {weapon.description}
        </p>
      ) : null}

      <Card variant="outlined" className="p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <ListChecks className="text-on-surface-variant h-4 w-4" />
          <p className="text-on-surface-variant text-sm">
            Select one or more ascension templates to add separate farming
            goals. Own this weapon more than once? Use the +/− controls to add
            multiple copies of a goal — the shopping list adds up materials
            across every copy.
          </p>
        </div>

        {groupedTemplates.length === 0 ? (
          <p className="text-on-surface-variant text-sm italic">
            No goal templates are available for this weapon yet.
          </p>
        ) : (
          <div className="space-y-6">
            {groupedTemplates.map((group) => (
              <section key={group.key}>
                <h2 className="text-on-surface-variant mb-3 text-xs font-bold uppercase tracking-wider">
                  {group.title}
                </h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {group.templates.map((template) => {
                    const count = selected.get(template.id) ?? 0;
                    const isSelected = count > 0;

                    return (
                      <div
                        key={template.id}
                        className={cn(
                          "flex w-full select-none items-start gap-2 rounded-xl border p-3 transition-colors",
                          isSelected
                            ? "border-primary bg-primary-container/30"
                            : "border-outline-variant/50 hover:bg-surface-variant/40",
                        )}
                      >
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => toggleTemplate(template.id)}
                          className="flex min-w-0 flex-1 select-none items-start gap-3 text-left"
                        >
                          {isSelected ? (
                            <CheckSquare className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                          ) : (
                            <Square className="text-on-surface-variant mt-0.5 h-4 w-4 flex-shrink-0" />
                          )}
                          <span className="min-w-0">
                            <span className="text-on-surface block text-sm font-medium">
                              {template.name}
                            </span>
                            {template.description ? (
                              <span className="text-on-surface-variant mt-0.5 line-clamp-2 block text-xs">
                                {template.description}
                              </span>
                            ) : null}
                            {template.materials?.length ? (
                              <span className="text-on-surface-variant mt-2 block text-xs">
                                {template.materials.length} material
                                {template.materials.length === 1 ? "" : "s"}
                              </span>
                            ) : null}
                          </span>
                        </button>
                        {isSelected ? (
                          <div className="flex flex-shrink-0 items-center gap-1">
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => setCount(template.id, count - 1)}
                              aria-label={`Remove a copy of ${template.name}`}
                              className="text-on-surface-variant hover:text-on-surface inline-flex h-6 w-6 items-center justify-center rounded-full border border-outline-variant transition-colors hover:bg-surface-variant disabled:opacity-50"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="text-on-primary inline-flex h-6 min-w-7 items-center justify-center rounded-full bg-primary px-2 text-xs font-bold">
                              x{count}
                            </span>
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => setCount(template.id, count + 1)}
                              aria-label={`Add a copy of ${template.name}`}
                              className="text-on-surface-variant hover:text-on-surface inline-flex h-6 w-6 items-center justify-center rounded-full border border-outline-variant transition-colors hover:bg-surface-variant disabled:opacity-50"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </Card>

      <LoginRequiredDialog
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />
    </div>
  );
}
