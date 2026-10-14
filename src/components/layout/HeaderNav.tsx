"use client";

import React from "react";
import { ShellLink } from "@/components/layout/ShellLink";
import { usePathname } from "next/navigation";
import { Backpack, House, PackageCheck } from "lucide-react";
import { isCurrent, PillNav, type PillNavItem } from "./PillNav";

const NAV_ITEMS: PillNavItem[] = [
  { href: "/", label: "Home", icon: House },
  { href: "/inventory", label: "Inventory", icon: Backpack },
  { href: "/materials", label: "Materials", icon: PackageCheck },
];

/**
 * The top bar's page links (see PillNav). On phones it fills its own row
 * under the logo (see SiteHeader).
 */
export function HeaderNav() {
  return (
    <PillNav items={NAV_ITEMS} ariaLabel="Main" className="grid w-full sm:inline-grid sm:w-auto" />
  );
}

/** Version chip linking to the release notes; raised while on that page. */
export function VersionChip({ version }: { version: string }) {
  const pathname = usePathname();
  const isActive = isCurrent(pathname, "/versions");

  return (
    <ShellLink
      href="/versions"
      title="Release notes"
      aria-current={isActive ? "page" : undefined}
      data-active={isActive}
      className="glass-chip px-2 py-0.5 font-mono text-[10px] font-bold text-white/70"
    >
      v{version}
    </ShellLink>
  );
}
