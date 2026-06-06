"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  Gem,
  ArrowRight,
  Target,
  CookingPot,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import AppTextField from "@/components/core/app-textfield";
import { Card } from "@/components/ui/card";
import { rarityColorMap, rarityBorderMap } from "@/lib/constants";
import type { CookingRecipeView } from "@/lib/cooking-data";
import type { GoalView, MaterialView } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";

type SearchCharacter = {
  id: string;
  name: string;
  image: string;
  rarity: number;
  element: string;
  weaponType: string;
};

type SearchLists = {
  characters: SearchCharacter[];
  goals: GoalView[];
  materials: MaterialView[];
  recipes: CookingRecipeView[];
};

type SearchListsResponse = {
  lists?: Partial<SearchLists>;
};

const emptyLists: SearchLists = {
  characters: [],
  goals: [],
  materials: [],
  recipes: [],
};

export function SearchManager() {
  const [search, setSearch] = useState("");
  const [lists, setLists] = useState<SearchLists>(emptyLists);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const query = search.trim().toLowerCase();
  const { characters, goals, materials, recipes } = lists;

  useEffect(() => {
    const controller = new AbortController();

    async function loadSearchLists() {
      try {
        const response = await fetch("/api/search", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Search lists request failed.");
        }

        const payload = (await response.json()) as SearchListsResponse;

        setLists({
          characters: payload.lists?.characters ?? [],
          goals: payload.lists?.goals ?? [],
          materials: payload.lists?.materials ?? [],
          recipes: payload.lists?.recipes ?? [],
        });
        setError(null);
      } catch (requestError) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Search lists load failed", requestError);
        setError("Search data could not be loaded.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadSearchLists();

    return () => {
      controller.abort();
    };
  }, []);

  const filteredCharacters = useMemo(() => {
    if (!query) return [];
    return characters.filter((c) => c.name.toLowerCase().includes(query));
  }, [characters, query]);

  const filteredMaterials = useMemo(() => {
    if (!query) return [];
    return materials.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.category.toLowerCase().includes(query),
    );
  }, [materials, query]);

  const filteredGoals = useMemo(() => {
    if (!query) return [];
    return goals.filter((goal) => {
      return [
        goal.name,
        goal.description,
        goal.characterName,
        goal.category,
        ...goal.materials.map((material) => material.materialName),
      ]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [goals, query]);

  const filteredRecipes = useMemo(() => {
    if (!query) return [];
    return recipes.filter((recipe) => {
      return [
        recipe.name,
        recipe.type,
        recipe.effect,
        recipe.description,
        ...recipe.ingredients.map((ingredient) => ingredient.name),
      ]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [query, recipes]);

  const hasResults =
    filteredCharacters.length > 0 ||
    filteredMaterials.length > 0 ||
    filteredGoals.length > 0 ||
    filteredRecipes.length > 0;

  return (
    <div className="space-y-8">
      <div className="max-w-xl">
        <AppTextField
          label="Search anything..."
          variant="outlined"
          className="h-14 text-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading && (
        <Card variant="outlined" className="p-6">
          <p className="text-on-surface text-sm font-bold">
            Loading search lists...
          </p>
          <p className="text-on-surface-variant mt-1 text-sm">
            Characters, materials, goals, and recipes are being fetched.
          </p>
        </Card>
      )}

      {!isLoading && error && (
        <Card variant="outlined" className="p-6">
          <p className="text-sm font-bold text-error">Unable to load search</p>
          <p className="text-on-surface-variant mt-1 text-sm">{error}</p>
        </Card>
      )}

      {!isLoading && !error && !search && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card variant="outlined" className="p-6">
            <h2 className="text-on-surface flex items-center gap-2 font-bold">
              <Users className="h-5 w-5 text-primary" />
              Recent Characters
            </h2>
            <div className="mt-4 space-y-2">
              {characters.slice(0, 5).map((c) => (
                <Link
                  key={c.id}
                  href={`/characters/${c.id}`}
                  className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-surface-variant/50"
                >
                  <span className="text-sm">{c.name}</span>
                  <ArrowRight className="h-4 w-4 opacity-50" />
                </Link>
              ))}
            </div>
          </Card>
          <Card variant="outlined" className="p-6">
            <h2 className="text-on-surface flex items-center gap-2 font-bold">
              <Target className="h-5 w-5 text-primary" />
              Recent Goals
            </h2>
            <div className="mt-4 space-y-2">
              {goals.slice(0, 5).map((goal) => (
                <Link
                  key={goal.id}
                  href={`/goals/${goal.id}`}
                  className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-surface-variant/50"
                >
                  <span className="truncate text-sm">{goal.name}</span>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 opacity-50" />
                </Link>
              ))}
            </div>
          </Card>
          <Card variant="outlined" className="p-6">
            <h2 className="text-on-surface flex items-center gap-2 font-bold">
              <Gem className="h-5 w-5 text-primary" />
              Common Materials
            </h2>
            <div className="mt-4 space-y-2">
              {materials.slice(0, 5).map((m) => (
                <Link
                  key={m.id}
                  href={`/materials/${m.id}`}
                  className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-surface-variant/50"
                >
                  <span className="text-sm">{m.name}</span>
                  <ArrowRight className="h-4 w-4 opacity-50" />
                </Link>
              ))}
            </div>
          </Card>
          <Card variant="outlined" className="p-6">
            <h2 className="text-on-surface flex items-center gap-2 font-bold">
              <CookingPot className="h-5 w-5 text-primary" />
              Recipes
            </h2>
            <div className="mt-4 space-y-2">
              {recipes.slice(0, 5).map((recipe) => (
                <Link
                  key={recipe.id}
                  href="/cooking"
                  className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-surface-variant/50"
                >
                  <span className="truncate text-sm">{recipe.name}</span>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 opacity-50" />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      )}

      {!isLoading && !error && search && !hasResults && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-on-primary-container mb-4 rounded-full bg-primary-container p-4 shadow-sm">
            <Search className="h-8 w-8" />
          </div>
          <h3 className="text-on-surface font-bold">No results found</h3>
          <p className="text-on-surface-variant mt-2 max-w-sm text-sm">
            We couldn&apos;t find anything matching &quot;{search}&quot;.
          </p>
        </div>
      )}

      {!isLoading && !error && search && hasResults && (
        <div className="space-y-12">
          {filteredCharacters.length > 0 && (
            <section>
              <h2 className="text-on-surface mb-6 flex items-center gap-2 text-xl font-bold">
                <Users className="h-6 w-6 text-primary" />
                Characters ({filteredCharacters.length})
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCharacters.map((character) => (
                  <Card key={character.id} variant="outlined" className="p-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br",
                          rarityColorMap[character.rarity] ?? rarityColorMap[1],
                        )}
                      >
                        <Image
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
                        <Link
                          href={`/characters/${character.id}`}
                          className="mt-1 inline-block text-xs font-bold text-primary hover:underline"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {filteredMaterials.length > 0 && (
            <section>
              <h2 className="text-on-surface mb-6 flex items-center gap-2 text-xl font-bold">
                <Gem className="h-6 w-6 text-primary" />
                Materials ({filteredMaterials.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {filteredMaterials.map((material) => (
                  <Card
                    key={material.id}
                    variant="outlined"
                    className={cn(
                      "p-4 transition-all hover:shadow-md",
                      rarityBorderMap[material.rarity] ?? rarityBorderMap[1],
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br",
                          rarityColorMap[material.rarity] ?? rarityColorMap[1],
                        )}
                      >
                        <Image
                          src={`/api/material-image/${material.id}`}
                          alt={material.name}
                          fill
                          className="object-contain p-1"
                          sizes="48px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-on-surface truncate text-sm font-bold">
                          {material.name}
                        </h3>
                        <p className="text-on-surface-variant truncate text-[10px]">
                          {material.category}
                        </p>
                        <Link
                          href={`/materials/${material.id}`}
                          className="mt-1 inline-block text-xs font-bold text-primary hover:underline"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {filteredGoals.length > 0 && (
            <section>
              <h2 className="text-on-surface mb-6 flex items-center gap-2 text-xl font-bold">
                <Target className="h-6 w-6 text-primary" />
                Goals ({filteredGoals.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredGoals.map((goal) => (
                  <Card key={goal.id} variant="outlined" className="p-5">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-on-surface truncate text-sm font-bold">
                            {goal.name}
                          </h3>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {goal.characterName ? (
                              <span className="rounded-full bg-secondary-container px-2 py-0.5 text-[10px] font-bold text-secondary-on-container">
                                {goal.characterName}
                              </span>
                            ) : null}
                            {goal.category ? (
                              <span className="text-on-surface-variant rounded-full border border-outline-variant bg-surface-variant px-2 py-0.5 text-[10px] font-bold capitalize">
                                {goal.category}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <span className="flex-shrink-0 text-xs font-bold text-primary">
                          {goal.completed ? "Done" : `${goal.progressPercent}%`}
                        </span>
                      </div>
                      <p className="text-on-surface-variant line-clamp-2 text-xs">
                        {goal.description ?? "Custom farming plan"}
                      </p>
                      <div className="text-on-surface-variant flex items-center justify-between text-xs">
                        <span>
                          {goal.materials.length} material
                          {goal.materials.length === 1 ? "" : "s"}
                        </span>
                        <span>{formatNumber(goal.totalRequired)} needed</span>
                      </div>
                      <Link
                        href={`/goals/${goal.id}`}
                        className="inline-block text-xs font-bold text-primary hover:underline"
                      >
                        View Details
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {filteredRecipes.length > 0 && (
            <section>
              <h2 className="text-on-surface mb-6 flex items-center gap-2 text-xl font-bold">
                <CookingPot className="h-6 w-6 text-primary" />
                Recipes ({filteredRecipes.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredRecipes.map((recipe) => (
                  <Card
                    key={recipe.id}
                    variant="outlined"
                    className={cn(
                      "p-4 transition-all hover:shadow-md",
                      rarityBorderMap[recipe.rarity] ?? rarityBorderMap[1],
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br",
                          rarityColorMap[recipe.rarity] ?? rarityColorMap[1],
                        )}
                      >
                        <Image
                          src={`/api/recipe-image/${recipe.id}`}
                          alt={recipe.name}
                          fill
                          className="object-contain p-1"
                          sizes="48px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="text-on-surface truncate text-sm font-bold">
                              {recipe.name}
                            </h3>
                            <p className="text-on-surface-variant truncate text-[10px]">
                              {recipe.type}
                            </p>
                          </div>
                          <span className="flex-shrink-0 text-[10px] font-bold text-primary">
                            {recipe.achievedAuto
                              ? "Auto"
                              : `${formatNumber(recipe.completedCount)} / ${formatNumber(recipe.proficiency)}`}
                          </span>
                        </div>
                        <p className="text-on-surface-variant mt-2 line-clamp-2 text-xs">
                          {recipe.effect || recipe.description}
                        </p>
                        <Link
                          href="/cooking"
                          className="mt-2 inline-block text-xs font-bold text-primary hover:underline"
                        >
                          View Recipes
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
