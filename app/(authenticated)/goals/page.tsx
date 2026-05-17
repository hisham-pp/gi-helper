import { Suspense } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/data";

export default async function GoalsPage() {
  const user = await requireUser();
  const data = await getDashboardData(user.id);

  return (
    <Suspense
      fallback={
        <div className="h-96 animate-pulse rounded-2xl bg-surface-variant/20" />
      }
    >
      <DashboardShell
        initialData={data}
        username={user.username}
        role={user.role}
        view="goals"
      />
    </Suspense>
  );
}
