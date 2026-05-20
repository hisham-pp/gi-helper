import { Suspense } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/data";

export default async function InventoryPage() {
  const user = await getCurrentUser();
  const data = await getDashboardData(user?.id);

  return (
    <Suspense
      fallback={
        <div className="h-96 animate-pulse rounded-2xl bg-surface-variant/20" />
      }
    >
      <DashboardShell
        initialData={data}
        username={user?.username ?? "Traveler"}
        role={user?.role}
        view="inventory"
      />
    </Suspense>
  );
}
