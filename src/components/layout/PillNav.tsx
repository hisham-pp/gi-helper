"use client";

import React, { useEffect, useRef } from "react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

export interface PillNavItem {
  href: Route;
  label: string;
  icon: LucideIcon;
}

/** Track padding and gap between links, in px (matches p-1 / gap-1). */
const PAD = 4;
const GAP = 4;

export function isCurrent(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

interface PillNavProps {
  items: PillNavItem[];
  ariaLabel: string;
  /** Width and display of the track, e.g. full width on phones. */
  className?: string;
  /** Extra classes for the link icons, e.g. hidden on phones. */
  iconClassName?: string;
}

/**
 * Page links as one pill in the scanner-tab style: a recessed glass track with
 * a raised glass thumb under the current page. The top bar and footer stay
 * mounted across navigations, so the thumb slides (and squashes) to the new
 * page; it fades out when none of the links is current.
 */
export function PillNav({
  items,
  ariaLabel,
  className = "inline-grid",
  iconClassName = "",
}: PillNavProps) {
  const pathname = usePathname();
  const activeIndex = items.findIndex((item) => isCurrent(pathname, item.href));
  const count = items.length;
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
    <nav
      aria-label={ariaLabel}
      className={`glass-track auto-cols-fr grid-flow-col gap-1 p-1 ${className}`}
    >
      <div
        ref={thumbRef}
        aria-hidden="true"
        className="glass-thumb bottom-1 left-1 top-1"
        style={{
          width: `calc((100% - ${2 * PAD + (count - 1) * GAP}px) / ${count})`,
          transform: `translateX(calc(${Math.max(activeIndex, 0)} * (100% + ${GAP}px)))`,
          // On pages this pill doesn't link to, no link is current
          opacity: activeIndex < 0 ? 0 : 1,
        }}
      />

      {items.map((item, index) => {
        const isActive = index === activeIndex;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            aria-current={isActive ? "page" : undefined}
            className={`relative select-none z-10 flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 ${
              isActive
                ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                : "text-white/55 hover:text-white/85"
            }`}
          >
            <Icon
              className={`h-3.5 w-3.5 shrink-0 transition-colors ${isActive ? "text-cyan-200" : "text-white/45"} ${iconClassName}`}
            />
            <span className="whitespace-nowrap">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
