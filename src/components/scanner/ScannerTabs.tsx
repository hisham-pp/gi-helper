"use client";

import React, { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

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

    onTabChange(nextIndex);
    tabButtonRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex w-full justify-center">
      <div
        className="glass-track flex w-full max-w-[420px] items-center gap-1 p-1.5"
        role="tablist"
        aria-label={ariaLabel}
        data-active={activeIndex}
      >
        {/* Raised Glass Thumb Indicator */}
        <div
          ref={indicatorRef}
          className="glass-thumb"
          style={{
            width: "calc((100% - 12px) / 2)",
            transform:
              activeIndex === 0
                ? "translateX(0)"
                : "translateX(100%)",
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
              onClick={() => onTabChange(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`relative z-10 flex flex-1 min-w-0 items-center justify-center gap-2 rounded-full py-2.5 px-5 text-sm font-semibold transition-all duration-200 select-none focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2 ${
                isActive
                  ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                  : "text-white/55 hover:text-white/85"
              }`}
            >
              {tab.icon && (
                <span
                  className={`shrink-0 transition-colors ${
                    isActive
                      ? "text-cyan-200 drop-shadow-[0_0_6px_rgba(103,232,249,0.6)]"
                      : "text-white/45"
                  }`}
                >
                  {tab.icon}
                </span>
              )}
              <span className="whitespace-nowrap tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
