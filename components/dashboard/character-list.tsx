"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import Image from "next/image";
import { Search, Filter, Sparkles, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { Select } from "@/components/ui/select";
import { createGoalFromTemplateAction } from "@/app/actions";
import { rarityColorMap } from "@/lib/constants";
import { cn } from "@/lib/utils";

type CharacterWithTemplates = {
  id: string;
  name: string;
  image: string;
  rarity: number;
  element: string;
  weaponType: string;
  region: string;
  templates: Array<{
    id: string;
    name: string;
    description: string | null;
    category: string;
    sortOrder: number;
  }>;
};

type CharacterListProps = {
  characters: CharacterWithTemplates[];
};

export function CharacterList({ characters }: CharacterListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [elementFilter, setElementFilter] = useState("All");
  const [weaponFilter, setWeaponFilter] = useState("All");

  useEffect(() => {
    const s = searchParams.get("search");
    if (s) setSearch(s);
  }, [searchParams]);

  const elements = useMemo(
    () => ["All", ...new Set(characters.map((c) => c.element))],
    [characters],
  );

  const weaponTypes = useMemo(
    () => ["All", ...new Set(characters.map((c) => c.weaponType))],
    [characters],
  );

  const filteredCharacters = useMemo(() => {
    return characters.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const matchesElement =
        elementFilter === "All" || c.element === elementFilter;
      const matchesWeapon =
        weaponFilter === "All" || c.weaponType === weaponFilter;

      return matchesSearch && matchesElement && matchesWeapon;
    });
  }, [characters, search, elementFilter, weaponFilter]);

  function handleCreateFromTemplate(templateId: string) {
    startTransition(async () => {
      const result = await createGoalFromTemplateAction({
        type: "character",
        templateId,
      });

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Unable to create goal from template.");
        return;
      }

      toast.success("Goal created from template.");
      router.push("/materials?tab=goals");
    });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 max-w-sm">
          <TextField
            label="Search Characters"
            variant="outlined"
            className="h-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            // icon={<Search className="h-4 w-4" />} // Assuming TextField might support an icon eventually, but current one doesn't seem to based on DashboardShell
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Select
            label="Element"
            variant="outlined"
            className="h-12 w-32"
            value={elementFilter}
            onChange={setElementFilter}
            options={elements.map((e) => ({ label: e, value: e }))}
          />
          <Select
            label="Weapon"
            variant="outlined"
            className="h-12 w-32"
            value={weaponFilter}
            onChange={setWeaponFilter}
            options={weaponTypes.map((w) => ({ label: w, value: w }))}
          />
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCharacters.map((character) => (
          <Card key={character.id} variant="outlined" className="p-6">
            <div className="mb-4 flex items-center gap-4">
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
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div>
                <h3 className="text-on-surface font-bold">{character.name}</h3>
                <p className="text-on-surface-variant text-xs">
                  {character.element} • {character.weaponType}
                </p>
                <p className="text-on-surface-variant text-[10px] mt-0.5">
                  {character.region}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mb-1">
                Templates
              </p>
              {character.templates.length === 0 ? (
                <p className="text-on-surface-variant text-xs italic">
                  No templates available.
                </p>
              ) : (
                character.templates
                  .sort((a, b) => {
                    if (a.category !== b.category) {
                      return a.category.localeCompare(b.category);
                    }
                    return a.sortOrder - b.sortOrder;
                  })
                  .map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleCreateFromTemplate(template.id)}
                      disabled={isPending}
                      className="text-on-surface-variant hover:bg-surface-variant/50 flex w-full items-center justify-between rounded-lg p-3 text-left text-sm transition-colors border border-outline-variant/30"
                    >
                      <div>
                        <p className="text-on-surface font-medium">
                          {template.name}
                        </p>
                        {template.description && (
                          <p className="text-on-surface-variant text-[11px] line-clamp-1">
                            {template.description}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="text-on-surface-variant h-4 w-4 flex-shrink-0" />
                    </button>
                  ))
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredCharacters.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-on-primary-container mb-4 rounded-full bg-primary-container p-4 shadow-sm">
            <Search className="h-8 w-8" />
          </div>
          <h3 className="text-on-surface font-bold">No characters found</h3>
          <p className="text-on-surface-variant mt-2 max-w-sm text-sm">
            Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  );
}
