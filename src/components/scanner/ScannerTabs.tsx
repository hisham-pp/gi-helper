"use client";

import React, { useRef } from "react";

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
 */
export function ScannerTabs({
  tabs,
  activeIndex,
  onTabChange,
  ariaLabel = "Scanner modes",
}: ScannerTabsProps) {
  const tabButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

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
        className="relative flex w-full max-w-[720px] sm:max-w-[560px] md:max-w-[560px] min-w-[520px] sm:min-w-[320px] items-center gap-1 isolate rounded-full border border-white/10 bg-slate-900/60 p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.12)] backdrop-blur-xl transition-all"
        role="tablist"
        aria-label={ariaLabel}
        data-active={activeIndex}
      >
        {/* Animated Sliding Indicator */}
        <span
          className="pill-tab-indicator pointer-events-none absolute bottom-1.5 left-1.5 top-1.5 z-0 rounded-full border border-teal-400/40 bg-gradient-to-r from-teal-500/90 to-emerald-500/90 shadow-[0_0_18px_rgba(20,184,166,0.45),inset_0_1px_1px_rgba(255,255,255,0.4)] transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            width: "calc((100% - 16px) / 2)",
            transform:
              activeIndex === 0
                ? "translateX(0)"
                : "translateX(calc(100% + 4px))",
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
              className={`relative z-10 flex flex-1 min-w-0 items-center justify-center gap-2 rounded-full py-2.5 px-6 text-sm font-semibold transition-colors duration-250 select-none focus-visible:outline-2 focus-visible:outline-teal-400 focus-visible:outline-offset-2 ${isActive
                ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                : "text-white/60 hover:text-white"
                }`}
            >
              {tab.icon && (
                <span
                  className={`shrink-0 transition-transform ${isActive ? "scale-110 text-white" : "text-white/60"
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
