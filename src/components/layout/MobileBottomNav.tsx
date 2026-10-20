"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Backpack, House, Library, Settings } from "lucide-react";
import { ShellLink } from "@/components/layout/ShellLink";
import { isCurrent } from "./PillNav";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { triggerHaptic } from "@/lib/haptics";
import type { Route } from "next";

interface MobileNavItem {
  href: Route;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  match?: string[];
}

const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  { href: "/", label: "Home", icon: House },
  { href: "/inventory/materials", label: "Inventory", icon: Backpack, match: ["/inventory"] },
  { href: "/db/materials", label: "Database", icon: Library, match: ["/db"] },
  { href: "/settings" as Route, label: "Settings", icon: Settings, match: ["/settings"] },
];

const GAP = 4;
const TOTAL_ITEMS = 4; // Home, Inventory, Database, Settings

/**
 * Fixed bottom navigation bar for mobile devices.
 * Always visible at the bottom of the viewport with safe-area spacing,
 * routing to Home, Inventory, Database, and Settings page.
 */
export function MobileBottomNav() {
  const pathname = usePathname();
  const [gearSpinning, setGearSpinning] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  // Route-based active index (0, 1, 2, or 3)
  const activeIndex = MOBILE_NAV_ITEMS.findIndex(
    (item) =>
      isCurrent(pathname, item.href) ||
      item.match?.some((path) => isCurrent(pathname, path)),
  );

  const thumbRef = useRef<HTMLDivElement>(null);
  const prevIndexRef = useRef(activeIndex);

  // Smooth squash-and-stretch sliding animation for the bottom dock thumb
  useEffect(() => {
    const prevIndex = prevIndexRef.current;
    prevIndexRef.current = activeIndex;
    if (prevIndex === activeIndex || activeIndex < 0 || reducedMotion) return;

    thumbRef.current?.animate(
      [
        { scale: "1 1" },
        { scale: "1.12 0.86", offset: 0.35 },
        { scale: "0.95 1.06", offset: 0.7 },
        { scale: "1 1" },
      ],
      { duration: 480, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    );
  }, [activeIndex, reducedMotion]);

  const handleSettingsClick = () => {
    triggerHaptic("selection");
    setGearSpinning(true);
    setTimeout(() => setGearSpinning(false), 600);
  };

  return (
    <>
      <style>{`
        @keyframes gear-spin-burst {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.22); }
          100% { transform: rotate(360deg) scale(1); }
        }
        .gear-spin-anim {
          animation: gear-spin-burst 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      {/* Mobile Fixed Navigation Dock: sm:hidden */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-3 inset-x-3 max-w-md mx-auto z-40 sm:hidden select-none pb-[env(safe-area-inset-bottom,0px)]"
      >
        <div className="glass-dock rounded-full p-1">
          <div className="relative grid grid-cols-4 items-center gap-1">
            {/* Sliding glass thumb */}
            <div
              ref={thumbRef}
              aria-hidden="true"
              className="glass-thumb absolute bottom-0.5 top-0.5 left-0 rounded-full transition-transform duration-300 ease-out will-change-transform"
              style={{
                width: `calc((100% - ${(TOTAL_ITEMS - 1) * GAP}px) / ${TOTAL_ITEMS})`,
                transform: `translateX(calc(${Math.max(activeIndex, 0)} * (100% + ${GAP}px)))`,
                opacity: activeIndex < 0 ? 0 : 1,
              }}
            />

            {/* Navigation links */}
            {MOBILE_NAV_ITEMS.map((item, index) => {
              const isActive = index === activeIndex;
              const isSettings = item.label === "Settings";
              const Icon = item.icon;

              return (
                <ShellLink
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => {
                    if (isSettings) {
                      handleSettingsClick();
                    } else if (!isActive) {
                      triggerHaptic("selection");
                    }
                  }}
                  className={`relative z-10 flex flex-col items-center justify-center gap-1 rounded-full py-2 px-1 text-[11px] font-semibold transition-[color,transform] duration-200 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 ${
                    isActive
                      ? "text-white dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                      : "text-white/55 hover:text-white/85"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                      isSettings && gearSpinning
                        ? "gear-spin-anim text-amber-500 dark:text-amber-300"
                        : isActive
                          ? isSettings
                            ? "scale-110 rotate-180 text-amber-500 dark:text-amber-300"
                            : "scale-110 text-cyan-600 dark:text-cyan-200 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                          : "text-white/50"
                    }`}
                  />
                  <span className="whitespace-nowrap tracking-tight">{item.label}</span>
                </ShellLink>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
