"use client";

import type { Route } from "next";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  WeaponGoalBuilder,
  type WeaponDetail,
} from "@/components/weapons/weapon-goal-builder";
import { Button } from "@/components/ui/button";
import { CharacterDetailPageLoading } from "@/components/ui/page-loading";
import { useWeaponById } from "@/lib/cached-data";

type ApiUser = {
  username: string;
  role?: string;
} | null;

export function WeaponDetailClientPage({ weaponId }: { weaponId: string }) {
  const {
    data: weapon,
    isLoading: isWeaponLoading,
    error: weaponError,
  } = useWeaponById(weaponId);
  const [user, setUser] = useState<ApiUser>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  const loadUser = useCallback(async () => {
    setIsUserLoading(true);
    try {
      const response = await fetch("/api/me", { cache: "no-store" });
      if (response.ok) {
        const payload = (await response.json()) as { user: ApiUser };
        setUser(payload.user);
      }
    } catch (error) {
      console.error("Weapon detail user load failed", error);
    } finally {
      setIsUserLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  if (isWeaponLoading || isUserLoading) {
    return <CharacterDetailPageLoading />;
  }

  if (weaponError || !weapon) {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-outline-variant bg-surface p-8">
        <h1 className="text-on-surface text-2xl font-bold">Weapon not found</h1>
        <p className="text-on-surface-variant mt-3 text-sm">
          That weapon is not available in the local data set.
        </p>
        <Link className="mt-6 block w-fit" href={"/weapons" as Route}>
          <Button variant="outlined">Back to weapons</Button>
        </Link>
      </div>
    );
  }

  return (
    <WeaponGoalBuilder
      weapon={weapon as WeaponDetail}
      isAuthenticated={Boolean(user)}
    />
  );
}
