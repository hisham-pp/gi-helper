import { InteractiveTeyvatMap } from "@/components/dashboard/map/interactive-teyvat-map";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/auth";

export default async function MapPage() {
  const user = await getCurrentUser();

  return (
    <AppShell userLabel={user?.username} userRole={user?.role}>
      <InteractiveTeyvatMap isAuthenticated={Boolean(user)} />
    </AppShell>
  );
}
