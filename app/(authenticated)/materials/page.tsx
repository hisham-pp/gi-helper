"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { DashboardData } from "@/lib/types";

export default function MaterialsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("Traveler");
  const [role, setRole] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/dashboard");
        if (!response.ok) throw new Error("Failed to load");
        const result = await response.json();
        setData(result.data);
        setIsAuthenticated(Boolean(result.user));
        setUsername(result.user?.username ?? "Traveler");
        setRole(result.user?.role);
      } catch (error) {
        console.error("Failed to load materials data", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-96 animate-pulse rounded-2xl bg-surface-variant/20" />
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-outline-variant p-6">
        <p className="text-error font-bold">Unable to load materials data</p>
      </div>
    );
  }

  return (
    <DashboardShell
      initialData={data as DashboardData}
      isAuthenticated={isAuthenticated}
      username={username}
      role={role}
      view="tracker"
    />
  );
}
