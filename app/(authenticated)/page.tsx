"use client";

import { useEffect, useState } from "react";
import { OverviewPage } from "@/components/dashboard/overview-page";
import type { DashboardData } from "@/lib/types";

export default function HomePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [username, setUsername] = useState("Traveler");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const response = await fetch("/api/dashboard");
        if (!response.ok) {
          throw new Error("Failed to load dashboard data");
        }
        const result = await response.json();
        setData(result.data);
        setUsername(result.user?.username ?? "Traveler");
      } catch (err) {
        setError("Unable to load dashboard data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <header className="mb-8">
          <h1 className="text-on-surface text-3xl font-bold tracking-tight">
            General Dashboard
          </h1>
          <p className="text-on-surface-variant mt-2">
            A central home for your Genshin tracker suite.
          </p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg bg-surface-variant/40"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-8">
        <header className="mb-8">
          <h1 className="text-on-surface text-3xl font-bold tracking-tight">
            General Dashboard
          </h1>
        </header>
        <div className="rounded-lg border border-outline-variant p-6">
          <p className="font-bold text-error">
            {error || "Unable to load dashboard data"}
          </p>
        </div>
      </div>
    );
  }

  return <OverviewPage data={data} username={username} />;
}
