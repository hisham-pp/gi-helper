"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckSquare, Square, Target } from "lucide-react";
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

export function CharacterGoalBuilder({ character }: { character: CharacterDetail }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());

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

  function toggleTemplate(templateId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(templateId)) {
        next.delete(templateId);
      } else {
        next.add(templateId);
      }
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(character.templates.map((template) => template.id)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function handleCreateGoals() {
    if (selected.size === 0) {
      toast.error("Select at least one template.");
      return;
    }

    startTransition(async () => {
      const result = await createGoalsFromTemplatesAction({
        type: "character",
        templateIds: [...selected],
      });

      if (!result.success) {
        toast.error(result.error ?? "Unable to create goals.");
        return;
      }

      toast.success(
        `Created ${selected.size} goal${selected.size === 1 ? "" : "s"} from templates.`,
      );
      router.push("/goals");
    });
  }

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
          <Button variant="text" onClick={clearSelection} disabled={isPending}>
            Clear
          </Button>
          <Button
            className="gap-2"
            disabled={isPending || selected.size === 0}
            onClick={handleCreateGoals}
          >
            <Target className="h-4 w-4" />
            {isPending
              ? "Creating..."
              : `Create ${selected.size || ""} goal${selected.size === 1 ? "" : "s"}`}
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
                    const isSelected = selected.has(template.id);

                    return (
                      <button
                        key={template.id}
                        type="button"
                        disabled={isPending}
                        onClick={() => toggleTemplate(template.id)}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors",
                          isSelected
                            ? "border-primary bg-primary-container/30"
                            : "border-outline-variant/50 hover:bg-surface-variant/40",
                        )}
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
                            <span className="text-on-surface-variant mt-0.5 block text-xs line-clamp-2">
                              {template.description}
                            </span>
                          ) : null}
                        </span>
                      </button>
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
