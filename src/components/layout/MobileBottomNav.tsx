"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Backpack, Ellipsis, House, Library } from "lucide-react";
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
  { href: "/more" as Route, label: "More", icon: Ellipsis, match: ["/more", "/settings", "/about", "/feedback", "/versions"] },
];

const GAP = 4;
const TOTAL_ITEMS = 4; // Home, Inventory, Database, More

/**
 * Fixed bottom navigation bar for mobile devices.
 * Always visible at the bottom of the viewport with safe-area spacing,
 * routing to Home, Inventory, Database, and the More page.
 * Supports iOS-style smooth drag-to-switch across tabs with tactile haptic ticks.
 */
export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const [hasHydrated, setHasHydrated] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [optimisticIndex, setOptimisticIndex] = useState<number | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // Rewrites can make the browser pathname differ from the server-rendered path.
  const routeActiveIndex = MOBILE_NAV_ITEMS.findIndex(
    (item) =>
      isCurrent(pathname, item.href) ||
      item.match?.some((path) => isCurrent(pathname, path)),
  );
  const activeIndex = hasHydrated ? routeActiveIndex : -1;

  const dockRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const prevIndexRef = useRef(routeActiveIndex);

  // References to track touch gesture without React re-render lag
  const isDraggingRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const hasDraggedRef = useRef(false);
  const currentDragIndexRef = useRef<number | null>(null);
  const currentThumbLeftRef = useRef(0);
  const justDraggedRef = useRef(false);
  const lastDragTimeRef = useRef(0);

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

  // Follow the active/optimistic tab when NOT actively dragging
  useLayoutEffect(() => {
    if (isDraggingRef.current) return;
    const targetX = `calc(${Math.max(displayIndex, 0)} * (100% + ${GAP}px))`;
    if (thumbRef.current) {
      thumbRef.current.style.transition = reducedMotion
        ? "none"
        : "transform 360ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease";
      thumbRef.current.style.transform = `translateX(${targetX})`;
    }
  }, [displayIndex, reducedMotion]);

  // Non-passive native touch listener on dock to prevent browser cancel gestures
  useEffect(() => {
    const el = dockRef.current;
    if (!el) return;

    const onNativeTouchMove = (e: TouchEvent) => {
      if (isDraggingRef.current && e.cancelable) {
        e.preventDefault();
      }
    };

    el.addEventListener("touchmove", onNativeTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", onNativeTouchMove);
  }, []);

  // Smooth squash-and-stretch sliding animation when route changes via tap
  useEffect(() => {
    const prevIndex = prevIndexRef.current;
    prevIndexRef.current = activeIndex;
    if (justDraggedRef.current) {
      justDraggedRef.current = false;
      return;
    }
    if (prevIndex === activeIndex || activeIndex < 0 || reducedMotion || isDraggingRef.current) return;

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



  const commitTabSelection = (targetIndex: number) => {
    const finalIndex = Math.max(0, Math.min(targetIndex, TOTAL_ITEMS - 1));
    isDraggingRef.current = false;
    hasDraggedRef.current = false;
    lastDragTimeRef.current = Date.now();
    justDraggedRef.current = true;

    setOptimisticIndex(finalIndex);
    setDragIndex(null);

    // Smoothly spring indicator into the target tab slot
    if (thumbRef.current && !reducedMotion) {
      const targetX = `calc(${finalIndex} * (100% + ${GAP}px))`;
      thumbRef.current.style.transition = "transform 320ms cubic-bezier(0.2, 0.9, 0.3, 1)";
      thumbRef.current.style.transform = `translateX(${targetX}) scale(1, 1)`;
    }

    const item = MOBILE_NAV_ITEMS[finalIndex];

    if (finalIndex !== activeIndex) {
      triggerHaptic("dragSnap");
      router.push(item.href);
    } else {
      triggerHaptic("selection");
    }
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
    isDraggingRef.current = false;

    const dockPadding = 4;
    const innerWidth = rect.width - 2 * dockPadding;
    const colWidth = (innerWidth - (TOTAL_ITEMS - 1) * GAP) / TOTAL_ITEMS;
    const step = colWidth + GAP;

    // Detect which tab was initially touched
    const relX = touch.clientX - rect.left - dockPadding;
    const clampedRelX = Math.max(0, Math.min(relX, innerWidth));
    const initialIndex = Math.min(
      Math.floor(clampedRelX / (innerWidth / TOTAL_ITEMS)),
      TOTAL_ITEMS - 1,
    );
    currentDragIndexRef.current = initialIndex;

    const targetThumbLeft = relX - colWidth / 2;
    const maxLeft = (TOTAL_ITEMS - 1) * step;
    currentThumbLeftRef.current = Math.max(0, Math.min(targetThumbLeft, maxLeft));

    if (thumbRef.current) {
      thumbRef.current.style.transition = "none";
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const rect = dockRef.current?.getBoundingClientRect();
    if (!rect) return;

    const dx = touch.clientX - touchStartRef.current.x;

    // Detect horizontal drag intent (threshold of 4px)
    if (!hasDraggedRef.current) {
      if (Math.abs(dx) > 4) {
        hasDraggedRef.current = true;
        isDraggingRef.current = true;
      } else {
        return;
      }
    }

    const dockPadding = 4; // p-1 = 4px
    const innerWidth = rect.width - 2 * dockPadding;
    const colWidth = (innerWidth - (TOTAL_ITEMS - 1) * GAP) / TOTAL_ITEMS;
    const step = colWidth + GAP;

    // Direct tracking: center the thumb right under the finger horizontally
    const relX = touch.clientX - rect.left - dockPadding;
    const targetThumbLeft = relX - colWidth / 2;
    const maxLeft = (TOTAL_ITEMS - 1) * step;
    const clampedThumbLeft = Math.max(0, Math.min(targetThumbLeft, maxLeft));
    currentThumbLeftRef.current = clampedThumbLeft;

    if (thumbRef.current && !reducedMotion) {
      thumbRef.current.style.transition = "none";
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
      triggerHaptic("dragTick");
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current) return;

    const hadDragged = hasDraggedRef.current;
    const targetIndex = currentDragIndexRef.current;

    touchStartRef.current = null;

    if (hadDragged && targetIndex !== null && targetIndex >= 0) {
      e.preventDefault();
      commitTabSelection(targetIndex);
    } else {
      isDraggingRef.current = false;
      hasDraggedRef.current = false;
      setDragIndex(null);
    }
  };

  const handleTouchCancel = () => {
    const hadDragged = hasDraggedRef.current;
    const targetIndex = currentDragIndexRef.current;

    touchStartRef.current = null;

    if (hadDragged && targetIndex !== null && targetIndex >= 0) {
      commitTabSelection(targetIndex);
    } else {
      isDraggingRef.current = false;
      hasDraggedRef.current = false;
      setDragIndex(null);
    }
  };

  return (
    <>

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
            {/* Sliding glass thumb - controlled directly to eliminate React style overwriting during drag */}
            <div
              ref={thumbRef}
              aria-hidden="true"
              className="glass-thumb absolute bottom-0.5 top-0.5 left-0 rounded-full will-change-transform pointer-events-none"
              style={{
                width: `calc((100% - ${(TOTAL_ITEMS - 1) * GAP}px) / ${TOTAL_ITEMS})`,
                opacity: displayIndex < 0 ? 0 : 1,
              }}
            />

            {/* Navigation links */}
            {MOBILE_NAV_ITEMS.map((item, index) => {
              const isActive = index === displayIndex;
              const isMore = item.label === "More";
              const Icon = item.icon;

              return (
                <ShellLink
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  aria-label={item.label}
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  aria-current={index === activeIndex ? "page" : undefined}
                  onClick={(e) => {
                    // Suppress click if it was dispatched right after a touch drag gesture
                    if (Date.now() - lastDragTimeRef.current < 650) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    if (index !== activeIndex) {
                      triggerHaptic("selection");
                    }
                  }}
                  className={`relative z-10 flex flex-col items-center justify-center gap-1 rounded-full py-4 px-1 text-[12px] font-semibold transition-[color,transform] duration-200 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 touch-none select-none ${
                    isActive
                      ? "text-white dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                      : "text-white/55 hover:text-white/85"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform duration-300 pointer-events-none ${
                      isActive
                        ? isMore
                          ? "scale-110 text-violet-400 dark:text-violet-300 drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]"
                          : "scale-110 text-cyan-600 dark:text-cyan-200 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                        : "text-white/50"
                    }`}
                  />
                </ShellLink>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
