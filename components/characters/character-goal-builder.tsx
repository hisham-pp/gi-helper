"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckSquare,
  CircleCheck,
  Images,
  Info,
  ListChecks,
  Square,
  Target,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  createGoalsFromTemplatesAction,
  setOwnedCharacterAction,
} from "@/app/actions";
import { LoginRequiredDialog } from "@/components/auth/login-required-dialog";
import { rarityColorMap } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CharacterAssetsPanel } from "@/components/characters/character-assets-panel";
import { CharacterDetailsPanel } from "@/components/characters/character-details-panel";
import { CharacterDetailTabButton } from "@/components/characters/character-detail-tab-button";

export type CharacterTemplate = {
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

export type CharacterDetail = {
  id: string;
  name: string;
  image: string;
  rarity: number;
  element: string;
  weaponType: string;
  region: string;
  details?: CharacterDetails | null;
  assets?: CharacterAsset[] | null;
  templates: CharacterTemplate[];
};

export type CharacterDetails = {
  title?: string | null;
  gender?: string | null;
  affiliation?: string | null;
  specialDish?: string | null;
  release?: string | null;
  constellation?: string | null;
  birthday?: string | null;
  description?: string | null;
  skillTalents?: Array<{
    name?: string;
    unlock?: string;
    description?: string;
  }>;
  passiveTalents?: Array<{
    name?: string;
    unlock?: string;
    description?: string;
  }>;
  constellations?: Array<{
    name?: string;
    unlock?: string;
    description?: string;
    level?: number;
  }>;
  ascensionData?: Array<Record<string, string>>;
};

export type CharacterAsset = {
  key: string;
  label: string;
  path: string;
};

type TemplateGroup = {
  key: string;
  title: string;
  templates: CharacterTemplate[];
};

function isRepeatableTalentTemplate(template: CharacterTemplate) {
  return (
    template.category === "talent" &&
    template.sortOrder <= 9 &&
    template.name.startsWith("Talent Level ")
  );
}

function isSingleTalentTemplate(template: CharacterTemplate) {
  return (
    template.category === "talent" &&
    !template.name.startsWith("All Talents Level ")
  );
}

export function CharacterGoalBuilder({
  character,
  isAuthenticated = true,
  isOwned = false,
}: {
  character: CharacterDetail;
  isAuthenticated?: boolean;
  isOwned?: boolean;
}) {
  const router = useRouter();
  const isTraveler = character.id.startsWith("traveler-");
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Map<string, number>>(new Map());
  const [activeTab, setActiveTab] = useState<
    "details" | "templates" | "assets"
  >("details");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [owned, setOwned] = useState(isOwned);

  const groupedTemplates = useMemo<TemplateGroup[]>(() => {
    const groups = new Map<string, CharacterTemplate[]>();

    for (const template of character.templates) {
      const list = groups.get(template.category) ?? [];
      list.push(template);
      groups.set(template.category, list);
    }

    for (const list of groups.values()) {
      list.sort((a, b) => a.sortOrder - b.sortOrder);
    }

    return [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .flatMap(([category, templates]) => {
        if (category !== "talent") {
          return [
            {
              key: category,
              title: category,
              templates,
            },
          ];
        }

        const singleTalentTemplates = templates.filter(isSingleTalentTemplate);
        const multipleTalentTemplates = templates.filter(
          (template) => !isSingleTalentTemplate(template),
        );
        const talentGroups: TemplateGroup[] = [];

        if (singleTalentTemplates.length > 0) {
          talentGroups.push({
            key: "talent-single",
            title: "Single Talent",
            templates: singleTalentTemplates,
          });
        }

        if (multipleTalentTemplates.length > 0) {
          talentGroups.push({
            key: "talent-multiple",
            title: "All Talents",
            templates: multipleTalentTemplates,
          });
        }

        return talentGroups;
      });
  }, [character.templates]);

  const selectedGoalCount = useMemo(
    () => [...selected.values()].reduce((sum, count) => sum + count, 0),
    [selected],
  );

  function toggleTemplate(template: CharacterTemplate) {
    setSelected((prev) => {
      const next = new Map(prev);
      const current = next.get(template.id) ?? 0;

      if (isRepeatableTalentTemplate(template)) {
        if (current >= 3) {
          next.delete(template.id);
        } else {
          next.set(template.id, current + 1);
        }
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
    if (isTraveler) {
      return;
    }

    setSelected((prev) => {
      const next = new Map(prev);

      for (const template of character.templates) {
        if (isSingleTalentTemplate(template)) {
          next.set(template.id, isRepeatableTalentTemplate(template) ? 3 : 1);
        }
      }

      return next;
    });
  }

  function clearSelection() {
    setSelected(new Map());
  }

  function handleCreateGoals() {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

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

  function handleToggleOwned() {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    const nextOwned = !owned;
    setOwned(nextOwned);

    startTransition(async () => {
      const result = await setOwnedCharacterAction({
        characterId: character.id,
        owned: nextOwned,
      });

      if (!result.success) {
        setOwned(!nextOwned);
        toast.error(result.error ?? "Unable to save ownership.");
        return;
      }

      toast.success(
        nextOwned
          ? `${character.name} marked as owned.`
          : `${character.name} removed from owned.`,
      );
    });
  }

  const hasSingleTalentTemplates = character.templates.some(
    isSingleTalentTemplate,
  );
  const hasRepeatableTalentTemplates = character.templates.some(
    isRepeatableTalentTemplate,
  );
  const details = character.details;
  const assets = character.assets ?? [];

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
            unoptimized
            className="object-cover"
            sizes="56px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-on-surface text-3xl font-bold tracking-tight">
            {character.name}
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            {[
              details?.title,
              character.element,
              character.weaponType,
              character.region,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={owned ? "tonal" : "outlined"}
            className="gap-2"
            onClick={handleToggleOwned}
            disabled={isPending}
            aria-pressed={owned}
          >
            <CircleCheck className="h-4 w-4" />
            {owned ? "Owned" : "Mark owned"}
          </Button>
          <Button variant="outlined" onClick={selectAll} disabled={isPending}>
            Select all
          </Button>
          {hasSingleTalentTemplates ? (
            <Button
              variant="outlined"
              onClick={selectAllSingleTalents}
              disabled={
                isPending || isTraveler || !hasRepeatableTalentTemplates
              }
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

      <div className="flex flex-wrap gap-2 border-b border-outline-variant">
        <CharacterDetailTabButton
          active={activeTab === "details"}
          icon={<Info className="h-4 w-4" />}
          onClick={() => setActiveTab("details")}
        >
          Details
        </CharacterDetailTabButton>
        <CharacterDetailTabButton
          active={activeTab === "templates"}
          icon={<ListChecks className="h-4 w-4" />}
          onClick={() => setActiveTab("templates")}
        >
          Templates
        </CharacterDetailTabButton>
        <CharacterDetailTabButton
          active={activeTab === "assets"}
          icon={<Images className="h-4 w-4" />}
          onClick={() => setActiveTab("assets")}
        >
          Assets
        </CharacterDetailTabButton>
      </div>

      {activeTab === "details" ? (
        <CharacterDetailsPanel character={character} details={details} />
      ) : null}

      {activeTab === "templates" ? (
        <Card variant="outlined" className="p-4 sm:p-6">
          <p className="text-on-surface-variant mb-4 text-sm">
            Select one or more goal templates to add separate farming goals.
            Each template becomes its own goal with materials pre-filled.
          </p>

          {groupedTemplates.length === 0 ? (
            <p className="text-on-surface-variant text-sm italic">
              No goal templates are available for this character yet.
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
                              {template.materials?.length ? (
                                <span className="text-on-surface-variant mt-2 block text-xs">
                                  {template.materials.length} material
                                  {template.materials.length === 1 ? "" : "s"}
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
      ) : null}

      {activeTab === "assets" ? (
        <CharacterAssetsPanel assets={assets} />
      ) : null}
      <LoginRequiredDialog
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />
    </div>
  );
}
