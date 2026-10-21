"use client";

import React, { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { haptics } from "@/lib/haptics";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  panelId: string;
}

interface ScannerTabsProps {
  tabs: TabItem[];
  activeIndex: number;
  onTabChange: (index: number) => void;
  ariaLabel?: string;
}

/**
 * Animated Pill Tabs with smooth sliding indicator and keyboard accessibility.
 * Supports Left/Right arrow navigation, Home, End, and theme-matching glassmorphic styling.
 * The indicator is a raised glass thumb in a recessed glass track
 * (styles in src/styles/glass.css).
 */
export function ScannerTabs({
  tabs,
  activeIndex,
  onTabChange,
  ariaLabel = "Scanner modes",
}: ScannerTabsProps) {
  const tabButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const prevIndexRef = useRef(activeIndex);
  const reducedMotion = usePrefersReducedMotion();

  // The thumb stretches while it travels, then settles back like a soft lens.
  useEffect(() => {
    const prevIndex = prevIndexRef.current;
    prevIndexRef.current = activeIndex;
    if (prevIndex === activeIndex || reducedMotion) return;

    indicatorRef.current?.animate(
      [
        { scale: "1 1" },
        { scale: "1.06 0.92", offset: 0.35 },
        { scale: "0.98 1.03", offset: 0.7 },
        { scale: "1 1" },
      ],
      { duration: 520, easing: "ease-out" },
    );
  }, [activeIndex, reducedMotion]);

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    let nextIndex = index;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      nextIndex = (index + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      event.preventDefault();
      nextIndex = 0;
    } else if (event.key === "End") {
      event.preventDefault();
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    if (nextIndex !== index) {
      haptics.selection();
    }
    onTabChange(nextIndex);
    tabButtonRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex w-full justify-center">
      <div
        className={`glass-track flex w-full items-center gap-1 p-1.5 ${tabs.length > 2 ? "max-w-[520px]" : "max-w-[420px]"}`}
        role="tablist"
        aria-label={ariaLabel}
        data-active={activeIndex}
      >
        {/* Raised Glass Thumb Indicator */}
        <div
          ref={indicatorRef}
          className="glass-thumb pointer-events-none"
          style={{
            // Track padding is 6px per side and buttons are 4px apart (gap-1).
            width: `calc((100% - 12px - ${(tabs.length - 1) * 4}px) / ${tabs.length})`,
            transform: `translateX(calc(${activeIndex} * (100% + 4px)))`,
            transition: reducedMotion
              ? "none"
              : "transform 360ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease",
          }}
          aria-hidden="true"
        />

        {/* Tab Buttons */}
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabButtonRefs.current[index] = el;
              }}
              id={`${tab.id}-tab`}
              role="tab"
              aria-selected={isActive}
              aria-controls={tab.panelId}
              tabIndex={isActive ? 0 : -1}
              data-index={index}
              onClick={() => {
                if (index !== activeIndex) {
                  haptics.selection();
                }
                onTabChange(index);
              }}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full px-2.5 py-2 font-semibold transition-[color,transform] duration-200 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 select-none sm:px-3 sm:py-2.5 ${
                isActive
                  ? "text-white dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                  : "text-white/60 hover:text-white/85"
              }`}
            >
              {tab.icon && (
                <span
                  className={`flex items-center justify-center transition-transform duration-200 ${
                    isActive
                      ? "text-cyan-600 dark:text-cyan-200 scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                      : "text-white/50"
                  }`}
                >
                  {tab.icon}
                </span>
              )}
              <span className="whitespace-nowrap text-xs sm:text-sm">
                {tab.label}
              </span>
              {tab.badge && (
                <span className="rounded-full bg-cyan-500/20 dark:bg-cyan-400/20 px-1.5 py-0.5 text-[10px] font-bold text-cyan-700 dark:text-cyan-200 border border-cyan-500/30 dark:border-cyan-400/30">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
