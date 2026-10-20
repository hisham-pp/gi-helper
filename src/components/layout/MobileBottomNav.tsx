"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
 * Supports iOS-style smooth drag-to-switch across tabs with tactile haptic ticks.
 */
export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [gearSpinning, setGearSpinning] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [optimisticIndex, setOptimisticIndex] = useState<number | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  // Route-based active index (0, 1, 2, or 3)
  const activeIndex = MOBILE_NAV_ITEMS.findIndex(
    (item) =>
      isCurrent(pathname, item.href) ||
      item.match?.some((path) => isCurrent(pathname, path)),
  );

  const dockRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const prevIndexRef = useRef(activeIndex);

  // References to track touch gesture without React re-render lag
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const hasDraggedRef = useRef(false);
  const currentDragIndexRef = useRef<number | null>(null);
  const currentThumbLeftRef = useRef(0);
  const isCancelledRef = useRef(false);
  const justDraggedRef = useRef(false);

  // Synchronize optimistic index once real route navigation catches up
  useEffect(() => {
    if (optimisticIndex !== null && optimisticIndex === activeIndex) {
      setOptimisticIndex(null);
    }
  }, [activeIndex, optimisticIndex]);

  // Effective displayed active index (dragged item overrides while active, optimistic holds during route transition)
  const displayIndex =
    dragIndex !== null
      ? dragIndex
      : optimisticIndex !== null
        ? optimisticIndex
        : activeIndex;

  // Smooth squash-and-stretch sliding animation when route changes via tap
  useEffect(() => {
    const prevIndex = prevIndexRef.current;
    prevIndexRef.current = activeIndex;
    if (justDraggedRef.current) {
      justDraggedRef.current = false;
      return;
    }
    if (prevIndex === activeIndex || activeIndex < 0 || reducedMotion || isDragging) return;

    thumbRef.current?.animate(
      [
        { scale: "1 1" },
        { scale: "1.12 0.86", offset: 0.35 },
        { scale: "0.95 1.06", offset: 0.7 },
        { scale: "1 1" },
      ],
      { duration: 480, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    );
  }, [activeIndex, reducedMotion, isDragging]);

  const handleSettingsClick = () => {
    triggerHaptic("selection");
    setGearSpinning(true);
    setTimeout(() => setGearSpinning(false), 600);
  };

  // --- Drag over tabs gesture handling ---
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const rect = dockRef.current?.getBoundingClientRect();
    if (!rect) return;

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    hasDraggedRef.current = false;
    isCancelledRef.current = false;
    currentDragIndexRef.current = activeIndex;

    const dockPadding = 4;
    const innerWidth = rect.width - 2 * dockPadding;
    const colWidth = (innerWidth - (TOTAL_ITEMS - 1) * GAP) / TOTAL_ITEMS;
    const step = colWidth + GAP;
    currentThumbLeftRef.current = Math.max(0, activeIndex * step);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const rect = dockRef.current?.getBoundingClientRect();
    if (!rect) return;

    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    // Detect horizontal drag intent (threshold of 6px)
    if (!hasDraggedRef.current) {
      if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
        hasDraggedRef.current = true;
        setIsDragging(true);
      } else if (Math.abs(dy) > 12) {
        // Vertical scroll intent; ignore
        return;
      }
    }

    if (!hasDraggedRef.current) return;

    const dockPadding = 4; // p-1 = 4px
    const innerWidth = rect.width - 2 * dockPadding;
    const colWidth = (innerWidth - (TOTAL_ITEMS - 1) * GAP) / TOTAL_ITEMS;
    const step = colWidth + GAP;

    // Vertical drag cancellation if finger leaves the dock boundary
    const isOutOfBounds =
      touch.clientY < rect.top - 65 || touch.clientY > rect.bottom + 50;

    if (isOutOfBounds) {
      if (!isCancelledRef.current) {
        isCancelledRef.current = true;
        setDragIndex(null);
        currentDragIndexRef.current = activeIndex;
        const startLeft = currentThumbLeftRef.current;
        const targetLeft = activeIndex * step;

        if (thumbRef.current && !reducedMotion && typeof thumbRef.current.animate === "function") {
          const anim = thumbRef.current.animate(
            [
              { transform: `translateX(${startLeft}px) scale(1.05, 0.94)` },
              { transform: `translateX(${targetLeft}px) scale(1, 1)` },
            ],
            {
              duration: 280,
              easing: "cubic-bezier(0.2, 0.9, 0.3, 1)",
              fill: "forwards",
            },
          );
          anim.onfinish = () => {
            if (thumbRef.current) thumbRef.current.style.transform = "";
            try {
              anim.cancel();
            } catch {
              // ignore
            }
          };
        } else if (thumbRef.current) {
          thumbRef.current.style.transform = "";
        }
        triggerHaptic("dragTick");
      }
      return;
    }

    if (isCancelledRef.current) {
      isCancelledRef.current = false;
    }

    // Direct tracking: center the thumb right under the finger
    const relX = touch.clientX - rect.left - dockPadding;
    const targetThumbLeft = relX - colWidth / 2;
    const maxLeft = (TOTAL_ITEMS - 1) * step;
    const clampedThumbLeft = Math.max(0, Math.min(targetThumbLeft, maxLeft));
    currentThumbLeftRef.current = clampedThumbLeft;

    if (thumbRef.current && !reducedMotion) {
      thumbRef.current.style.transform = `translateX(${clampedThumbLeft}px) scale(1.05, 0.94)`;
    }

    // Determine hovered item index
    const clampedRelX = Math.max(0, Math.min(relX, innerWidth));
    const newIndex = Math.min(
      Math.floor(clampedRelX / (innerWidth / TOTAL_ITEMS)),
      TOTAL_ITEMS - 1,
    );

    if (newIndex !== currentDragIndexRef.current) {
      currentDragIndexRef.current = newIndex;
      setDragIndex(newIndex);
      // Crisp detent tick as finger glides across tab boundaries
      triggerHaptic("dragTick");
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current) return;

    const hadDragged = hasDraggedRef.current;
    const wasCancelled = isCancelledRef.current;
    const targetIndex = currentDragIndexRef.current;
    const startLeft = currentThumbLeftRef.current;

    touchStartRef.current = null;
    hasDraggedRef.current = false;
    isCancelledRef.current = false;

    if (hadDragged) {
      // Prevent synthetic click from firing on the touch point
      e.preventDefault();
      justDraggedRef.current = true;

      const rect = dockRef.current?.getBoundingClientRect();
      const dockPadding = 4;
      const innerWidth = (rect?.width ?? 320) - 2 * dockPadding;
      const colWidth = (innerWidth - (TOTAL_ITEMS - 1) * GAP) / TOTAL_ITEMS;
      const step = colWidth + GAP;

      const finalIndex =
        !wasCancelled && targetIndex !== null && targetIndex >= 0
          ? targetIndex
          : activeIndex;
      const targetLeft = finalIndex * step;

      // Lock optimistic index to the target tab so it never snaps backwards during Next.js routing
      setOptimisticIndex(finalIndex);
      setIsDragging(false);
      setDragIndex(null);

      // Smoothly spring from exact current touch release position into target slot
      if (thumbRef.current && !reducedMotion && typeof thumbRef.current.animate === "function") {
        const anim = thumbRef.current.animate(
          [
            { transform: `translateX(${startLeft}px) scale(1.05, 0.94)` },
            { transform: `translateX(${targetLeft}px) scale(1, 1)` },
          ],
          {
            duration: 320,
            easing: "cubic-bezier(0.2, 0.9, 0.3, 1)",
            fill: "forwards",
          },
        );
        anim.onfinish = () => {
          if (thumbRef.current) {
            thumbRef.current.style.transform = "";
          }
          try {
            anim.cancel();
          } catch {
            // ignore
          }
        };
      } else if (thumbRef.current) {
        thumbRef.current.style.transform = "";
      }

      if (!wasCancelled && targetIndex !== null && targetIndex >= 0) {
        const item = MOBILE_NAV_ITEMS[targetIndex];
        const isSettings = item.label === "Settings";

        if (targetIndex !== activeIndex) {
          triggerHaptic("dragSnap");
          if (isSettings) {
            handleSettingsClick();
            router.push("/settings");
          } else {
            router.push(item.href);
          }
        } else {
          // Snapped back to current item: confirm with light tap
          triggerHaptic("selection");
          if (isSettings) {
            handleSettingsClick();
          }
        }
      }
    } else {
      if (thumbRef.current) {
        thumbRef.current.style.transform = "";
      }
      setIsDragging(false);
      setDragIndex(null);
    }
  };

  const handleTouchCancel = () => {
    if (hasDraggedRef.current && thumbRef.current && !reducedMotion && typeof thumbRef.current.animate === "function") {
      const rect = dockRef.current?.getBoundingClientRect();
      const dockPadding = 4;
      const innerWidth = (rect?.width ?? 320) - 2 * dockPadding;
      const colWidth = (innerWidth - (TOTAL_ITEMS - 1) * GAP) / TOTAL_ITEMS;
      const step = colWidth + GAP;
      const startLeft = currentThumbLeftRef.current;
      const targetLeft = activeIndex * step;

      const anim = thumbRef.current.animate(
        [
          { transform: `translateX(${startLeft}px) scale(1.05, 0.94)` },
          { transform: `translateX(${targetLeft}px) scale(1, 1)` },
        ],
        {
          duration: 260,
          easing: "cubic-bezier(0.2, 0.9, 0.3, 1)",
          fill: "forwards",
        },
      );
      anim.onfinish = () => {
        if (thumbRef.current) thumbRef.current.style.transform = "";
        try {
          anim.cancel();
        } catch {
          // ignore
        }
      };
    } else if (thumbRef.current) {
      thumbRef.current.style.transform = "";
    }

    touchStartRef.current = null;
    hasDraggedRef.current = false;
    isCancelledRef.current = false;
    setIsDragging(false);
    setDragIndex(null);
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
        <div
          ref={dockRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          className="glass-dock rounded-full p-1 touch-none"
        >
          <div className="relative grid grid-cols-4 items-center gap-1">
            {/* Sliding glass thumb */}
            <div
              ref={thumbRef}
              aria-hidden="true"
              className="glass-thumb absolute bottom-0.5 top-0.5 left-0 rounded-full will-change-transform pointer-events-none"
              style={{
                width: `calc((100% - ${(TOTAL_ITEMS - 1) * GAP}px) / ${TOTAL_ITEMS})`,
                transform: `translateX(calc(${Math.max(displayIndex, 0)} * (100% + ${GAP}px)))`,
                opacity: displayIndex < 0 ? 0 : 1,
                transition: isDragging
                  ? "none"
                  : "transform 360ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease",
              }}
            />

            {/* Navigation links */}
            {MOBILE_NAV_ITEMS.map((item, index) => {
              const isActive = index === displayIndex;
              const isSettings = item.label === "Settings";
              const Icon = item.icon;

              return (
                <ShellLink
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  aria-current={index === activeIndex ? "page" : undefined}
                  onClick={(e) => {
                    if (hasDraggedRef.current) {
                      e.preventDefault();
                      return;
                    }
                    if (isSettings) {
                      handleSettingsClick();
                    } else if (index !== activeIndex) {
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

