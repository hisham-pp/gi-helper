"use client";

import React from "react";
import { Flower2, PackageCheck, Swords, Users } from "lucide-react";
import { PillNav, type PillNavItem } from "@/components/layout/PillNav";

const DATABASE_ITEMS: PillNavItem[] = [
  { href: "/materials", label: "Materials", icon: PackageCheck },
  { href: "/characters", label: "Characters", icon: Users },
  { href: "/weapons", label: "Weapons", icon: Swords },
  { href: "/artifacts", label: "Artifacts", icon: Flower2 },
];

/**
 * Links between the database pages (materials, characters, weapons,
 * artifacts), which share the top bar's "Database" link. Icons from sm, so
 * it fits phones.
 */
export function DatabaseNav() {
  return (
    <PillNav
      items={DATABASE_ITEMS}
      ariaLabel="Database"
      className="grid w-full sm:inline-grid sm:w-auto"
      iconClassName="hidden sm:block"
    />
  );
}

/** RGB triplets per element, for tab accents and dots. */
export const ELEMENT_ACCENTS: Record<string, string> = {
  Pyro: "248, 113, 113",
  Hydro: "96, 165, 250",
  Anemo: "45, 212, 191",
  Electro: "192, 132, 252",
  Dendro: "163, 230, 53",
  Cryo: "125, 211, 252",
  Geo: "251, 191, 36",
  None: "148, 163, 184",
};

export const ELEMENTS = ["Pyro", "Hydro", "Anemo", "Electro", "Dendro", "Cryo", "Geo"] as const;

/** A small coloured dot and the element's name. */
export function ElementTag({ element }: { element: string }) {
  const accent = ELEMENT_ACCENTS[element] ?? ELEMENT_ACCENTS.None;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-white/75">
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: `rgb(${accent})` }} aria-hidden="true" />
      {element === "None" ? "Any element" : element}
    </span>
  );
}
