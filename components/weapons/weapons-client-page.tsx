"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { WeaponList } from "@/components/weapons/weapon-list";
import { CharactersPageLoading } from "@/components/ui/page-loading";
import { useStaticWeapons } from "@/lib/cached-data";

type ApiUser = {
  username: string;
  role?: string;
} | null;

export function WeaponsClientPage() {
  const { data: staticWeaponsData, isLoading: isStaticLoading } =
    useStaticWeapons();
  const [user, setUser] = useState<ApiUser>(null);
  const [isApiLoading, setIsApiLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadApiData = useCallback(async () => {
    setIsApiLoading(true);

    try {
      const response = await fetch("/api/me", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Unable to load user data.");
      }

      const payload = (await response.json()) as { user: ApiUser };

      setUser(payload.user);
      setLoadError(null);
    } catch (error) {
      console.error("Weapon list load failed", error);
      setLoadError("Unable to load weapons right now.");
      toast.error("Unable to load weapons.");
    } finally {
      setIsApiLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadApiData();
  }, [loadApiData]);

  const weapons = staticWeaponsData?.weapons ?? [];
  const isLoading = isStaticLoading || isApiLoading;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-on-surface text-3xl font-bold tracking-tight">
          Weapons
        </h1>
        <p className="text-on-surface-variant mt-1">
          Browse weapons and open a card to create ascension farming goals.
        </p>
      </div>

      {isLoading ? (
        <CharactersPageLoading />
      ) : loadError ? (
        <div className="rounded-lg border border-outline-variant bg-surface p-8">
          <h2 className="text-on-surface text-xl font-bold">{loadError}</h2>
          <p className="text-on-surface-variant mt-2 text-sm">
            Refresh the page or try again in a moment.
          </p>
        </div>
      ) : (
        <WeaponList weapons={weapons} />
      )}
    </div>
  );
}
