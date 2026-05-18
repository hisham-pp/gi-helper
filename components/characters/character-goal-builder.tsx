"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckSquare, Square, Target, X } from "lucide-react";
import { toast } from "sonner";

import { createGoalsFromTemplatesAction } from "@/app/actions";
import { rarityColorMap } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type CharacterTemplate = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  sortOrder: number;
};

export type CharacterDetail = {
  id: string;
  name: string;
  image: string;
  rarity: number;
  element: string;
  weaponType: string;
  region: string;
  templates: CharacterTemplate[];
};

export function CharacterGoalBuilder({
  character,
}: {
  character: CharacterDetail;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Map<string, number>>(new Map());

  const groupedTemplates = useMemo(() => {
    const groups = new Map<string, CharacterTemplate[]>();

    for (const template of character.templates) {
      const list = groups.get(template.category) ?? [];
      list.push(template);
      groups.set(template.category, list);
    }

    for (const list of groups.values()) {
      list.sort((a, b) => a.sortOrder - b.sortOrder);
    }

    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [character.templates]);

  const selectedGoalCount = useMemo(
    () => [...selected.values()].reduce((sum, count) => sum + count, 0),
    [selected],
  );

  function isRepeatableTalentTemplate(template: CharacterTemplate) {
    return (
      template.category === "talent" && !template.name.startsWith("All Talents")
    );
  }

  function toggleTemplate(template: CharacterTemplate) {
    setSelected((prev) => {
      const next = new Map(prev);
      const current = next.get(template.id) ?? 0;

      if (isRepeatableTalentTemplate(template)) {
        next.set(template.id, Math.min(current + 1, 3));
        return next;
      }

      if (current > 0) {
        next.delete(template.id);
      } else {
        next.set(template.id, 1);
      }
      return next;
    });
  }

  function clearTemplate(templateId: string) {
    setSelected((prev) => {
      const next = new Map(prev);
      next.delete(templateId);
      return next;
    });
  }

  function selectAll() {
    setSelected(
      new Map(character.templates.map((template) => [template.id, 1])),
    );
  }

  function selectAllSingleTalents() {
    setSelected((prev) => {
      const next = new Map(prev);

      for (const template of character.templates) {
        if (isRepeatableTalentTemplate(template)) {
          next.set(template.id, 3);
        }
      }

      return next;
    });
  }

  function clearSelection() {
    setSelected(new Map());
  }

  function handleCreateGoals() {
    if (selectedGoalCount === 0) {
      toast.error("Select at least one template.");
      return;
    }

    const templateIds = [...selected.entries()].flatMap(([templateId, count]) =>
      Array.from({ length: count }, () => templateId),
    );

    startTransition(async () => {
      const result = await createGoalsFromTemplatesAction({
        type: "character",
        templateIds,
      });

      if (!result.success) {
        toast.error(result.error ?? "Unable to create goals.");
        return;
      }

      toast.success(
        `Created ${selectedGoalCount} goal${selectedGoalCount === 1 ? "" : "s"} from templates.`,
      );
      router.push("/goals");
    });
  }

  const hasSingleTalentTemplates = character.templates.some(
    isRepeatableTalentTemplate,
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start gap-4">
        <Link href="/characters">
          <Button variant="text" className="h-10 w-10 p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div
          className={cn(
            "relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br",
            rarityColorMap[character.rarity] ?? rarityColorMap[1],
          )}
        >
          <Image
            src={character.image}
            alt={character.name}
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-on-surface text-3xl font-bold tracking-tight">
            {character.name}
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            {character.element} · {character.weaponType} · {character.region}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outlined" onClick={selectAll} disabled={isPending}>
            Select all
          </Button>
          {hasSingleTalentTemplates ? (
            <Button
              variant="outlined"
              onClick={selectAllSingleTalents}
              disabled={isPending}
            >
              Select 3x single talents
            </Button>
          ) : null}
          <Button variant="text" onClick={clearSelection} disabled={isPending}>
            Clear
          </Button>
          <Button
            className="gap-2"
            disabled={isPending || selectedGoalCount === 0}
            onClick={handleCreateGoals}
          >
            <Target className="h-4 w-4" />
            {isPending
              ? "Creating..."
              : `Create ${selectedGoalCount || ""} goal${selectedGoalCount === 1 ? "" : "s"}`}
          </Button>
        </div>
      </div>

      <Card variant="outlined" className="p-4 sm:p-6">
        <p className="text-on-surface-variant mb-4 text-sm">
          Select one or more goal templates to add separate farming goals. Each
          template becomes its own goal with materials pre-filled.
        </p>

        {groupedTemplates.length === 0 ? (
          <p className="text-on-surface-variant text-sm italic">
            No goal templates are available for this character yet.
          </p>
        ) : (
          <div className="space-y-6">
            {groupedTemplates.map(([category, templates]) => (
              <section key={category}>
                <h2 className="text-on-surface-variant mb-3 text-xs font-bold uppercase tracking-wider">
                  {category}
                </h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {templates.map((template) => {
                    const selectedCount = selected.get(template.id) ?? 0;
                    const isSelected = selectedCount > 0;
                    const isRepeatable = isRepeatableTalentTemplate(template);

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
                          onClick={() => toggleTemplate(template)}
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
                          </span>
                        </button>
                        {isRepeatable && isSelected ? (
                          <div className="flex flex-shrink-0 items-center gap-1">
                            <span className="text-on-primary inline-flex h-6 min-w-7 items-center justify-center rounded-full bg-primary px-2 text-xs font-bold">
                              x{selectedCount}
                            </span>
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => clearTemplate(template.id)}
                              aria-label={`Clear ${template.name}`}
                              className="text-on-surface-variant hover:text-on-surface inline-flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-surface-variant"
                            >
                              <X className="h-3.5 w-3.5" />
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
    </div>
  );
}
