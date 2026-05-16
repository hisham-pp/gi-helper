import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getDashboardData } from "@/lib/data";

export default async function HomePage() {
  const data = await getDashboardData();

  return <DashboardShell initialData={data} />;
}
