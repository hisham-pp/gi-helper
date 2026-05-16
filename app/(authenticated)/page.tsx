import { OverviewPage } from "@/components/dashboard/overview-page";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/data";

export default async function HomePage() {
  const user = await requireUser();
  const data = await getDashboardData(user.id);

  return <OverviewPage data={data} username={user.username} />;
}
