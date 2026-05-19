"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import {
  Check,
  Flame,
  PackageSearch,
  Save,
  Search,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import {
  cookRecipeAction,
  saveCookingInventoryAction,
  saveCookingProgressAction,
} from "@/app/actions";
import AppTextField from "@/components/core/app-textfield";
import { EmptyState } from "@/components/dashboard/common/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { rarityBorderMap, rarityColorMap } from "@/lib/constants";
import type { CookingData, CookingRecipeView } from "@/lib/cooking-data";
import { cn, formatNumber } from "@/lib/utils";

type CookingTab = "needed" | "inventory" | "recipes";
type QuantityDraft = Record<string, number>;

export function CookingPage({ initialData }: { initialData: CookingData }) {
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState<CookingTab>("needed");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [inventoryDraft, setInventoryDraft] = useState<QuantityDraft>(
    buildInventoryDraft(initialData),
  );
  const [progressDraft, setProgressDraft] = useState<QuantityDraft>(
    buildProgressDraft(initialData),
  );
  const [, startTransition] = useTransition();

  const syncCooking = (nextData: CookingData) => {
    setData(nextData);
    setInventoryDraft(buildInventoryDraft(nextData));
    setProgressDraft(buildProgressDraft(nextData));
  };

  const recipeTypes = useMemo(() => {
    return [
      "All",
      ...Array.from(new Set(data.recipes.map((recipe) => recipe.type))).sort(),
    ];
  }, [data.recipes]);

  const filteredRecipes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return data.recipes.filter((recipe) => {
      if (typeFilter !== "All" && recipe.type !== typeFilter) {
        return false;
      }

      if (statusFilter === "Auto unlocked" && !recipe.achievedAuto) {
        return false;
      }

      if (statusFilter === "Needs cooking" && recipe.achievedAuto) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        recipe.name.toLowerCase().includes(query) ||
        recipe.type.toLowerCase().includes(query) ||
        recipe.effect.toLowerCase().includes(query)
      );
    });
  }, [data.recipes, search, statusFilter, typeFilter]);

  const filteredIngredients = useMemo(() => {
    const query = search.trim().toLowerCase();

    return data.ingredients.filter((ingredient) => {
      return (
        !query ||
        ingredient.name.toLowerCase().includes(query) ||
        ingredient.description.toLowerCase().includes(query)
      );
    });
  }, [data.ingredients, search]);

  function handleInventorySave(materialId: string) {
    const nextQuantity = Math.max(0, Number(inventoryDraft[materialId] ?? 0));

    startTransition(async () => {
      const result = await saveCookingInventoryAction({
        materialId,
        quantity: nextQuantity,
      });

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Unable to save inventory.");
        return;
      }

      syncCooking(result.data);
      toast.success("Cooking inventory updated.");
    });
  }

  function handleProgressSave(recipeId: string) {
    const nextCount = Math.max(0, Number(progressDraft[recipeId] ?? 0));

    startTransition(async () => {
      const result = await saveCookingProgressAction({
        recipeId,
        completedCount: nextCount,
      });

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Unable to save cooking progress.");
        return;
      }

      syncCooking(result.data);
      toast.success("Cooking progress saved.");
    });
  }

  function handleCook(recipeId: string) {
    startTransition(async () => {
      const result = await cookRecipeAction({
        recipeId,
        quantity: 1,
      });

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Unable to cook recipe.");
        return;
      }

      syncCooking(result.data);
      toast.success("Recipe cooked and ingredients deducted.");
    });
  }

  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-on-surface text-3xl font-bold tracking-tight">
          Cooking
        </h1>
        <p className="text-on-surface-variant mt-2">
          Track recipe proficiency, ingredient stock, and auto cooking unlocks.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Recipes" value={data.stats.totalRecipes} />
        <StatCard label="Auto Unlocked" value={data.stats.achievedAuto} />
        <StatCard label="Cooked Count" value={data.stats.totalCompleted} />
        <StatCard label="Need Farming" value={data.stats.neededIngredients} />
      </section>

      <nav
        className="flex items-center justify-center"
        aria-label="Cooking views"
      >
        <div
          role="tablist"
          className="flex flex-wrap justify-center gap-2 rounded-full bg-surface-variant/50 p-1"
        >
          <TabButton
            active={activeTab === "needed"}
            icon={<Search className="h-4 w-4" />}
            label="Needed Ingredients"
            onClick={() => setActiveTab("needed")}
          />
          <TabButton
            active={activeTab === "inventory"}
            icon={<PackageSearch className="h-4 w-4" />}
            label="Inventory"
            onClick={() => setActiveTab("inventory")}
          />
          <TabButton
            active={activeTab === "recipes"}
            icon={<Flame className="h-4 w-4" />}
            label="Recipes"
            onClick={() => setActiveTab("recipes")}
          />
        </div>
      </nav>

      {activeTab === "needed" ? (
        <NeededIngredients data={data} />
      ) : activeTab === "inventory" ? (
        <InventoryTab
          ingredients={filteredIngredients}
          inventoryDraft={inventoryDraft}
          search={search}
          setInventoryDraft={setInventoryDraft}
          setSearch={setSearch}
          onSave={handleInventorySave}
        />
      ) : (
        <RecipesTab
          progressDraft={progressDraft}
          recipeTypes={recipeTypes}
          recipes={filteredRecipes}
          search={search}
          setProgressDraft={setProgressDraft}
          setSearch={setSearch}
          setStatusFilter={setStatusFilter}
          setTypeFilter={setTypeFilter}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          onCook={handleCook}
          onSave={handleProgressSave}
        />
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card variant="filled" className="p-6">
      <p className="text-on-surface-variant text-sm font-medium">{label}</p>
      <p className="text-on-surface mt-2 text-3xl font-black">
        {formatNumber(value)}
      </p>
    </Card>
  );
}

function TabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      role="tab"
      aria-selected={active}
      variant={active ? "filled" : "text"}
      onClick={onClick}
      className="h-10 px-5"
    >
      {icon}
      {label}
    </Button>
  );
}

function NeededIngredients({ data }: { data: CookingData }) {
  return (
    <Card className="overflow-hidden" variant="outlined">
      <div className="border-b border-outline-variant bg-surface p-6">
        <h2 className="text-on-surface text-xl font-bold">
          Needed Ingredients
        </h2>
        <p className="text-on-surface-variant text-sm">
          Ingredients still missing to unlock auto cooking for every recipe.
        </p>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
        {data.neededIngredients.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="h-8 w-8" />}
            title="All recipes covered"
            description="Every tracked recipe has enough ingredients or auto cooking unlocked."
          />
        ) : (
          data.neededIngredients.map((ingredient) => (
            <Card
              key={ingredient.materialId}
              variant="outlined"
              className={cn(
                "flex items-center gap-4 p-4",
                rarityBorderMap[ingredient.rarity] ?? rarityBorderMap[1],
              )}
            >
              <MaterialImage
                id={ingredient.materialId}
                name={ingredient.name}
                rarity={ingredient.rarity}
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-on-surface truncate text-sm font-bold">
                  {ingredient.name}
                </h3>
                <p className="mt-0.5 text-lg font-black text-primary">
                  {formatNumber(ingredient.remaining)}
                </p>
                <p className="text-on-surface-variant text-xs font-medium">
                  {formatNumber(ingredient.owned)} /{" "}
                  {formatNumber(ingredient.required)} owned
                </p>
              </div>
            </Card>
          ))
        )}
      </div>
    </Card>
  );
}

function InventoryTab({
  ingredients,
  inventoryDraft,
  search,
  setInventoryDraft,
  setSearch,
  onSave,
}: {
  ingredients: CookingData["ingredients"];
  inventoryDraft: QuantityDraft;
  search: string;
  setInventoryDraft: Dispatch<SetStateAction<QuantityDraft>>;
  setSearch: (value: string) => void;
  onSave: (materialId: string) => void;
}) {
  return (
    <Card className="overflow-hidden" variant="outlined">
      <div className="border-b border-outline-variant bg-surface p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_20rem] lg:items-center">
          <div>
            <h2 className="text-on-surface text-xl font-bold">
              Cooking Inventory
            </h2>
            <p className="text-on-surface-variant text-sm">
              Update ingredient stock used by recipes.
            </p>
          </div>
          <AppTextField
            label="Search ingredients"
            variant="outlined"
            className="h-12"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
        {ingredients.map((ingredient) => (
          <Card
            key={ingredient.id}
            variant="outlined"
            className={cn(
              "p-4",
              rarityBorderMap[ingredient.rarity] ?? rarityBorderMap[1],
            )}
          >
            <div className="flex items-center gap-4">
              <MaterialImage
                id={ingredient.id}
                name={ingredient.name}
                rarity={ingredient.rarity}
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-on-surface truncate font-bold">
                  {ingredient.name}
                </h3>
                <p className="text-on-surface-variant text-xs">
                  {ingredient.category}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1">
                <AppTextField
                  label="Quantity"
                  variant="outlined"
                  type="number"
                  min={0}
                  className="h-11"
                  value={inventoryDraft[ingredient.id] ?? 0}
                  onChange={(event) =>
                    setInventoryDraft((current) => ({
                      ...current,
                      [ingredient.id]: Number(event.target.value),
                    }))
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      onSave(ingredient.id);
                    }
                  }}
                />
              </div>
              <Button
                aria-label={`Save ${ingredient.name} quantity`}
                className="h-11 px-4"
                onClick={() => onSave(ingredient.id)}
              >
                <Save className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}

function RecipesTab({
  progressDraft,
  recipes,
  recipeTypes,
  search,
  statusFilter,
  typeFilter,
  setProgressDraft,
  setSearch,
  setStatusFilter,
  setTypeFilter,
  onCook,
  onSave,
}: {
  progressDraft: QuantityDraft;
  recipes: CookingRecipeView[];
  recipeTypes: string[];
  search: string;
  statusFilter: string;
  typeFilter: string;
  setProgressDraft: Dispatch<SetStateAction<QuantityDraft>>;
  setSearch: (value: string) => void;
  setStatusFilter: (value: string) => void;
  setTypeFilter: (value: string) => void;
  onCook: (recipeId: string) => void;
  onSave: (recipeId: string) => void;
}) {
  return (
    <section className="space-y-6">
      <Card variant="outlined" className="p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <AppTextField
            label="Search recipes"
            variant="outlined"
            className="h-11"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select
            label="Type"
            variant="outlined"
            className="h-11"
            value={typeFilter}
            onChange={setTypeFilter}
            options={recipeTypes.map((type) => ({ label: type, value: type }))}
          />
          <Select
            label="Status"
            variant="outlined"
            className="h-11"
            value={statusFilter}
            onChange={setStatusFilter}
            options={["All", "Needs cooking", "Auto unlocked"].map(
              (status) => ({
                label: status,
                value: status,
              }),
            )}
          />
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {recipes.length === 0 ? (
          <Card variant="outlined" className="p-12">
            <EmptyState
              icon={<Search className="h-8 w-8" />}
              title="No recipes found"
              description="Try a different recipe search or filter."
            />
          </Card>
        ) : (
          recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              progressValue={progressDraft[recipe.id] ?? 0}
              recipe={recipe}
              setProgressDraft={setProgressDraft}
              onCook={() => onCook(recipe.id)}
              onSave={() => onSave(recipe.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}

function RecipeCard({
  progressValue,
  recipe,
  setProgressDraft,
  onCook,
  onSave,
}: {
  progressValue: number;
  recipe: CookingRecipeView;
  setProgressDraft: Dispatch<SetStateAction<QuantityDraft>>;
  onCook: () => void;
  onSave: () => void;
}) {
  const progressPercent =
    recipe.proficiency === 0
      ? 100
      : Math.min(
          Math.round((recipe.completedCount / recipe.proficiency) * 100),
          100,
        );

  return (
    <Card
      variant="outlined"
      className={cn(
        "p-5",
        rarityBorderMap[recipe.rarity] ?? rarityBorderMap[1],
      )}
    >
      <div className="flex gap-4">
        <div
          className={cn(
            "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br",
            rarityColorMap[recipe.rarity] ?? rarityColorMap[1],
          )}
        >
          <Image
            src={recipe.image}
            alt=""
            fill
            unoptimized
            className="object-contain p-1.5"
            sizes="64px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-on-surface truncate font-bold">
                {recipe.name}
              </h3>
              <p className="text-on-surface-variant text-xs font-medium">
                {recipe.type}
              </p>
            </div>
            {recipe.achievedAuto ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-container px-2.5 py-1 text-xs font-bold text-primary">
                <Check className="h-3.5 w-3.5" />
                Auto
              </span>
            ) : null}
          </div>
          <p className="text-on-surface-variant mt-2 line-clamp-2 text-sm">
            {recipe.effect || recipe.description}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-on-surface-variant">Proficiency</span>
          <span className="font-bold text-primary">
            {formatNumber(recipe.completedCount)} /{" "}
            {formatNumber(recipe.proficiency)}
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {recipe.ingredients.map((ingredient) => (
          <span
            key={ingredient.materialId}
            className="text-on-surface-variant rounded-full border border-outline-variant px-2.5 py-1 text-xs font-medium"
          >
            {ingredient.name} x{ingredient.quantity}
          </span>
        ))}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <AppTextField
          label="Completed"
          variant="outlined"
          type="number"
          min={0}
          className="h-11"
          value={progressValue}
          onChange={(event) =>
            setProgressDraft((current) => ({
              ...current,
              [recipe.id]: Number(event.target.value),
            }))
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onSave();
            }
          }}
        />
        <Button variant="outlined" className="h-11 px-4" onClick={onSave}>
          <Save className="h-4 w-4" aria-hidden="true" />
          Save
        </Button>
        <Button className="h-11 px-4" onClick={onCook}>
          <Flame className="h-4 w-4" aria-hidden="true" />
          Cook +1
        </Button>
      </div>
    </Card>
  );
}

function MaterialImage({
  id,
  name,
  rarity,
}: {
  id: string;
  name: string;
  rarity: number;
}) {
  return (
    <div
      className={cn(
        "relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br",
        rarityColorMap[rarity] ?? rarityColorMap[1],
      )}
    >
      <Image
        src={`/api/material-image/${id}`}
        alt={name}
        fill
        className="object-contain p-1.5"
        sizes="48px"
      />
    </div>
  );
}

function buildInventoryDraft(data: CookingData): QuantityDraft {
  return Object.fromEntries(
    data.ingredients.map((ingredient) => [ingredient.id, ingredient.quantity]),
  );
}

function buildProgressDraft(data: CookingData): QuantityDraft {
  return Object.fromEntries(
    data.recipes.map((recipe) => [recipe.id, recipe.completedCount]),
  );
}
