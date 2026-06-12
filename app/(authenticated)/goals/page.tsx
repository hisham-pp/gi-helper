import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/data";

export default async function GoalsPage() {
  const user = await getCurrentUser();
  const data = await getDashboardData(user?.id);

  return (
    <DashboardShell
      initialData={data}
      isAuthenticated={Boolean(user)}
      username={user?.username ?? "Traveler"}
      role={user?.role}
      view="goals"
    />
  );
}
