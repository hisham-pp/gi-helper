"use client";

import { Button } from "@/components/ui/button";
import { tabs, type DashboardTab } from "@/lib/constants";

export function DashboardTabs({
  activeTab,
  onChange,
}: {
  activeTab: DashboardTab;
  onChange: (tab: DashboardTab) => void;
}) {
  return (
    <nav
      className="flex items-center justify-center"
      aria-label="Tracker views"
    >
      <div
        role="tablist"
        className="flex gap-2 rounded-full bg-surface-variant/50 p-1"
      >
        {tabs.map((tab) => (
          <Button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            variant={activeTab === tab ? "filled" : "text"}
            onClick={() => onChange(tab)}
            className="h-10 px-6 capitalize"
          >
            {tab}
          </Button>
        ))}
      </div>
    </nav>
  );
}
