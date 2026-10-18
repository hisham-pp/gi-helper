"use client";

import React, { useSyncExternalStore } from "react";
import { Lock, type LucideIcon } from "lucide-react";
import { GameIcon } from "@/components/ui/GameIcon";
import { characterAvatarUrl } from "@/lib/characters";
import { describeCharacter } from "@/lib/good/catalog";
import { getRarityStyles } from "@/lib/materials/ui";

const noopSubscribe = () => () => {};

/** False on the server and while hydrating, so saved lists don't flash their empty state first. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function RarityStars({ rarity, className = "" }: { rarity: number; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-bold drop-shadow ${getRarityStyles(rarity).starColor} ${className}`}
      aria-label={`${rarity} star`}
    >
      {Array.from({ length: rarity }, (_, i) => (
        <span key={i} aria-hidden="true">
          ★
        </span>
      ))}
    </span>
  );
}

/** Who has a weapon or artifact equipped: a small avatar and name. */
export function EquippedBy({ location }: { location: string }) {
  if (!location) return null;
  const character = describeCharacter(location);
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-[11px] text-white/70" title={`Equipped by ${character.name}`}>
      <GameIcon
        src={character.avatarId ? characterAvatarUrl(character.avatarId) : null}
        alt=""
        size={20}
        className="h-5 w-5 shrink-0 rounded-full bg-white/10"
        fallback={<span className="h-5 w-5 shrink-0 rounded-full bg-white/10" />}
      />
      <span className="truncate">{character.name}</span>
    </span>
  );
}

export function LockBadge({ locked }: { locked: boolean }) {
  if (!locked) return null;
  return (
    <span className="text-white/60" title="Locked in game">
      <Lock className="h-3.5 w-3.5" aria-label="Locked" />
    </span>
  );
}

/** Empty tab: what goes here and how to fill it. */
export function TabEmptyState({
  icon: Icon,
  title,
  text,
  children,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="glass-card glass-card--lg flex flex-col items-center justify-center p-12 text-center">
      <div className="glass-lens mb-4 h-16 w-16 text-white/50">
        <Icon className="h-8 w-8" />
      </div>
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <p className="mt-1 max-w-md text-xs text-white/60">{text}</p>
      {children && <div className="mt-5 flex flex-wrap items-center justify-center gap-3">{children}</div>}
    </div>
  );
}

/** "Showing x of y" line above a list. */
export function ResultsCounter({
  shown,
  total,
  noun,
  page,
  totalPages,
  children,
}: {
  shown: number;
  total: number;
  noun: string;
  page?: number;
  totalPages?: number;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-white/70">
      <span>
        Showing <strong className="font-mono text-white">{shown}</strong> of{" "}
        <strong className="font-mono text-white">{total}</strong> {noun}
      </span>
      <div className="flex flex-wrap items-center gap-3">
        {page !== undefined && totalPages !== undefined && totalPages > 1 && (
          <span className="text-white/60">
            Page <strong className="text-white">{page}</strong> of{" "}
            <strong className="text-white">{totalPages}</strong>
          </span>
        )}
        {children}
      </div>
    </div>
  );
}

/** Clamps the page into range and slices `items` for it. */
export function paginate<T>(items: T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(page, 1), totalPages);
  const start = (current - 1) * pageSize;
  return { pageItems: items.slice(start, start + pageSize), page: current, totalPages };
}
