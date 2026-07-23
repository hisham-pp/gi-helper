"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import { Sparkles, Swords, ChevronRight } from "lucide-react";

import { createGoalFromTemplateAction } from "@/app/actions";
import { LoginRequiredDialog } from "@/components/auth/login-required-dialog";
import { rarityColorMap } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CachedImage } from "@/components/ui/cached-image";
import { useStaticCharacters, useStaticWeapons } from "@/lib/cached-data";

type Character = {
  id: string;
  name: string;
  image: string;
  rarity: number;
  element: string;
  weaponType: string;
  templates: Array<{
    id: string;
    name: string;
    description: string | null;
    category: string;
    sortOrder: number;
  }>;
};

type Weapon = {
  id: string;
  name: string;
  image: string;
  rarity: number;
  weaponType: string;
  templates: Array<{
    id: string;
    name: string;
    description: string | null;
    category: string;
    sortOrder: number;
  }>;
};

type GoalTemplatesProps = {
  isAuthenticated?: boolean;
};

export function GoalTemplates({ isAuthenticated = true }: GoalTemplatesProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedTab, setSelectedTab] = useState<"characters" | "weapons">(
    "characters",
  );
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const { data: charactersData, isLoading: charactersLoading } =
    useStaticCharacters();
  const { data: weaponsData, isLoading: weaponsLoading } = useStaticWeapons();

  const characters = charactersData?.characters ?? [];
  const weapons = weaponsData?.weapons ?? [];

  function handleCreateFromTemplate(
    type: "character" | "weapon",
    templateId: string,
  ) {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    startTransition(async () => {
      const result = await createGoalFromTemplateAction({
        type,
        templateId,
      });

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Unable to create goal from template.");
        return;
      }

      toast.success("Goal created from template.");
      router.push("/goals");
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-outline-variant">
        <button
          onClick={() => setSelectedTab("characters")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
            selectedTab === "characters"
              ? "border-b-2 border-primary text-primary"
              : "text-on-surface-variant hover:text-on-surface",
          )}
        >
          <Sparkles className="h-4 w-4" />
          Characters
        </button>
        <button
          onClick={() => setSelectedTab("weapons")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
            selectedTab === "weapons"
              ? "border-b-2 border-primary text-primary"
              : "text-on-surface-variant hover:text-on-surface",
          )}
        >
          <Swords className="h-4 w-4" />
          Weapons
        </button>
      </div>

      {selectedTab === "characters" && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {charactersLoading ? (
            <div className="text-on-surface-variant col-span-full py-12 text-center">
              Loading characters...
            </div>
          ) : (
            characters.map((character) => (
              <Card key={character.id} variant="outlined" className="p-6">
                <div className="mb-4 flex items-center gap-4">
                  <div
                    className={cn(
                      "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br",
                      rarityColorMap[character.rarity] ?? rarityColorMap[1],
                    )}
                  >
                    <CachedImage
                      src={character.image}
                      alt={character.name}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div>
                    <h3 className="text-on-surface font-bold">
                      {character.name}
                    </h3>
                    <p className="text-on-surface-variant text-xs">
                      {character.element} • {character.weaponType}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {character.templates
                    .sort((a, b) => {
                      if (a.category !== b.category) {
                        return a.category.localeCompare(b.category);
                      }
                      return a.sortOrder - b.sortOrder;
                    })
                    .map((template) => (
                      <button
                        key={template.id}
                        onClick={() =>
                          handleCreateFromTemplate("character", template.id)
                        }
                        disabled={isPending}
                        className="text-on-surface-variant flex w-full items-center justify-between rounded-lg p-3 text-left text-sm transition-colors hover:bg-surface-variant/50"
                      >
                        <div>
                          <p className="text-on-surface font-medium">
                            {template.name}
                          </p>
                          {template.description && (
                            <p className="text-on-surface-variant text-xs">
                              {template.description}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="text-on-surface-variant h-4 w-4 flex-shrink-0" />
                      </button>
                    ))}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {selectedTab === "weapons" && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {weaponsLoading ? (
            <div className="text-on-surface-variant col-span-full py-12 text-center">
              Loading weapons...
            </div>
          ) : (
            weapons.map((weapon) => (
              <Card key={weapon.id} variant="outlined" className="p-6">
                <div className="mb-4 flex items-center gap-4">
                  <div
                    className={cn(
                      "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br",
                      rarityColorMap[weapon.rarity] ?? rarityColorMap[1],
                    )}
                  >
                    <CachedImage
                      src={weapon.image}
                      alt={weapon.name}
                      fill
                      className="object-contain p-2"
                      sizes="64px"
                    />
                  </div>
                  <div>
                    <h3 className="text-on-surface font-bold">{weapon.name}</h3>
                    <p className="text-on-surface-variant text-xs">
                      {weapon.weaponType}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {weapon.templates
                    .sort((a, b) => {
                      if (a.category !== b.category) {
                        return a.category.localeCompare(b.category);
                      }
                      return a.sortOrder - b.sortOrder;
                    })
                    .map((template) => (
                      <button
                        key={template.id}
                        onClick={() =>
                          handleCreateFromTemplate("weapon", template.id)
                        }
                        disabled={isPending}
                        className="text-on-surface-variant flex w-full items-center justify-between rounded-lg p-3 text-left text-sm transition-colors hover:bg-surface-variant/50"
                      >
                        <div>
                          <p className="text-on-surface font-medium">
                            {template.name}
                          </p>
                          {template.description && (
                            <p className="text-on-surface-variant text-xs">
                              {template.description}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="text-on-surface-variant h-4 w-4 flex-shrink-0" />
                      </button>
                    ))}
                </div>
              </Card>
            ))
          )}
        </div>
      )}
      <LoginRequiredDialog
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />
    </div>
  );
}
