"use client";

import type { Route } from "next";
import Link from "next/link";
import { ChevronRight, Search, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";

import AppTextField from "@/components/core/app-textfield";
import { Select } from "@/components/core/app-select";
import { Card } from "@/components/ui/card";
import { CachedImage } from "@/components/ui/cached-image";
import { useEnemiesData } from "@/lib/cached-data";

export function EnemyList() {
  const { data, isLoading } = useEnemiesData();
  const enemies = data?.enemies ?? [];
  const [search, setSearch] = useState("");
  const [materialFilter, setMaterialFilter] = useState("All");
  const [elementFilter, setElementFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const materialOptions = useMemo(() => {
    const materials = enemies
      .flatMap((enemy) => enemy.materials)
      .filter((material) => material.id)
      .map((material) => ({
        label: material.name,
        value: material.id ?? material.name,
      }))
      .sort((left, right) => left.label.localeCompare(right.label));

    return [
      { label: "All", value: "All" },
      ...materials.filter(
        (material, index, list) =>
          list.findIndex((item) => item.value === material.value) === index,
      ),
    ];
  }, [enemies]);

  const elementOptions = useMemo(() => {
    const elements = Array.from(
      new Set(enemies.flatMap((enemy) => enemy.bestElements)),
    ).sort();

    return [
      { label: "All", value: "All" },
      ...elements.map((element) => ({ label: element, value: element })),
    ];
  }, [enemies]);

  const typeOptions = useMemo(() => {
    const types = Array.from(
      new Set(enemies.map((enemy) => enemy.type)),
    ).sort();

    return [
      { label: "All", value: "All" },
      ...types.map((type) => ({ label: type, value: type })),
    ];
  }, [enemies]);

  const filteredEnemies = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return enemies.filter((enemy) => {
      const searchable = [
        enemy.name,
        enemy.type,
        enemy.family,
        enemy.region,
        ...enemy.elements,
        ...enemy.bestElements,
        ...enemy.materials.map((material) => material.name),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        normalizedSearch.length === 0 || searchable.includes(normalizedSearch);
      const matchesMaterial =
        materialFilter === "All" ||
        enemy.materials.some((material) => material.id === materialFilter);
      const matchesElement =
        elementFilter === "All" ||
        enemy.bestElements.some((element) => element === elementFilter);
      const matchesType = typeFilter === "All" || enemy.type === typeFilter;

      return matchesSearch && matchesMaterial && matchesElement && matchesType;
    });
  }, [elementFilter, enemies, materialFilter, search, typeFilter]);

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl bg-surface-variant/20"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(16rem,1fr)_13rem_13rem_13rem]">
            <AppTextField
              label="Search Enemies"
              variant="outlined"
              className="md:col-span-2 xl:col-span-1"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Select
              label="Material"
              variant="outlined"
              value={materialFilter}
              onChange={setMaterialFilter}
              options={materialOptions}
            />
            <Select
              label="Best Element"
              variant="outlined"
              value={elementFilter}
              onChange={setElementFilter}
              options={elementOptions}
            />
            <Select
              label="Enemy Type"
              variant="outlined"
              value={typeFilter}
              onChange={setTypeFilter}
              options={typeOptions}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {filteredEnemies.map((enemy) => (
              <Link key={enemy.id} href={`/enemies/${enemy.id}` as Route}>
                <Card
                  variant="outlined"
                  className="group flex h-full min-h-36 gap-3 p-3 transition-all hover:border-primary hover:shadow-md"
                >
                  <div className="relative grid h-16 w-16 flex-shrink-0 place-items-center overflow-hidden rounded-lg bg-surface-variant">
                    {enemy.image ? (
                      <CachedImage
                        src={enemy.image}
                        alt={enemy.name}
                        fill
                        className="object-contain p-1.5"
                        sizes="64px"
                      />
                    ) : (
                      <ShieldAlert className="text-on-surface-variant h-8 w-8" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-on-surface truncate text-sm font-bold">
                          {enemy.name}
                        </h3>
                        <p className="text-on-surface-variant mt-0.5 truncate text-[11px]">
                          {enemy.type} · {enemy.family}
                        </p>
                      </div>
                      <ChevronRight className="text-on-surface-variant mt-0.5 h-4 w-4 flex-shrink-0 opacity-60 group-hover:opacity-100" />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(enemy.bestElements.length > 0
                        ? enemy.bestElements
                        : ["Any"]
                      ).map((element) => (
                        <span
                          key={element}
                          className="text-on-surface-variant rounded-full border border-outline-variant px-2 py-0.5 text-[10px] font-semibold"
                        >
                          {element}
                        </span>
                      ))}
                    </div>

                    <p className="text-on-surface-variant mt-3 line-clamp-2 text-xs leading-5">
                      {enemy.materials.length > 0
                        ? enemy.materials
                            .slice(0, 3)
                            .map((material) => material.name)
                            .join(", ")
                        : "No material drops listed"}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {filteredEnemies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-on-primary-container mb-4 rounded-full bg-primary-container p-4 shadow-sm">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-on-surface font-bold">No enemies found</h3>
              <p className="text-on-surface-variant mt-2 max-w-sm text-sm">
                Try another material, counter element, or search term.
              </p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
