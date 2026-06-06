"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardPageLoading } from "@/components/ui/page-loading";
import type { DashboardData } from "@/lib/types";

type DashboardClientPageProps = {
  view: "tracker" | "inventory" | "goals";
};

type ApiUser = {
  username: string;
  role?: string;
} | null;

type DashboardPayload = {
  data: DashboardData;
  user: ApiUser;
};

export function DashboardClientPage({ view }: DashboardClientPageProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [user, setUser] = useState<ApiUser>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadDashboard = useCallback(
    async ({ showLoading = false }: { showLoading?: boolean } = {}) => {
      if (showLoading) {
        setIsLoading(true);
      }

      try {
        const response = await fetch(`/api/dashboard?view=${view}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load dashboard data.");
        }

        const payload = (await response.json()) as DashboardPayload;

        setData(payload.data);
        setUser(payload.user);
        setLoadError(null);
        return payload.data;
      } catch (error) {
        console.error("Dashboard data load failed", error);
        setLoadError("Unable to load this page right now.");
        toast.error("Unable to load this page.");
        return null;
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [view],
  );

  useEffect(() => {
    void loadDashboard({ showLoading: true });
  }, [loadDashboard]);

  if (isLoading) {
    return <DashboardPageLoading view={view} />;
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-outline-variant bg-surface p-8">
        <h1 className="text-on-surface text-2xl font-bold">
          {loadError ?? "Unable to load this page."}
        </h1>
        <p className="text-on-surface-variant mt-3 text-sm">
          Refresh the page or try again in a moment.
        </p>
      </div>
    );
  }

  return (
    <DashboardShell
      initialData={data}
      isAuthenticated={Boolean(user)}
      username={user?.username ?? "Traveler"}
      role={user?.role}
      view={view}
      onRefresh={() => loadDashboard()}
    />
  );
}
