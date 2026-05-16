import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/data";

export default async function MaterialsPage() {
  const user = await requireUser();
  const data = await getDashboardData(user.id);

  return (
    <DashboardShell
      initialData={data}
      username={user.username}
      role={user.role}
    />
  );
}
