import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/auth";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <AppShell userLabel={user?.username} userRole={user?.role}>
      {children}
    </AppShell>
  );
}
