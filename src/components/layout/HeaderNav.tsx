"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Backpack, House, PackageCheck, type LucideIcon } from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

interface NavItem {
  href: "/" | "/inventory" | "/materials";
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: House },
  { href: "/inventory", label: "Inventory", icon: Backpack },
  { href: "/materials", label: "Materials", icon: PackageCheck },
];

/** Track padding and gap between links, in px (matches p-1 / gap-1). */
const PAD = 4;
const GAP = 4;

function isCurrent(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Page links as one pill in the scanner-tab style: a recessed glass track with
 * a raised glass thumb under the current page. The top bar stays mounted
 * across navigations, so the thumb slides (and squashes) to the new page.
 * Labels collapse to icons on phones.
 */
export function HeaderNav() {
  const pathname = usePathname();
  const activeIndex = NAV_ITEMS.findIndex((item) => isCurrent(pathname, item.href));
  const count = NAV_ITEMS.length;
  const thumbRef = useRef<HTMLDivElement>(null);
  const prevIndexRef = useRef(activeIndex);
  const reducedMotion = usePrefersReducedMotion();

  // Same squash-and-stretch as the scanner tab thumb.
  useEffect(() => {
    const prevIndex = prevIndexRef.current;
    prevIndexRef.current = activeIndex;
    if (prevIndex === activeIndex || activeIndex < 0 || reducedMotion) return;

    thumbRef.current?.animate(
      [
        { scale: "1 1" },
        { scale: "1.1 0.88", offset: 0.35 },
        { scale: "0.96 1.05", offset: 0.7 },
        { scale: "1 1" },
      ],
      { duration: 520, easing: "ease-out" },
    );
  }, [activeIndex, reducedMotion]);

  return (
    // Equal-width columns sized to the widest link, so the thumb lines up exactly
    <nav aria-label="Main" className="glass-track inline-grid auto-cols-fr grid-flow-col gap-1 p-1">
      <div
        ref={thumbRef}
        aria-hidden="true"
        className="glass-thumb bottom-1 left-1 top-1"
        style={{
          width: `calc((100% - ${2 * PAD + (count - 1) * GAP}px) / ${count})`,
          transform: `translateX(calc(${Math.max(activeIndex, 0)} * (100% + ${GAP}px)))`,
          // Off the main pages (e.g. release notes) no link is current
          opacity: activeIndex < 0 ? 0 : 1,
        }}
      />

      {NAV_ITEMS.map((item, index) => {
        const isActive = index === activeIndex;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            aria-current={isActive ? "page" : undefined}
            className={`relative z-10 flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 ${
              isActive
                ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                : "text-white/55 hover:text-white/85"
            }`}
          >
            <Icon
              className={`h-3.5 w-3.5 shrink-0 transition-colors ${isActive ? "text-cyan-200" : "text-white/45"}`}
            />
            <span className="sr-only whitespace-nowrap sm:not-sr-only">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Version chip linking to the release notes; raised while on that page. */
export function VersionChip({ version }: { version: string }) {
  const pathname = usePathname();
  const isActive = isCurrent(pathname, "/versions");

  return (
    <Link
      href="/versions"
      title="Release notes"
      aria-current={isActive ? "page" : undefined}
      data-active={isActive}
      className="glass-chip px-2 py-0.5 font-mono text-[10px] font-bold text-white/70"
    >
      v{version}
    </Link>
  );
}
